/**
 * Validación de Autenticación
 *
 * Valida tokens JWT y extrae información del usuario.
 */

import { NextRequest } from "next/server";
import { JWT_CONFIG } from "./config";

/**
 * Payload del token JWT
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  hasCompletedPurchase?: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Resultado de la validación del token
 */
export interface TokenValidationResult {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
}

/**
 * Extrae el token del request (header o cookies)
 *
 * @param request - El NextRequest entrante
 * @returns El token o null si no se encuentra
 */
export function extractToken(request: NextRequest): string | null {
  // Obtener token del header Authorization
  const authHeader = request.headers.get("authorization");
  let token = authHeader?.replace("Bearer ", "");

  // Si no hay token en el header, buscar en las cookies
  if (!token) {
    const cookieToken = request.cookies.get("accessToken")?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }

  return token || null;
}

/**
 * Valida un token JWT sin verificar la firma
 *
 * Nota: En Edge Runtime no se puede verificar la firma del JWT.
 * La verificación completa con firma se hace en los API routes con verifyAuthToken.
 *
 * @param token - El token JWT a validar
 * @returns Resultado de la validación
 */
export function validateToken(token: string): TokenValidationResult {
  try {
    // Decodificar JWT (sin verificar firma para Edge Runtime)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return {
        isValid: false,
        error: "Token JWT inválido: formato incorrecto",
      };
    }

    // Decodificar payload
    const payload = JSON.parse(atob(parts[1])) as JWTPayload;

    // Verificaciones de seguridad básicas
    if (!payload.userId || !payload.email || !payload.role) {
      return {
        isValid: false,
        error: "Token JWT inválido: payload incompleto",
      };
    }

    // Verificar que el token no haya expirado
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return {
        isValid: false,
        error: "Token expirado",
      };
    }

    // Verificar que el token no sea muy antiguo
    if (payload.iat && now - payload.iat > JWT_CONFIG.MAX_AGE_SECONDS) {
      return {
        isValid: false,
        error: "Token muy antiguo",
      };
    }

    return {
      isValid: true,
      payload,
    };
  } catch {
    return {
      isValid: false,
      error: "Error al decodificar token",
    };
  }
}
