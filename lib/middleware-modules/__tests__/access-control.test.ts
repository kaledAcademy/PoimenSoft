/**
 * Tests unitarios para access-control.ts
 * Valida lógica de control de acceso a rutas protegidas
 */

import {
  isPublicPath,
  isProtectedPath,
  isAdminRole,
  canAccessDashboard,
  shouldRedirectToLogin,
  isApiRoute,
} from "../access-control";
import { UserRole } from "@prisma/client";

describe("AccessControl", () => {
  describe("isPublicPath", () => {
    it("debe retornar true para ruta pública exacta", () => {
      expect(isPublicPath("/")).toBe(true);
      expect(isPublicPath("/login")).toBe(true);
    });

    it("debe retornar true para subrutas públicas", () => {
      expect(isPublicPath("/login/forgot")).toBe(true);
    });

    it("debe retornar false para rutas protegidas", () => {
      expect(isPublicPath("/dashboard")).toBe(false);
    });
  });

  describe("isProtectedPath", () => {
    it("debe retornar true para rutas protegidas", () => {
      expect(isProtectedPath("/dashboard")).toBe(true);
      expect(isProtectedPath("/dashboard/settings")).toBe(true);
    });

    it("debe retornar false para rutas públicas", () => {
      expect(isProtectedPath("/")).toBe(false);
      expect(isProtectedPath("/login")).toBe(false);
    });
  });

  describe("isAdminRole", () => {
    it("debe retornar true para roles administrativos", () => {
      expect(isAdminRole(UserRole.ADM1)).toBe(true);
      expect(isAdminRole(UserRole.ADM2)).toBe(true);
      expect(isAdminRole(UserRole.CEO1)).toBe(true);
      expect(isAdminRole(UserRole.ASIN)).toBe(true);
      expect(isAdminRole(UserRole.ASEX)).toBe(true);
    });

    it("debe retornar false para roles no administrativos", () => {
      expect(isAdminRole(UserRole.USST)).toBe(false);
      expect(isAdminRole(UserRole.USPR)).toBe(false);
      expect(isAdminRole(UserRole.USPL)).toBe(false);
    });
  });

  describe("canAccessDashboard", () => {
    it("debe permitir acceso a administradores", () => {
      const result = canAccessDashboard({
        userId: "1",
        email: "admin@example.com",
        role: UserRole.ADM1,
        hasCompletedPurchase: false,
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe("admin");
    });

    it("debe permitir acceso a usuarios con compra completada", () => {
      const result = canAccessDashboard({
        userId: "1",
        email: "user@example.com",
        role: UserRole.USST,
        hasCompletedPurchase: true,
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe("purchase_completed");
    });

    it("debe rechazar acceso a usuarios sin compra", () => {
      const result = canAccessDashboard({
        userId: "1",
        email: "user@example.com",
        role: UserRole.USST,
        hasCompletedPurchase: false,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("no_purchase");
    });
  });

  describe("shouldRedirectToLogin", () => {
    it("debe retornar true para rutas de dashboard", () => {
      expect(shouldRedirectToLogin("/dashboard")).toBe(true);
      expect(shouldRedirectToLogin("/dashboard/settings")).toBe(true);
    });

    it("debe retornar true para rutas de docs", () => {
      expect(shouldRedirectToLogin("/docs")).toBe(true);
    });

    it("debe retornar false para otras rutas", () => {
      expect(shouldRedirectToLogin("/")).toBe(false);
      expect(shouldRedirectToLogin("/login")).toBe(false);
    });
  });

  describe("isApiRoute", () => {
    it("debe retornar true para rutas de API", () => {
      expect(isApiRoute("/api/auth/login")).toBe(true);
      expect(isApiRoute("/api/users")).toBe(true);
    });

    it("debe retornar false para rutas no API", () => {
      expect(isApiRoute("/dashboard")).toBe(false);
      expect(isApiRoute("/login")).toBe(false);
    });
  });
});
