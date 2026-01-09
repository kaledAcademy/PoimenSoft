/**
 * Control de Acceso
 *
 * Maneja la lógica de control de acceso a rutas protegidas.
 */

import { PUBLIC_PATHS, PROTECTED_PATHS, ADMIN_ROLES } from "./config";
import type { JWTPayload } from "./auth-validation";

/**
 * Verifica si una ruta es pública
 *
 * @param pathname - La ruta a verificar
 * @returns true si la ruta es pública
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

/**
 * Verifica si una ruta es protegida
 *
 * @param pathname - La ruta a verificar
 * @returns true si la ruta es protegida
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Verifica si un rol es administrativo
 *
 * @param role - El rol a verificar
 * @returns true si el rol es administrativo
 */
export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Resultado de la verificación de acceso al dashboard
 */
export interface DashboardAccessResult {
  allowed: boolean;
  reason?: "admin" | "purchase_completed" | "no_purchase";
}

/**
 * Verifica si un usuario puede acceder al dashboard
 *
 * @param payload - El payload del token JWT
 * @returns Resultado de la verificación
 */
export function canAccessDashboard(payload: JWTPayload): DashboardAccessResult {
  // Los roles administrativos siempre tienen acceso
  if (isAdminRole(payload.role)) {
    return {
      allowed: true,
      reason: "admin",
    };
  }

  // Usuarios clientes requieren compra completada
  const hasCompletedPurchase = payload.hasCompletedPurchase || false;
  if (hasCompletedPurchase) {
    return {
      allowed: true,
      reason: "purchase_completed",
    };
  }

  return {
    allowed: false,
    reason: "no_purchase",
  };
}

/**
 * Verifica si una ruta requiere redirección a login
 *
 * @param pathname - La ruta actual
 * @returns true si debería redirigir a login
 */
export function shouldRedirectToLogin(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/docs");
}

/**
 * Verifica si una ruta es de API
 *
 * @param pathname - La ruta a verificar
 * @returns true si es una ruta de API
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}
