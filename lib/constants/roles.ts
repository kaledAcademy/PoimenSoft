import { UserRole } from "@prisma/client";

/**
 * Todos los roles del sistema
 */
export const ALL_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.PASTOR,
  UserRole.SUPERVISOR,
  UserRole.DISCIPULADOR,
  UserRole.TESORERO,
  UserRole.ADMINISTRATIVO,
];

/**
 * Roles de usuarios básicos
 */
export const CLIENT_ROLES: UserRole[] = [UserRole.DISCIPULADOR];

/**
 * Roles de supervisión
 */
export const ADVISOR_ROLES: UserRole[] = [UserRole.SUPERVISOR];

/**
 * Roles de administradores
 */
export const ADMIN_ROLES: UserRole[] = [UserRole.ADMINISTRATIVO, UserRole.TESORERO];

/**
 * Roles de dirección
 */
export const CEO_ROLES: UserRole[] = [UserRole.PASTOR, UserRole.SUPERADMIN];

/**
 * Roles que requieren autenticación para acceder a /api/auth/me
 * Por defecto, todos los roles están permitidos
 */
export const ALLOWED_AUTH_ROLES: UserRole[] = ALL_ROLES;

/**
 * Verifica si un rol está en la lista de roles permitidos
 * @param role - Rol a verificar
 * @param allowedRoles - Lista de roles permitidos (default: ALL_ROLES)
 * @returns true si el rol está permitido
 */
export function isRoleAllowed(role: UserRole, allowedRoles: UserRole[] = ALL_ROLES): boolean {
  return allowedRoles.includes(role);
}
