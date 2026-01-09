import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en milisegundos
  maxRequests: number; // Máximo número de requests
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpiar entradas expiradas cada 5 minutos
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now && (!entry.blockUntil || entry.blockUntil < now)) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export class RateLimitMiddleware {
  private static instance: RateLimitMiddleware;
  private store = new RateLimitStore();

  static getInstance(): RateLimitMiddleware {
    if (!RateLimitMiddleware.instance) {
      RateLimitMiddleware.instance = new RateLimitMiddleware();
    }
    return RateLimitMiddleware.instance;
  }

  async checkLimit(
    request: NextRequest,
    config: RateLimitConfig,
    identifier?: string
  ): Promise<{
    success: boolean;
    remaining?: number;
    resetTime?: number;
    response?: NextResponse;
  }> {
    const key = this.getKey(request, identifier);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let entry = this.store.get(key);

    // Si no existe entrada o ha expirado, crear nueva
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    // Verificar si está bloqueado
    if (entry.blocked && entry.blockUntil && entry.blockUntil > now) {
      return {
        success: false,
        response: this.createRateLimitResponse(
          config.message || "Too many requests",
          config.windowMs,
          0,
          entry.blockUntil
        ),
      };
    }

    // Incrementar contador
    entry.count++;

    // Verificar si excede el límite
    if (entry.count > config.maxRequests) {
      // Bloquear por el doble del tiempo de ventana
      entry.blocked = true;
      entry.blockUntil = now + config.windowMs * 2;

      this.store.set(key, entry);

      return {
        success: false,
        response: this.createRateLimitResponse(
          config.message || "Too many requests",
          config.windowMs,
          0,
          entry.blockUntil
        ),
      };
    }

    // Guardar entrada actualizada
    this.store.set(key, entry);

    const remaining = Math.max(0, config.maxRequests - entry.count);

    return {
      success: true,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  private getKey(request: NextRequest, identifier?: string): string {
    if (identifier) {
      return `rate_limit:${identifier}`;
    }

    // Usar IP como identificador por defecto
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Crear clave basada en IP y User-Agent para mayor precisión
    return `rate_limit:${ip}:${userAgent.substring(0, 50)}`;
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    return "127.0.0.1";
  }

  private createRateLimitResponse(
    message: string,
    windowMs: number,
    remaining: number,
    resetTime?: number
  ): NextResponse {
    const response = NextResponse.json(
      {
        success: false,
        error: message,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: resetTime
          ? Math.ceil((resetTime - Date.now()) / 1000)
          : Math.ceil(windowMs / 1000),
      },
      { status: 429 }
    );

    // Agregar headers estándar de rate limiting
    response.headers.set("X-RateLimit-Limit", "1000"); // Límite por defecto
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set(
      "X-RateLimit-Reset",
      resetTime
        ? Math.ceil(resetTime / 1000).toString()
        : Math.ceil((Date.now() + windowMs) / 1000).toString()
    );

    if (resetTime) {
      response.headers.set("Retry-After", Math.ceil((resetTime - Date.now()) / 1000).toString());
    }

    return response;
  }

  // Configuraciones predefinidas
  static readonly CONFIGS = {
    // Límites generales
    GENERAL: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxRequests: 1000,
      message: "Too many requests from this IP",
    },

    // Límites para autenticación (ajustados para desarrollo)
    AUTH: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxRequests: process.env.NODE_ENV === "development" ? 50 : 10, // 50 en dev, 10 en prod
      message: "Too many authentication attempts",
    },

    // Límites para APIs críticas
    CRITICAL: {
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: process.env.NODE_ENV === "development" ? 100 : 10, // Más permisivo en dev
      message: "Too many requests to critical endpoint",
    },

    // Límites para creación de recursos
    CREATE: {
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: process.env.NODE_ENV === "development" ? 50 : 20, // Más permisivo en dev
      message: "Too many creation requests",
    },

    // Límites para pagos
    PAYMENT: {
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: process.env.NODE_ENV === "development" ? 20 : 5, // Más permisivo en dev
      message: "Too many payment requests",
    },

    // Límites para reportes
    REPORTS: {
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: process.env.NODE_ENV === "development" ? 50 : 10, // Más permisivo en dev
      message: "Too many report requests",
    },

    // Configuración especial para pruebas automatizadas
    TESTING: {
      windowMs: 60 * 1000, // 1 minuto
      maxRequests: 200, // Muy permisivo para pruebas
      message: "Too many test requests",
    },
  };
}

// Función helper para usar en API routes
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): Promise<{ success: boolean; remaining?: number; resetTime?: number; response?: NextResponse }> {
  const rateLimitMiddleware = RateLimitMiddleware.getInstance();
  return await rateLimitMiddleware.checkLimit(request, config, identifier);
}

// Función helper para rate limiting por usuario autenticado
export async function withUserRateLimit(
  request: NextRequest,
  userId: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining?: number; resetTime?: number; response?: NextResponse }> {
  return await withRateLimit(request, config, `user:${userId}`);
}

// Función helper para rate limiting por endpoint
export async function withEndpointRateLimit(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining?: number; resetTime?: number; response?: NextResponse }> {
  return await withRateLimit(request, config, `endpoint:${endpoint}`);
}

// Función helper para pruebas automatizadas (muy permisiva)
export async function withTestingRateLimit(
  request: NextRequest,
  identifier?: string
): Promise<{ success: boolean; remaining?: number; resetTime?: number; response?: NextResponse }> {
  return await withRateLimit(
    request,
    RateLimitMiddleware.CONFIGS.TESTING,
    `testing:${identifier || "default"}`
  );
}

// Función helper para desarrollo (detecta automáticamente el entorno)
export async function withDevFriendlyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): Promise<{ success: boolean; remaining?: number; resetTime?: number; response?: NextResponse }> {
  // En desarrollo, usar configuración más permisiva
  const devConfig =
    process.env.NODE_ENV === "development"
      ? {
          ...config,
          maxRequests: Math.max(config.maxRequests * 5, 50), // 5x más permisivo o mínimo 50
        }
      : config;

  return await withRateLimit(request, devConfig, identifier);
}
