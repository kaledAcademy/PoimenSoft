import { UserRole } from "@prisma/client";

// Re-exportar tipos de Prisma para uso en middleware
export { UserRole };

// Tipos extendidos para el sistema completo
export interface ExtendedUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  customId: string;
  isActive: boolean;
  emailVerified?: Date;
  image?: string;
  profilePhoto?: string;
  companyName?: string;
  currentMembershipId?: string;
  // Campos de control de acceso
  hasCompletedPurchase?: boolean;
  purchaseDate?: Date | null;
  membershipId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  profile?: ExtendedProfile;
  advisor?: ExtendedAdvisor;
}

export interface ExtendedProfile {
  id: string;
  userId: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string | null;
  department?: string | null;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtendedAdvisor {
  id: string;
  userId: string;
  customId: string;
  advisorType: "INTERNAL" | "EXTERNAL";
  specialization: string[];
  region?: string;
  territory: string[];
  commissionRate?: number;
  isActive: boolean;
  hireDate: Date;
  terminationDate?: Date;
  performanceScore?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    customId: string;
    currentMembershipId?: string;
    companyName?: string;
    profilePhoto?: string;
    profile?: ExtendedProfile;
    advisor?: ExtendedAdvisor;
  };
  expires: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: ExtendedUser;
  error?: string;
  message?: string;
}

// Tipos para permisos y autorización
export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  DISCIPULADOR: [
    { resource: "quotations", actions: ["create", "read", "update"] },
    { resource: "profile", actions: ["read", "update"] },
    { resource: "payments", actions: ["read", "create"] },
    { resource: "projects", actions: ["read"] },
  ],
  SUPERVISOR: [
    { resource: "quotations", actions: ["create", "read", "update"] },
    { resource: "profile", actions: ["read", "update"] },
    { resource: "payments", actions: ["read", "create"] },
    { resource: "projects", actions: ["read"] },
    { resource: "analytics", actions: ["read"] },
  ],
  TESORERO: [
    { resource: "quotations", actions: ["create", "read", "update"] },
    { resource: "profile", actions: ["read", "update"] },
    { resource: "payments", actions: ["read", "create"] },
    { resource: "projects", actions: ["read"] },
    { resource: "analytics", actions: ["read"] },
    { resource: "reports", actions: ["read"] },
  ],
  ADMINISTRATIVO: [
    { resource: "quotations", actions: ["create", "read", "update", "assign"] },
    { resource: "clients", actions: ["read", "update"] },
    { resource: "analytics", actions: ["read"] },
    { resource: "reports", actions: ["read"] },
    { resource: "profile", actions: ["read", "update"] },
  ],
  PASTOR: [
    { resource: "quotations", actions: ["create", "read", "update", "assign"] },
    { resource: "clients", actions: ["read", "update"] },
    { resource: "analytics", actions: ["read"] },
    { resource: "reports", actions: ["read"] },
    { resource: "profile", actions: ["read", "update"] },
  ],
  SUPERADMIN: [
    { resource: "*", actions: ["*"] }, // Acceso completo
  ],
};

// Utilidades de autorización
export const hasPermission = (userRole: UserRole, resource: string, action: string): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;

  // Verificar acceso completo
  const fullAccess = permissions.find((p) => p.resource === "*" && p.actions.includes("*"));
  if (fullAccess) return true;

  // Verificar acceso específico
  const resourcePermission = permissions.find((p) => p.resource === resource);
  if (!resourcePermission) return false;

  return resourcePermission.actions.includes("*") || resourcePermission.actions.includes(action);
};

export const canAccessResource = (userRole: UserRole, resource: string): boolean => {
  return hasPermission(userRole, resource, "read") || hasPermission(userRole, "*", "*");
};

export const canPerformAction = (userRole: UserRole, resource: string, action: string): boolean => {
  return hasPermission(userRole, resource, action);
};

// Tipos para middleware de autorización
export interface AuthMiddlewareOptions {
  requiredRoles?: UserRole[];
  requiredPermissions?: {
    resource: string;
    action: string;
  }[];
  allowSelfAccess?: boolean; // Permitir acceso a recursos propios
}

export interface AuthContext {
  user: ExtendedUser;
  session: AuthSession;
  permissions: Permission[];
}
