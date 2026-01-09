/**
 * Tests unitarios para tenant-detection.ts
 * Valida detección de tenant desde subdominios
 */

import { detectTenantSlug } from "../tenant-detection";
import { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
}));

describe("TenantDetection", () => {
  const createMockRequest = (host: string): NextRequest => {
    return {
      headers: {
        get: jest.fn((key: string) => {
          if (key === "host") return host;
          return null;
        }),
      },
    } as unknown as NextRequest;
  };

  describe("detectTenantSlug", () => {
    it("debe detectar tenant desde subdominio", () => {
      const request = createMockRequest("brasaybarril.amaxoft.com");
      const slug = detectTenantSlug(request);
      expect(slug).toBe("brasaybarril");
    });

    it("debe retornar null para dominio principal", () => {
      const request = createMockRequest("www.amaxoft.com");
      const slug = detectTenantSlug(request);
      expect(slug).toBeNull();
    });

    it("debe retornar null para localhost", () => {
      const request = createMockRequest("localhost:3000");
      const slug = detectTenantSlug(request);
      expect(slug).toBeNull();
    });

    it("debe retornar null para 127.0.0.1", () => {
      const request = createMockRequest("127.0.0.1:3000");
      const slug = detectTenantSlug(request);
      expect(slug).toBeNull();
    });

    it("debe retornar null para Vercel preview", () => {
      const request = createMockRequest("myapp-abc123.vercel.app");
      const slug = detectTenantSlug(request);
      expect(slug).toBeNull();
    });

    it("debe retornar null para dominio sin subdominio", () => {
      const request = createMockRequest("amaxoft.com");
      const slug = detectTenantSlug(request);
      expect(slug).toBeNull();
    });

    it("debe manejar hostname sin puerto", () => {
      const request = createMockRequest("tenant.amaxoft.com");
      const slug = detectTenantSlug(request);
      expect(slug).toBe("tenant");
    });

    it("debe manejar hostname con puerto", () => {
      const request = createMockRequest("tenant.amaxoft.com:3000");
      const slug = detectTenantSlug(request);
      expect(slug).toBe("tenant");
    });
  });
});

