import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

/**
 * Obtiene el secret JWT desde las variables de entorno
 */
function getJwtSecret(): string {
  return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-key";
}

/**
 * Payload estándar para tokens JWT de autenticación
 */
export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  customId: string;
  currentMembershipId?: string | null;
  companyName?: string | null;
  hasCompletedPurchase?: boolean;
  purchaseDate?: Date | null;
  membershipId?: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Opciones de configuración para firmar tokens JWT
 */
const JWT_SIGN_OPTIONS: jwt.SignOptions = {
  algorithm: "HS256",
  expiresIn: "30d",
};

/**
 * Genera un token JWT para autenticación
 * @param payload - Datos del usuario a incluir en el token
 * @returns Token JWT firmado
 */
export function generateAuthToken(payload: AuthTokenPayload): string {
  const secret = getJwtSecret();

  const tokenPayload: AuthTokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(tokenPayload, secret, JWT_SIGN_OPTIONS);
}

/**
 * Genera un token JWT para confirmación de email
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @param expiresIn - Tiempo de expiración (default: 24h)
 * @returns Token JWT firmado
 */
export function generateConfirmationToken(
  userId: string,
  email: string,
  expiresIn: string = "24h"
): string {
  const secret = getJwtSecret();

  return jwt.sign({ userId, email }, secret, {
    algorithm: "HS256",
    expiresIn,
  } as jwt.SignOptions);
}

/**
 * Verifica y decodifica un token JWT
 * @param token - Token JWT a verificar
 * @returns Payload decodificado o null si es inválido
 */
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica y decodifica un token JWT de confirmación
 * @param token - Token JWT a verificar
 * @returns Payload decodificado con userId y email, o null si es inválido
 */
export function verifyConfirmationToken(token: string): { userId: string; email: string } | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decodifica un token JWT sin verificar la firma (solo para lectura)
 * Útil para obtener información del token sin validar
 * @param token - Token JWT a decodificar
 * @returns Payload decodificado o null si el formato es inválido
 */
export function decodeAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.decode(token) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}
