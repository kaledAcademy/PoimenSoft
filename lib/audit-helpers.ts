import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Tipos de acciones de auditoría relacionadas con autenticación
 */
export type AuthAuditAction =
  | "LOGIN"
  | "REGISTER"
  | "LOGOUT"
  | "EMAIL_CONFIRMED"
  | "PASSWORD_RESET"
  | "PASSWORD_CHANGED";

/**
 * Crea un audit log para acciones de autenticación
 * @param params - Parámetros para crear el audit log
 */
export async function createAuthAuditLog(params: {
  userId: string;
  action: AuthAuditAction;
  request: NextRequest;
  newValue?: Record<string, any>;
  entityId?: string;
  entityType?: string;
}): Promise<void> {
  const {
    userId,
    action,
    request,
    newValue = {},
    entityId = params.userId,
    entityType = "User",
  } = params;

  const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "API";

  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      newValue,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    },
  });
}

/**
 * Crea un audit log para login
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @param role - Rol del usuario
 * @param request - Request de Next.js
 */
export async function createLoginAuditLog(
  userId: string,
  email: string,
  role: string,
  request: NextRequest
): Promise<void> {
  await createAuthAuditLog({
    userId,
    action: "LOGIN",
    request,
    newValue: { email, role },
  });
}

/**
 * Crea un audit log para registro
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @param role - Rol del usuario
 * @param customId - Custom ID del usuario
 * @param request - Request de Next.js
 */
export async function createRegisterAuditLog(
  userId: string,
  email: string,
  role: string,
  customId: string,
  request: NextRequest
): Promise<void> {
  await createAuthAuditLog({
    userId,
    action: "REGISTER",
    request,
    newValue: {
      email,
      role,
      customId,
    },
  });
}

/**
 * Crea un audit log para confirmación de email
 * @param userId - ID del usuario
 * @param request - Request de Next.js
 */
export async function createEmailConfirmedAuditLog(
  userId: string,
  request: NextRequest
): Promise<void> {
  await createAuthAuditLog({
    userId,
    action: "EMAIL_CONFIRMED",
    request,
    newValue: {
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
}
