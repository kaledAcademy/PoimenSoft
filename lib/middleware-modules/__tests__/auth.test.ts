/**
 * Tests unitarios para auth.ts
 * Valida middleware de autenticacion y autorizacion
 */

// Mock NextRequest ANTES de importar
jest.mock("next/server", () => ({
  NextRequest: jest.fn((url, init) => ({
    url: typeof url === "string" ? url : url.toString(),
    headers: new Headers({
      authorization: init?.headers?.authorization || "",
    }),
    cookies: {
      get: jest.fn((name) => ({
        value: name === "accessToken" ? init?.cookies?.[name] : undefined,
      })),
    },
  })),
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("@/types/auth-extended", () => ({
  hasPermission: jest.fn(),
}));

import { AuthMiddleware } from "../auth";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { hasPermission } from "@/types/auth-extended";
import { UserRole } from "@prisma/client";

describe("AuthMiddleware", () => {
  let middleware: AuthMiddleware;

  beforeEach(() => {
    (AuthMiddleware as any).instance = undefined;
    middleware = AuthMiddleware.getInstance();
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("authenticate", () => {
    it("debe autenticar usuario con token valido en header", async () => {
      const mockToken = {
        userId: "user-1",
        email: "test@example.com",
        role: UserRole.USST,
        customId: "USST-001",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockToken);

      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      const result = await middleware.authenticate(request);

      expect(result).not.toBeNull();
      expect(result?.user.id).toBe("user-1");
      expect(result?.user.email).toBe("test@example.com");
      expect(result?.user.role).toBe(UserRole.USST);
    });

    it("debe autenticar usuario con token en cookie", async () => {
      const mockToken = {
        userId: "user-1",
        email: "test@example.com",
        role: UserRole.USST,
        customId: "USST-001",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockToken);

      const request = new NextRequest("http://localhost/api/test", {
        // @ts-expect-error - cookies no está en RequestInit pero es válido para NextRequest
        cookies: {
          accessToken: "valid-token",
        },
      });

      const result = await middleware.authenticate(request);

      expect(result).not.toBeNull();
      expect(result?.user.id).toBe("user-1");
    });

    it("debe retornar null si no hay token", async () => {
      const request = new NextRequest("http://localhost/api/test");

      const result = await middleware.authenticate(request);

      expect(result).toBeNull();
    });

    it("debe retornar null si token es invalido", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          authorization: "Bearer invalid-token",
        },
      });

      const result = await middleware.authenticate(request);

      expect(result).toBeNull();
    });
  });

  describe("authorize", () => {
    const mockToken = {
      userId: "user-1",
      email: "test@example.com",
      role: UserRole.USST,
      customId: "USST-001",
    };

    beforeEach(() => {
      (jwt.verify as jest.Mock).mockReturnValue(mockToken);
    });

    it("debe autorizar usuario con rol permitido", async () => {
      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      const result = await middleware.authorize(request, {
        requiredRoles: [UserRole.USST, UserRole.USPR],
      });

      expect(result.success).toBe(true);
      expect(result.context).toBeDefined();
    });

    it("debe rechazar usuario con rol no permitido", async () => {
      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      const result = await middleware.authorize(request, {
        requiredRoles: [UserRole.ADM1],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Rol insuficiente");
    });

    it("debe verificar permisos especificos", async () => {
      (hasPermission as jest.Mock).mockReturnValue(false);

      const request = new NextRequest("http://localhost/api/test", {
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      const result = await middleware.authorize(request, {
        requiredPermissions: [{ resource: "users", action: "delete" }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Permiso insuficiente");
    });

    it("debe permitir acceso propio si allowSelfAccess es true", async () => {
      const request = new NextRequest("http://localhost/api/users/user-1", {
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      const result = await middleware.authorize(request, {
        allowSelfAccess: true,
      });

      expect(result.success).toBe(true);
    });

    it("debe retornar error si no esta autenticado", async () => {
      (jwt.verify as jest.Mock).mockReturnValue(null);

      const request = new NextRequest("http://localhost/api/test");

      const result = await middleware.authorize(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain("No autenticado");
    });
  });

  describe("getInstance", () => {
    it("debe retornar la misma instancia", () => {
      const instance1 = AuthMiddleware.getInstance();
      const instance2 = AuthMiddleware.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
