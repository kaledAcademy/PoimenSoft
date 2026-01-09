/**
 * Tests unitarios para config.ts
 * Valida constantes y configuraciones del middleware
 */

import {
  RESERVED_SUBDOMAINS,
  MAIN_DOMAINS,
  PUBLIC_PATHS,
  PROTECTED_PATHS,
  ADMIN_ROLES,
  JWT_CONFIG,
  MIDDLEWARE_MATCHER,
} from "../config";

describe("MiddlewareConfig", () => {
  describe("RESERVED_SUBDOMAINS", () => {
    it("debe tener subdominios reservados correctos", () => {
      expect(RESERVED_SUBDOMAINS).toContain("www");
      expect(RESERVED_SUBDOMAINS).toContain("admin");
      expect(RESERVED_SUBDOMAINS).toContain("api");
      expect(RESERVED_SUBDOMAINS).toContain("app");
      expect(RESERVED_SUBDOMAINS).toContain("mail");
      expect(RESERVED_SUBDOMAINS).toContain("ftp");
    });

    it("debe ser un array no vacío", () => {
      expect(Array.isArray(RESERVED_SUBDOMAINS)).toBe(true);
      expect(RESERVED_SUBDOMAINS.length).toBeGreaterThan(0);
    });
  });

  describe("MAIN_DOMAINS", () => {
    it("debe tener dominios principales correctos", () => {
      expect(MAIN_DOMAINS).toContain("amaxoft.com");
      expect(MAIN_DOMAINS).toContain("localhost");
      expect(MAIN_DOMAINS).toContain("vercel.app");
    });

    it("debe ser un array no vacío", () => {
      expect(Array.isArray(MAIN_DOMAINS)).toBe(true);
      expect(MAIN_DOMAINS.length).toBeGreaterThan(0);
    });
  });

  describe("PUBLIC_PATHS", () => {
    it("debe incluir rutas públicas esenciales", () => {
      expect(PUBLIC_PATHS).toContain("/");
      expect(PUBLIC_PATHS).toContain("/login");
      expect(PUBLIC_PATHS).toContain("/api/auth/login");
      expect(PUBLIC_PATHS).toContain("/api/auth/register");
      expect(PUBLIC_PATHS).toContain("/api/health");
    });

    it("debe incluir rutas de productos y membresías", () => {
      expect(PUBLIC_PATHS).toContain("/api/products");
      expect(PUBLIC_PATHS).toContain("/api/memberships");
    });

    it("debe incluir ruta de cotizaciones temporales", () => {
      expect(PUBLIC_PATHS).toContain("/api/quotations/temporary");
    });

    it("debe ser un array no vacío", () => {
      expect(Array.isArray(PUBLIC_PATHS)).toBe(true);
      expect(PUBLIC_PATHS.length).toBeGreaterThan(0);
    });
  });

  describe("PROTECTED_PATHS", () => {
    it("debe incluir rutas protegidas esenciales", () => {
      expect(PROTECTED_PATHS).toContain("/dashboard");
      expect(PROTECTED_PATHS).toContain("/api/quotations");
      expect(PROTECTED_PATHS).toContain("/api/users");
      expect(PROTECTED_PATHS).toContain("/api/payments");
    });

    it("debe ser un array no vacío", () => {
      expect(Array.isArray(PROTECTED_PATHS)).toBe(true);
      expect(PROTECTED_PATHS.length).toBeGreaterThan(0);
    });
  });

  describe("ADMIN_ROLES", () => {
    it("debe incluir roles administrativos correctos", () => {
      expect(ADMIN_ROLES).toContain("ADM1");
      expect(ADMIN_ROLES).toContain("ADM2");
      expect(ADMIN_ROLES).toContain("ASIN");
      expect(ADMIN_ROLES).toContain("ASEX");
      expect(ADMIN_ROLES).toContain("CEO1");
      expect(ADMIN_ROLES).toContain("CEO2");
      expect(ADMIN_ROLES).toContain("CEO3");
      expect(ADMIN_ROLES).toContain("CEOM");
    });

    it("debe ser un array no vacío", () => {
      expect(Array.isArray(ADMIN_ROLES)).toBe(true);
      expect(ADMIN_ROLES.length).toBeGreaterThan(0);
    });
  });

  describe("JWT_CONFIG", () => {
    it("debe tener MAX_AGE_SECONDS configurado", () => {
      expect(JWT_CONFIG.MAX_AGE_SECONDS).toBe(30 * 24 * 60 * 60); // 30 días en segundos
    });

    it("debe ser un objeto con propiedades correctas", () => {
      expect(typeof JWT_CONFIG).toBe("object");
      expect(JWT_CONFIG).toHaveProperty("MAX_AGE_SECONDS");
    });
  });

  describe("MIDDLEWARE_MATCHER", () => {
    it("debe incluir rutas del dashboard", () => {
      expect(MIDDLEWARE_MATCHER).toContain("/dashboard/:path*");
    });

    it("debe incluir rutas de API protegidas", () => {
      expect(MIDDLEWARE_MATCHER).toContain("/api/quotations/:path*");
      expect(MIDDLEWARE_MATCHER).toContain("/api/users/:path*");
      expect(MIDDLEWARE_MATCHER).toContain("/api/payments/:path*");
    });

    it("debe incluir rutas de tenants", () => {
      expect(MIDDLEWARE_MATCHER).toContain("/tenant/:path*");
      expect(MIDDLEWARE_MATCHER).toContain("/api/tenant/:path*");
    });

    it("debe ser un array no vacío", () => {
      expect(Array.isArray(MIDDLEWARE_MATCHER)).toBe(true);
      expect(MIDDLEWARE_MATCHER.length).toBeGreaterThan(0);
    });
  });
});
