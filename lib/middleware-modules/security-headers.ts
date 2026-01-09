/**
 * Security Headers
 *
 * Aplica headers de seguridad a todas las respuestas HTTP.
 */

import { NextResponse } from "next/server";

/**
 * Aplica security headers a una respuesta
 *
 * @param response - La respuesta de NextResponse
 * @returns La respuesta con headers de seguridad aplicados
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";

  // Content Security Policy (CSP) - Moderado para desarrollo
  // Para producción, aumentar restricciones
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval solo para desarrollo
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  // Aplicar headers de seguridad
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  // HSTS solo en producción (HTTPS)
  if (isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}
