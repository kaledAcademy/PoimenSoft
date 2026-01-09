import { NextResponse } from "next/server";

/**
 * Configuración de cookies HttpOnly para autenticación
 */
const COOKIE_NAME = "accessToken";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 días en segundos
const COOKIE_PATH = "/";

/**
 * Crea una cookie HttpOnly con el token JWT
 * @param token - Token JWT a almacenar
 * @param response - Objeto NextResponse donde se establecerá la cookie
 * @returns String con las opciones de la cookie
 */
export function createAuthCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = [
    `${COOKIE_NAME}=${token}`,
    `Path=${COOKIE_PATH}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    `HttpOnly`, // No accesible desde JavaScript
    `SameSite=Strict`, // Protección CSRF
    isProduction ? `Secure` : "", // Solo HTTPS en producción
  ]
    .filter(Boolean)
    .join("; ");

  return cookieOptions;
}

/**
 * Limpia la cookie de autenticación estableciendo Max-Age=0
 * @returns String con las opciones de la cookie para limpiarla
 */
export function clearAuthCookie(): string {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = [
    `${COOKIE_NAME}=`,
    `Path=${COOKIE_PATH}`,
    `Max-Age=0`, // Expirar inmediatamente
    `HttpOnly`,
    `SameSite=Strict`,
    isProduction ? `Secure` : "",
  ]
    .filter(Boolean)
    .join("; ");

  return cookieOptions;
}

/**
 * Establece la cookie de autenticación en una respuesta NextResponse
 * @param response - Objeto NextResponse donde se establecerá la cookie
 * @param token - Token JWT a almacenar
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  const cookieOptions = createAuthCookie(token);
  response.headers.set("Set-Cookie", cookieOptions);
}

/**
 * Limpia la cookie de autenticación en una respuesta NextResponse
 * @param response - Objeto NextResponse donde se limpiará la cookie
 */
export function removeAuthCookie(response: NextResponse): void {
  const cookieOptions = clearAuthCookie();
  response.headers.set("Set-Cookie", cookieOptions);
}

/**
 * Calcula la fecha de expiración de la cookie
 * @returns Date con la fecha de expiración (30 días desde ahora)
 */
export function getCookieExpirationDate(): Date {
  return new Date(Date.now() + COOKIE_MAX_AGE * 1000);
}
