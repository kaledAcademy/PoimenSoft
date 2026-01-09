/**
 * Tests unitarios para audit.ts
 * Valida middleware de auditoría
 */

import {
  AuditMiddleware,
  withAudit,
  logDataChange,
  logPaymentActivity,
  logQuotationActivity,
} from "../audit";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe("AuditMiddleware", () => {
  let mockRequest: NextRequest;
  let mockResponse: NextResponse;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      headers: {
        get: jest.fn((key: string) => {
          if (key === "user-agent") return "Mozilla/5.0";
          if (key === "x-forwarded-for") return "192.168.1.1";
          return null;
        }),
      },
      url: "https://example.com/api/test",
      method: "GET",
    } as unknown as NextRequest;

    mockResponse = {
      status: 200,
    } as NextResponse;
  });

  describe("getInstance", () => {
    it("debe retornar la misma instancia", () => {
      const instance1 = AuditMiddleware.getInstance();
      const instance2 = AuditMiddleware.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("logAction", () => {
    it("debe crear log de auditoría", async () => {
      const middleware = AuditMiddleware.getInstance();
      const authContext = {
        user: { id: "user-1", email: "test@example.com" },
      };

      await middleware.logAction(mockRequest, authContext as any, {
        action: "TEST_ACTION",
        entityType: "Test",
        entityId: "test-1",
      });

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("debe manejar errores sin lanzar excepción", async () => {
      (prisma.auditLog.create as jest.Mock).mockRejectedValue(new Error("Database error"));

      const middleware = AuditMiddleware.getInstance();

      await expect(
        middleware.logAction(mockRequest, null, {
          action: "TEST_ACTION",
          entityType: "Test",
        })
      ).resolves.not.toThrow();
    });
  });

  describe("logAPIAccess", () => {
    it("debe registrar acceso a API importante", async () => {
      const middleware = AuditMiddleware.getInstance();
      const request = {
        ...mockRequest,
        url: "https://example.com/api/users",
      } as NextRequest;

      await middleware.logAPIAccess(request, null, mockResponse);

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("debe registrar errores HTTP", async () => {
      const middleware = AuditMiddleware.getInstance();
      const errorResponse = { status: 500 } as NextResponse;

      await middleware.logAPIAccess(mockRequest, null, errorResponse);

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logDataChange", () => {
    it("debe registrar cambio de datos", async () => {
      const middleware = AuditMiddleware.getInstance();

      await middleware.logDataChange(mockRequest, null, "User", "user-1", "CREATE", undefined, {
        name: "Test",
      });

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logLoginAttempt", () => {
    it("debe registrar intento de login exitoso", async () => {
      const middleware = AuditMiddleware.getInstance();

      await middleware.logLoginAttempt(mockRequest, "test@example.com", true);

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("debe registrar intento de login fallido", async () => {
      const middleware = AuditMiddleware.getInstance();

      await middleware.logLoginAttempt(
        mockRequest,
        "test@example.com",
        false,
        "Invalid credentials"
      );

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logPaymentActivity", () => {
    it("debe registrar actividad de pago", async () => {
      const middleware = AuditMiddleware.getInstance();

      await middleware.logPaymentActivity(
        mockRequest,
        null,
        "payment-1",
        "CREATED",
        100000,
        "PENDING"
      );

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logQuotationActivity", () => {
    it("debe registrar actividad de cotización", async () => {
      const middleware = AuditMiddleware.getInstance();

      await middleware.logQuotationActivity(
        mockRequest,
        null,
        "quot-1",
        "STATUS_CHANGED",
        "PENDING",
        "APPROVED"
      );

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logMembershipChange", () => {
    it("debe registrar cambio de membresía", async () => {
      const middleware = AuditMiddleware.getInstance();

      await middleware.logMembershipChange(
        mockRequest,
        null,
        "user-1",
        "membership-1",
        "membership-2",
        "Upgrade"
      );

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("Helper functions", () => {
    it("withAudit debe funcionar", async () => {
      await withAudit(mockRequest, null, "TEST", "Test", "test-1");

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("logDataChange helper debe funcionar", async () => {
      await logDataChange(mockRequest, null, "User", "user-1", "CREATE");

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("logPaymentActivity helper debe funcionar", async () => {
      await logPaymentActivity(mockRequest, null, "payment-1", "CREATED");

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("logQuotationActivity helper debe funcionar", async () => {
      await logQuotationActivity(mockRequest, null, "quot-1", "CREATED");

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});

