import { NextRequest, NextResponse } from "next/server";
import { AuthContext } from "./auth";
import { prisma } from "@/lib/prisma";

export interface AuditLogData {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class AuditMiddleware {
  private static instance: AuditMiddleware;

  static getInstance(): AuditMiddleware {
    if (!AuditMiddleware.instance) {
      AuditMiddleware.instance = new AuditMiddleware();
    }
    return AuditMiddleware.instance;
  }

  async logAction(
    request: NextRequest,
    authContext: AuthContext | null,
    data: AuditLogData
  ): Promise<void> {
    try {
      const ipAddress = this.getClientIP(request);
      const userAgent = request.headers.get("user-agent") || "Unknown";

      await prisma.auditLog.create({
        data: {
          userId: authContext?.user.id || data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValue: data.oldValue ? JSON.stringify(data.oldValue) : undefined,
          newValue: data.newValue ? JSON.stringify(data.newValue) : undefined,
          ipAddress: data.ipAddress || ipAddress,
          userAgent: data.userAgent || userAgent,
          metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      // Importar logger dinámicamente para evitar problemas de inicialización
      const { logger } = await import("@/lib/logger");
      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          userId: authContext?.user.id,
          action: data.action,
        },
        "Error registering audit log"
      );
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  async logAPIAccess(
    request: NextRequest,
    authContext: AuthContext | null,
    response: NextResponse
  ): Promise<void> {
    const url = new URL(request.url);
    const method = request.method;
    const statusCode = response.status;

    // Solo registrar accesos importantes o errores
    if (statusCode >= 400 || this.isImportantEndpoint(url.pathname)) {
      await this.logAction(request, authContext, {
        action: "API_ACCESS",
        entityType: "API",
        entityId: `${method} ${url.pathname}`,
        newValue: {
          method,
          path: url.pathname,
          statusCode,
          query: Object.fromEntries(url.searchParams),
        },
        metadata: {
          endpoint: url.pathname,
          method,
          statusCode,
        },
      });
    }
  }

  async logDataChange(
    request: NextRequest,
    authContext: AuthContext | null,
    entityType: string,
    entityId: string,
    action: "CREATE" | "UPDATE" | "DELETE",
    oldValue?: any,
    newValue?: any
  ): Promise<void> {
    await this.logAction(request, authContext, {
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      metadata: {
        timestamp: new Date().toISOString(),
        actionType: action,
      },
    });
  }

  async logLoginAttempt(
    request: NextRequest,
    email: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.logAction(request, null, {
      action: "LOGIN_ATTEMPT",
      entityType: "User",
      newValue: {
        email,
        success,
        error,
      },
      metadata: {
        loginAttempt: true,
        success,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logPaymentActivity(
    request: NextRequest,
    authContext: AuthContext | null,
    paymentId: string,
    action: string,
    amount?: number,
    status?: string
  ): Promise<void> {
    await this.logAction(request, authContext, {
      action: `PAYMENT_${action}`,
      entityType: "Payment",
      entityId: paymentId,
      newValue: {
        paymentId,
        action,
        amount,
        status,
      },
      metadata: {
        paymentActivity: true,
        amount,
        status,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logQuotationActivity(
    request: NextRequest,
    authContext: AuthContext | null,
    quotationId: string,
    action: string,
    oldStatus?: string,
    newStatus?: string
  ): Promise<void> {
    await this.logAction(request, authContext, {
      action: `QUOTATION_${action}`,
      entityType: "Quotation",
      entityId: quotationId,
      oldValue: oldStatus ? { status: oldStatus } : undefined,
      newValue: newStatus ? { status: newStatus } : undefined,
      metadata: {
        quotationActivity: true,
        action,
        oldStatus,
        newStatus,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logMembershipChange(
    request: NextRequest,
    authContext: AuthContext | null,
    userId: string,
    oldMembershipId?: string,
    newMembershipId?: string,
    reason?: string
  ): Promise<void> {
    await this.logAction(request, authContext, {
      action: "MEMBERSHIP_CHANGE",
      entityType: "Membership",
      entityId: userId,
      oldValue: oldMembershipId ? { membershipId: oldMembershipId } : undefined,
      newValue: newMembershipId ? { membershipId: newMembershipId } : undefined,
      metadata: {
        membershipChange: true,
        reason,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    return "127.0.0.1";
  }

  private isImportantEndpoint(pathname: string): boolean {
    const importantEndpoints = [
      "/api/users",
      "/api/quotations",
      "/api/payments",
      "/api/projects",
      "/api/discount-codes",
      "/api/accounts-receivable",
      "/api/invoices",
      "/api/advisors",
    ];

    return importantEndpoints.some((endpoint) => pathname.startsWith(endpoint));
  }
}

// Función helper para usar en API routes
export async function withAudit(
  request: NextRequest,
  authContext: AuthContext | null,
  action: string,
  entityType: string,
  entityId?: string,
  oldValue?: any,
  newValue?: any
): Promise<void> {
  const auditMiddleware = AuditMiddleware.getInstance();
  await auditMiddleware.logAction(request, authContext, {
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
  });
}

// Función helper para logging de cambios de datos
export async function logDataChange(
  request: NextRequest,
  authContext: AuthContext | null,
  entityType: string,
  entityId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  oldValue?: any,
  newValue?: any
): Promise<void> {
  const auditMiddleware = AuditMiddleware.getInstance();
  await auditMiddleware.logDataChange(
    request,
    authContext,
    entityType,
    entityId,
    action,
    oldValue,
    newValue
  );
}

// Función helper para logging de actividad de pagos
export async function logPaymentActivity(
  request: NextRequest,
  authContext: AuthContext | null,
  paymentId: string,
  action: string,
  amount?: number,
  status?: string
): Promise<void> {
  const auditMiddleware = AuditMiddleware.getInstance();
  await auditMiddleware.logPaymentActivity(request, authContext, paymentId, action, amount, status);
}

// Función helper para logging de actividad de cotizaciones
export async function logQuotationActivity(
  request: NextRequest,
  authContext: AuthContext | null,
  quotationId: string,
  action: string,
  oldStatus?: string,
  newStatus?: string
): Promise<void> {
  const auditMiddleware = AuditMiddleware.getInstance();
  await auditMiddleware.logQuotationActivity(
    request,
    authContext,
    quotationId,
    action,
    oldStatus,
    newStatus
  );
}
