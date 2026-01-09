/**
 * Logger centralizado con Pino
 * Soporta Edge Runtime (middleware) y Node.js Runtime (APIs)
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

interface LoggerInterface {
  debug(context: LogContext | string, message?: string): void;
  info(context: LogContext | string, message?: string): void;
  warn(context: LogContext | string, message?: string): void;
  error(context: LogContext | string, message?: string): void;
  child(context: LogContext): LoggerInterface;
}

/**
 * Detectar si estamos en Edge Runtime
 * NO accede a process.versions para evitar warnings de Next.js
 */
function isEdgeRuntime(): boolean {
  // Verificar EdgeRuntime en globalThis (más seguro para Edge)
  if (typeof globalThis !== "undefined" && "EdgeRuntime" in globalThis) {
    return true;
  }

  // Si process no existe, estamos en Edge Runtime
  if (typeof process === "undefined") {
    return true;
  }

  // Verificar si estamos en un entorno browser
  if (typeof window !== "undefined") {
    return true;
  }

  // Por defecto, asumir Node.js Runtime si process existe
  return false;
}

/**
 * Obtener log level de forma segura para Edge Runtime
 */
function getLogLevel(): LogLevel {
  if (typeof process === "undefined" || !process.env) {
    return "info";
  }
  return (process.env.LOG_LEVEL as LogLevel) || "info";
}

/**
 * Logger simplificado para Edge Runtime (middleware)
 * No usa Pino porque Edge Runtime tiene limitaciones
 */
class EdgeLogger implements LoggerInterface {
  private level: LogLevel;
  private baseContext: LogContext;

  constructor(level: LogLevel = "info", baseContext: LogContext = {}) {
    this.level = level;
    this.baseContext = baseContext;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(context: LogContext | string, message?: string): string {
    if (typeof context === "string") {
      return context;
    }
    const merged = { ...this.baseContext, ...context };
    const contextStr = JSON.stringify(merged);
    return message ? `${message} ${contextStr}` : contextStr;
  }

  debug(context: LogContext | string, message?: string): void {
    if (this.shouldLog("debug")) {
      console.debug("[DEBUG]", this.formatMessage(context, message));
    }
  }

  info(context: LogContext | string, message?: string): void {
    if (this.shouldLog("info")) {
      console.info("[INFO]", this.formatMessage(context, message));
    }
  }

  warn(context: LogContext | string, message?: string): void {
    if (this.shouldLog("warn")) {
      console.warn("[WARN]", this.formatMessage(context, message));
    }
  }

  error(context: LogContext | string, message?: string): void {
    if (this.shouldLog("error")) {
      console.error("[ERROR]", this.formatMessage(context, message));
    }
  }

  child(context: LogContext): LoggerInterface {
    return new EdgeLogger(this.level, { ...this.baseContext, ...context });
  }
}

/**
 * Logger con Pino para Node.js Runtime (APIs)
 * NUNCA se ejecuta en Edge Runtime
 */
let pinoLogger: any = null;

function createPinoLogger(): any {
  // Esta función SOLO se llama desde Node.js Runtime
  // Nunca se ejecuta en Edge Runtime debido a la verificación en Logger constructor

  if (typeof window !== "undefined") {
    // Cliente: logger simplificado
    const logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || "info";
    return new EdgeLogger(logLevel as LogLevel);
  }

  // Solo importar Pino en Node.js Runtime (nunca en Edge Runtime)
  try {
    const pino = require("pino");
    const isDevelopment = process.env.NODE_ENV === "development";
    const logLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

    // Deshabilitar transport en desarrollo para evitar problemas con worker threads
    // en Next.js/Turbopack. Los logs se mostrarán en formato JSON que es más seguro.
    // Si necesitas logs formateados, puedes usar pino-pretty manualmente en la terminal.
    const transportConfig = undefined; // Deshabilitado para evitar errores de worker threads

    return pino({
      level: logLevel,
      transport: transportConfig,
      formatters: {
        level: (label: string) => {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      // En desarrollo, hacer los logs más legibles sin usar worker threads
      ...(isDevelopment && {
        prettyPrint: false, // No usar pretty print (requiere worker threads)
      }),
    });
  } catch (error) {
    // Fallback a logger simplificado si Pino no está disponible
    return new EdgeLogger(getLogLevel());
  }
}

/**
 * Logger principal
 * Detecta automáticamente el runtime y usa el logger apropiado
 */
class Logger implements LoggerInterface {
  private logger: any;

  constructor() {
    // Detectar runtime ANTES de cualquier acceso a process.versions
    const isEdge = isEdgeRuntime();

    if (isEdge) {
      // En Edge Runtime, usar logger simplificado
      // No acceder a process.env aquí, usar función segura
      this.logger = new EdgeLogger(getLogLevel());
    } else {
      // En Node.js Runtime, usar Pino
      // createPinoLogger puede acceder a process.versions de forma segura
      if (!pinoLogger) {
        pinoLogger = createPinoLogger();
      }
      this.logger = pinoLogger;
    }
  }

  debug(context: LogContext | string, message?: string): void {
    if (typeof context === "string") {
      this.logger.debug(message || context);
    } else {
      this.logger.debug(context, message);
    }
  }

  info(context: LogContext | string, message?: string): void {
    if (typeof context === "string") {
      this.logger.info(message || context);
    } else {
      this.logger.info(context, message);
    }
  }

  warn(context: LogContext | string, message?: string): void {
    if (typeof context === "string") {
      this.logger.warn(message || context);
    } else {
      this.logger.warn(context, message);
    }
  }

  error(context: LogContext | string, message?: string): void {
    if (typeof context === "string") {
      this.logger.error(message || context);
    } else {
      this.logger.error(context, message);
    }
  }

  child(context: LogContext): LoggerInterface {
    if (this.logger.child) {
      return this.logger.child(context);
    }
    // Fallback para EdgeLogger
    return new EdgeLogger(this.logger.level || "info", {
      ...this.logger.baseContext,
      ...context,
    });
  }
}

// Exportar instancia singleton
// En Edge Runtime, usará EdgeLogger automáticamente
// En Node.js Runtime, usará Pino automáticamente
export const logger = new Logger();

// Exportar tipos
export type { LogContext, LogLevel, LoggerInterface };
