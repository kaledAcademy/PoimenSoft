/**
 * Tests unitarios para roles.ts
 * Valida constantes y funciones de roles
 */

import {
  ALL_ROLES,
  CLIENT_ROLES,
  ADVISOR_ROLES,
  ADMIN_ROLES,
  CEO_ROLES,
  ALLOWED_AUTH_ROLES,
  isRoleAllowed,
} from "../roles";
import { UserRole } from "@prisma/client";

describe("roles", () => {
  describe("Constantes de roles", () => {
    it("debe tener todos los roles definidos", () => {
      expect(ALL_ROLES).toContain(UserRole.USST);
      expect(ALL_ROLES).toContain(UserRole.USPR);
      expect(ALL_ROLES).toContain(UserRole.USPL);
      expect(ALL_ROLES).toContain(UserRole.ASIN);
      expect(ALL_ROLES).toContain(UserRole.ASEX);
      expect(ALL_ROLES).toContain(UserRole.ADM1);
      expect(ALL_ROLES).toContain(UserRole.ADM2);
      expect(ALL_ROLES).toContain(UserRole.CEO1);
      expect(ALL_ROLES).toContain(UserRole.CEO2);
      expect(ALL_ROLES).toContain(UserRole.CEO3);
      expect(ALL_ROLES).toContain(UserRole.CEOM);
    });

    it("debe tener roles de clientes correctos", () => {
      expect(CLIENT_ROLES).toContain(UserRole.USST);
      expect(CLIENT_ROLES).toContain(UserRole.USPR);
      expect(CLIENT_ROLES).toContain(UserRole.USPL);
      expect(CLIENT_ROLES.length).toBe(3);
    });

    it("debe tener roles de asesores correctos", () => {
      expect(ADVISOR_ROLES).toContain(UserRole.ASIN);
      expect(ADVISOR_ROLES).toContain(UserRole.ASEX);
      expect(ADVISOR_ROLES.length).toBe(2);
    });

    it("debe tener roles de administradores correctos", () => {
      expect(ADMIN_ROLES).toContain(UserRole.ADM1);
      expect(ADMIN_ROLES).toContain(UserRole.ADM2);
      expect(ADMIN_ROLES.length).toBe(2);
    });

    it("debe tener roles de CEO correctos", () => {
      expect(CEO_ROLES).toContain(UserRole.CEO1);
      expect(CEO_ROLES).toContain(UserRole.CEO2);
      expect(CEO_ROLES).toContain(UserRole.CEO3);
      expect(CEO_ROLES).toContain(UserRole.CEOM);
      expect(CEO_ROLES.length).toBe(4);
    });

    it("debe tener todos los roles permitidos para auth", () => {
      expect(ALLOWED_AUTH_ROLES.length).toBe(ALL_ROLES.length);
    });
  });

  describe("isRoleAllowed", () => {
    it("debe retornar true para rol permitido", () => {
      expect(isRoleAllowed(UserRole.USST, [UserRole.USST, UserRole.USPR])).toBe(true);
    });

    it("debe retornar false para rol no permitido", () => {
      expect(isRoleAllowed(UserRole.USST, [UserRole.USPR])).toBe(false);
    });

    it("debe usar ALL_ROLES por defecto", () => {
      expect(isRoleAllowed(UserRole.USST)).toBe(true);
      expect(isRoleAllowed(UserRole.USPR)).toBe(true);
      expect(isRoleAllowed(UserRole.ADM1)).toBe(true);
    });

    it("debe funcionar con lista vacia", () => {
      expect(isRoleAllowed(UserRole.USST, [])).toBe(false);
    });
  });
});
