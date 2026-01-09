/**
 * Middleware Principal - Orquestador
 *
 * Este middleware coordina las diferentes funcionalidades:
 * - Detección de tenant (multi-tenant)
 * - Validación de autenticación
 * - Control de acceso
 * - Headers de seguridad
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  detectTenantSlug,
  applySecurityHeaders,
  extractToken,
  validateToken,
  isPublicPath,
  isProtectedPath,
  canAccessDashboard,
  shouldRedirectToLogin,
  isApiRoute,
} from "@/lib/middleware-modules";

/**
 * Genera un request ID único
 */
function generateRequestId(): string {
  return crypto.randomUUID();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = generateRequestId();
  const requestLogger = logger.child({ requestId, path: pathname, method: request.method });

  requestLogger.debug({}, "Middleware processing request");

  // Agregar request ID a los headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // ============================================
  // DETECCIÓN DE TENANT (MULTI-TENANT)
  // ============================================
  const tenantSlug = detectTenantSlug(request);

  if (tenantSlug) {
    requestLogger.info({ tenant: tenantSlug }, "Tenant detected from subdomain");
    requestHeaders.set("x-tenant-slug", tenantSlug);

    // Si la ruta NO empieza con /tenant/, reescribir internamente
    if (!pathname.startsWith("/tenant/")) {
      const tenantPath = `/tenant/${tenantSlug}${pathname}`;
      const url = request.nextUrl.clone();
      url.pathname = tenantPath;

      requestLogger.debug(
        { original: pathname, rewritten: tenantPath },
        "Rewriting to tenant path"
      );

      const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
      response.headers.set("x-request-id", requestId);
      response.headers.set("x-tenant-slug", tenantSlug);
      return applySecurityHeaders(response);
    }
  }

  // ============================================
  // VERIFICACIÓN DE RUTAS PÚBLICAS
  // ============================================
  if (isPublicPath(pathname)) {
    requestLogger.debug({}, "Public route access");
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-request-id", requestId);
    return applySecurityHeaders(response);
  }

  // Si no es pública ni protegida, permitir acceso
  if (!isProtectedPath(pathname)) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-request-id", requestId);
    return applySecurityHeaders(response);
  }

  // ============================================
  // VALIDACIÓN DE AUTENTICACIÓN
  // ============================================
  const token = extractToken(request);

  if (!token) {
    requestLogger.warn({}, "Unauthorized: No token found");
    return handleUnauthorized(request, requestId, pathname);
  }

  const validationResult = validateToken(token);

  if (!validationResult.isValid || !validationResult.payload) {
    requestLogger.error(
      { error: validationResult.error, path: pathname },
      "Token validation failed"
    );
    return handleUnauthorized(request, requestId, pathname);
  }

  const { payload } = validationResult;
  requestLogger.info(
    { userId: payload.userId, email: payload.email, role: payload.role },
    "Token validated successfully"
  );

  // ============================================
  // CONTROL DE ACCESO AL DASHBOARD
  // ============================================
  if (pathname.startsWith("/dashboard")) {
    const accessResult = canAccessDashboard(payload);

    if (!accessResult.allowed) {
      requestLogger.warn(
        { userId: payload.userId, email: payload.email, path: pathname },
        "Access denied: User without completed purchase"
      );
      const landingUrl = new URL("/", request.url);
      landingUrl.searchParams.set("message", "complete-purchase");
      landingUrl.searchParams.set("user", payload.email);
      const response = NextResponse.redirect(landingUrl);
      response.headers.set("x-request-id", requestId);
      return applySecurityHeaders(response);
    }

    requestLogger.info(
      { userId: payload.userId, reason: accessResult.reason },
      "Access granted to dashboard"
    );
  }

  // ============================================
  // AGREGAR INFO DE USUARIO A HEADERS
  // ============================================
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-has-purchase", payload.hasCompletedPurchase ? "true" : "false");

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-request-id", requestId);
  return applySecurityHeaders(response);
}

/**
 * Maneja respuestas no autorizadas
 */
function handleUnauthorized(
  request: NextRequest,
  requestId: string,
  pathname: string
): NextResponse {
  if (shouldRedirectToLogin(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("x-request-id", requestId);
    return applySecurityHeaders(response);
  }

  if (isApiRoute(pathname)) {
    const response = NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    response.headers.set("x-request-id", requestId);
    return applySecurityHeaders(response);
  }

  const response = NextResponse.json(
    { success: false, error: "Token inválido o expirado" },
    { status: 401 }
  );
  response.headers.set("x-request-id", requestId);
  return applySecurityHeaders(response);
}

// Aplicar middleware a rutas específicas
// NOTA: El matcher DEBE ser un valor literal estático para que Next.js pueda analizarlo
// en tiempo de compilación. No se puede usar una variable importada aquí.
// Si necesitas modificar estas rutas, asegúrate de actualizarlas también en
// src/lib/middleware-modules/config.ts para mantener la consistencia.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/docs/:path*",
    "/tenant/:path*",
    "/api/quotations/:path*",
    "/api/users/:path*",
    "/api/payments/:path*",
    "/api/projects/:path*",
    "/api/advisors/:path*",
    "/api/discount-codes/:path*",
    "/api/notifications/:path*",
    "/api/invoices/:path*",
    "/api/audit-logs/:path*",
    "/api/tenants/:path*",
    "/api/tenant/:path*",
  ],
};
