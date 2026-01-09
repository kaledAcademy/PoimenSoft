/**
 * Tests unitarios para auth-validation.ts
 * Valida extracción y validación de tokens JWT
 */

import { extractToken, validateToken } from "../auth-validation";
import { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
}));

describe("AuthValidation", () => {
  describe("extractToken", () => {
    it("debe extraer token del header Authorization", () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === "authorization") {
              return "Bearer test-token-123";
            }
            return null;
          }),
        },
        cookies: {
          get: jest.fn(),
        },
      } as unknown as NextRequest;

      const token = extractToken(mockRequest);

      expect(token).toBe("test-token-123");
    });

    it("debe extraer token de cookies si no está en header", () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
        cookies: {
          get: jest.fn((name: string) => {
            if (name === "accessToken") {
              return { value: "cookie-token-456" };
            }
            return undefined;
          }),
        },
      } as unknown as NextRequest;

      const token = extractToken(mockRequest);

      expect(token).toBe("cookie-token-456");
    });

    it("debe retornar null si no hay token", () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null),
        },
        cookies: {
          get: jest.fn(() => undefined),
        },
      } as unknown as NextRequest;

      const token = extractToken(mockRequest);

      expect(token).toBeNull();
    });

    it("debe manejar header sin Bearer prefix", () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === "authorization") {
              return "test-token-direct";
            }
            return null;
          }),
        },
        cookies: {
          get: jest.fn(),
        },
      } as unknown as NextRequest;

      const token = extractToken(mockRequest);

      expect(token).toBe("test-token-direct");
    });
  });

  describe("validateToken", () => {
    it("debe validar token JWT válido", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        userId: "user-123",
        email: "test@example.com",
        role: "USST",
        iat: now,
        exp: now + 3600,
      };

      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const body = btoa(JSON.stringify(payload));
      const token = `${header}.${body}.signature`;

      const result = validateToken(token);

      expect(result.isValid).toBe(true);
      expect(result.payload).toEqual(payload);
      expect(result.error).toBeUndefined();
    });

    it("debe rechazar token con formato incorrecto", () => {
      const result = validateToken("invalid-token");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Token JWT inválido: formato incorrecto");
    });

    it("debe rechazar token con payload incompleto", () => {
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const body = btoa(JSON.stringify({ userId: "user-123" })); // Falta email y role
      const token = `${header}.${body}.signature`;

      const result = validateToken(token);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Token JWT inválido: payload incompleto");
    });

    it("debe rechazar token expirado", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        userId: "user-123",
        email: "test@example.com",
        role: "USST",
        iat: now - 7200,
        exp: now - 3600, // Expirado hace 1 hora
      };

      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const body = btoa(JSON.stringify(payload));
      const token = `${header}.${body}.signature`;

      const result = validateToken(token);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Token expirado");
    });

    it("debe rechazar token muy antiguo", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        userId: "user-123",
        email: "test@example.com",
        role: "USST",
        iat: now - 2592001, // Hace más de 30 días (más del MAX_AGE)
        exp: now + 3600,
      };

      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const body = btoa(JSON.stringify(payload));
      const token = `${header}.${body}.signature`;

      const result = validateToken(token);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Token muy antiguo");
    });

    it("debe manejar error al decodificar token", () => {
      const result = validateToken("invalid.base.token");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Error al decodificar token");
    });

    it("debe aceptar token sin exp", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        userId: "user-123",
        email: "test@example.com",
        role: "USST",
        iat: now,
        // Sin exp
      };

      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const body = btoa(JSON.stringify(payload));
      const token = `${header}.${body}.signature`;

      const result = validateToken(token);

      expect(result.isValid).toBe(true);
      expect(result.payload).toEqual(payload);
    });

    it("debe aceptar token sin iat", () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        userId: "user-123",
        email: "test@example.com",
        role: "USST",
        exp: now + 3600,
        // Sin iat
      };

      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const body = btoa(JSON.stringify(payload));
      const token = `${header}.${body}.signature`;

      const result = validateToken(token);

      expect(result.isValid).toBe(true);
      expect(result.payload).toEqual(payload);
    });
  });
});
