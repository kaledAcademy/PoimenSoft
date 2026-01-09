/**
 * Configuraciones del Middleware
 *
 * Centraliza todas las constantes y configuraciones usadas por el middleware.
 */

/**
 * Subdominios reservados que NO son tenants
 */
export const RESERVED_SUBDOMAINS = ["www", "admin", "api", "app", "mail", "ftp"];

/**
 * Dominios principales de la aplicación
 */
export const MAIN_DOMAINS = ["amaxoft.com", "localhost", "vercel.app"];

/**
 * Rutas públicas que no requieren autenticación
 */
export const PUBLIC_PATHS = [
  "/",
  "/login",
  // "/register", // ELIMINADO: El registro solo se hace a través del flujo de membresías
  "/api/auth/login",
  "/api/auth/register", // API endpoint usado por RegistrationModal
  "/api/auth/[...nextauth]", // NextAuth routes (Google OAuth, session, etc.)
  "/api/auth/google", // Google OAuth callback
  "/api/auth/google/callback", // Google OAuth callback personalizado
  "/api/health",
  "/api/products",
  "/api/memberships",
  "/api/categories",
  "/api/quotations/temporary", // Cotizaciones temporales sin autenticación
];

/**
 * Rutas que requieren autenticación
 */
export const PROTECTED_PATHS = [
  "/dashboard",
  "/docs", // Documentación protegida
  "/api/quotations",
  "/api/users",
  "/api/payments",
  "/api/projects",
];

/**
 * Roles administrativos que siempre tienen acceso al dashboard
 */
export const ADMIN_ROLES = ["ADM1", "ADM2", "ASIN", "ASEX", "CEO1", "CEO2", "CEO3", "CEOM"];

/**
 * Configuración de JWT
 */
export const JWT_CONFIG = {
  /** Tiempo máximo de vida del token (30 días en segundos) */
  MAX_AGE_SECONDS: 30 * 24 * 60 * 60,
};

/**
 * Matcher configuration para Next.js middleware
 */
export const MIDDLEWARE_MATCHER = [
  "/dashboard/:path*",
  "/docs/:path*", // Proteger documentación
  "/tenant/:path*", // Rutas de tenants (multi-tenant)
  "/api/quotations/:path*",
  "/api/users/:path*",
  "/api/payments/:path*",
  "/api/projects/:path*",
  "/api/advisors/:path*",
  "/api/discount-codes/:path*",
  "/api/notifications/:path*",
  "/api/invoices/:path*",
  "/api/audit-logs/:path*",
  "/api/tenants/:path*", // API de gestión de tenants
  "/api/tenant/:path*", // API de operaciones del tenant
];
