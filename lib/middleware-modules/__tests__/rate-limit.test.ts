/**
 * Tests unitarios para rate-limit.ts
 * Valida middleware de rate limiting
 */

// Mock NextRequest ANTES de importar
jest.mock("next/server", () => ({
  NextRequest: jest.fn((url, init) => ({
    url: typeof url === "string" ? url : url.toString(),
    headers: new Headers({
      "user-agent": "test-agent",
      "x-forwarded-for": "127.0.0.1",
    }),
  })),
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
      headers: new Headers(init?.headers),
    })),
  },
}));

import { RateLimitMiddleware } from "../rate-limit";
import { NextRequest } from "next/server";

describe("RateLimitMiddleware", () => {
  let middleware: RateLimitMiddleware;

  beforeEach(() => {
    // Crear nueva instancia para cada test para evitar estado compartido
    (RateLimitMiddleware as any).instance = undefined;
    middleware = RateLimitMiddleware.getInstance();
  });

  describe("checkLimit", () => {
    const config = {
      windowMs: 60000, // 1 minuto
      maxRequests: 5,
    };

    it("debe permitir requests dentro del limite", async () => {
      const request = new NextRequest("http://localhost/api/test");

      for (let i = 0; i < 5; i++) {
        const result = await middleware.checkLimit(request, config);
        expect(result.success).toBe(true);
        expect(result.remaining).toBeDefined();
      }
    });

    it("debe rechazar requests que exceden el limite", async () => {
      const request = new NextRequest("http://localhost/api/test");

      // Hacer 5 requests permitidos
      for (let i = 0; i < 5; i++) {
        await middleware.checkLimit(request, config);
      }

      // El 6to request debe ser rechazado
      const result = await middleware.checkLimit(request, config);
      expect(result.success).toBe(false);
      expect(result.response).toBeDefined();
    });

    it("debe bloquear temporalmente despues de exceder limite", async () => {
      const request = new NextRequest("http://localhost/api/test");

      // Exceder limite
      for (let i = 0; i < 6; i++) {
        await middleware.checkLimit(request, config);
      }

      // Intentar otro request inmediatamente - debe estar bloqueado
      const result = await middleware.checkLimit(request, config);
      expect(result.success).toBe(false);
    });

    it("debe usar identificador personalizado si se proporciona", async () => {
      const request1 = new NextRequest("http://localhost/api/test");
      const request2 = new NextRequest("http://localhost/api/test");

      // Usar mismo identificador
      const result1 = await middleware.checkLimit(request1, config, "user-123");
      const result2 = await middleware.checkLimit(request2, config, "user-123");

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      // El segundo request debe tener remaining menor
      expect(result2.remaining!).toBeLessThan(result1.remaining!);
    });

    it("debe resetear contador despues de ventana de tiempo", async () => {
      jest.useFakeTimers();
      const request = new NextRequest("http://localhost/api/test");
      const shortConfig = {
        windowMs: 100, // 100ms
        maxRequests: 2,
      };

      // Hacer 2 requests
      await middleware.checkLimit(request, shortConfig);
      await middleware.checkLimit(request, shortConfig);

      // Avanzar tiempo para que expire la ventana
      jest.advanceTimersByTime(150);

      // Debe permitir nuevos requests
      const result = await middleware.checkLimit(request, shortConfig);
      expect(result.success).toBe(true);
      jest.useRealTimers();
    });
  });

  describe("getInstance", () => {
    it("debe retornar la misma instancia", () => {
      const instance1 = RateLimitMiddleware.getInstance();
      const instance2 = RateLimitMiddleware.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
