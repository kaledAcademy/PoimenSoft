/**
 * Tests unitarios para tenant.schemas.ts
 * Valida schemas de validacion de tenants
 */

import {
  tenantNameSchema,
  tenantSlugSchema,
  tenantNitSchema,
  createTenantSchema,
  updateTenantSchema,
  tenantFiltersSchema,
  TENANT_PLANS,
  TENANT_STATUSES,
} from "../tenant.schemas";

describe("tenant-schemas", () => {
  describe("tenantNameSchema", () => {
    it("debe validar nombre correcto", () => {
      expect(() => tenantNameSchema.parse("Empresa Test")).not.toThrow();
    });

    it("debe rechazar nombre muy corto", () => {
      expect(() => tenantNameSchema.parse("AB")).toThrow();
    });

    it("debe rechazar nombre muy largo", () => {
      const longName = "A".repeat(101);
      expect(() => tenantNameSchema.parse(longName)).toThrow();
    });

    it("debe rechazar caracteres especiales invalidos", () => {
      expect(() => tenantNameSchema.parse("Empresa@Test")).toThrow();
    });

    it("debe aceptar caracteres especiales validos", () => {
      expect(() => tenantNameSchema.parse("Empresa-Test_S.A.S.")).not.toThrow();
    });
  });

  describe("tenantSlugSchema", () => {
    it("debe validar slug correcto", () => {
      expect(() => tenantSlugSchema.parse("empresa-test")).not.toThrow();
    });

    it("debe rechazar slug con mayusculas", () => {
      expect(() => tenantSlugSchema.parse("Empresa-Test")).toThrow();
    });

    it("debe rechazar slug con espacios", () => {
      expect(() => tenantSlugSchema.parse("empresa test")).toThrow();
    });

    it("debe rechazar slug que empieza con guion", () => {
      expect(() => tenantSlugSchema.parse("-empresa-test")).toThrow();
    });

    it("debe rechazar slug muy corto", () => {
      expect(() => tenantSlugSchema.parse("ab")).toThrow();
    });
  });

  describe("tenantNitSchema", () => {
    it("debe validar NIT correcto", () => {
      expect(() => tenantNitSchema.parse("900123456")).not.toThrow();
    });

    it("debe aceptar NIT con guiones", () => {
      expect(() => tenantNitSchema.parse("900-123-456")).not.toThrow();
    });

    it("debe rechazar NIT con letras", () => {
      expect(() => tenantNitSchema.parse("900ABC456")).toThrow();
    });

    it("debe rechazar NIT muy corto", () => {
      expect(() => tenantNitSchema.parse("12345")).toThrow();
    });

    it("debe ser opcional", () => {
      expect(() => tenantNitSchema.parse(undefined)).not.toThrow();
    });
  });

  describe("createTenantSchema", () => {
    it("debe validar datos completos", () => {
      const validData = {
        userId: "clx1234567890abcdefghij",
        name: "Empresa Test",
        email: "test@example.com",
        plan: "BASIC" as const,
      };

      expect(() => createTenantSchema.parse(validData)).not.toThrow();
    });

    it("debe rechazar userId invalido", () => {
      const invalidData = {
        userId: "invalid-id",
        name: "Empresa Test",
        email: "test@example.com",
      };

      expect(() => createTenantSchema.parse(invalidData)).toThrow();
    });

    it("debe usar plan BASIC por defecto", () => {
      const data = {
        userId: "clx1234567890abcdefghij",
        name: "Empresa Test",
        email: "test@example.com",
      };

      const result = createTenantSchema.parse(data);
      expect(result.plan).toBe("BASIC");
    });
  });

  describe("updateTenantSchema", () => {
    it("debe validar actualizacion parcial", () => {
      const validData = {
        name: "Nuevo Nombre",
      };

      expect(() => updateTenantSchema.parse(validData)).not.toThrow();
    });

    it("debe rechazar maxUsers negativo", () => {
      const invalidData = {
        maxUsers: -5,
      };

      expect(() => updateTenantSchema.parse(invalidData)).toThrow();
    });

    it("debe aceptar todos los campos opcionales", () => {
      const validData = {
        name: "Nuevo Nombre",
        email: "nuevo@example.com",
        plan: "PRO" as const,
        status: "ACTIVE" as const,
        maxUsers: 10,
      };

      expect(() => updateTenantSchema.parse(validData)).not.toThrow();
    });
  });

  describe("tenantFiltersSchema", () => {
    it("debe validar filtros correctos", () => {
      const validData = {
        status: "ACTIVE" as const,
        plan: "PRO" as const,
        search: "test",
        page: 1,
        limit: 20,
      };

      expect(() => tenantFiltersSchema.parse(validData)).not.toThrow();
    });

    it("debe usar valores por defecto", () => {
      const result = tenantFiltersSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("debe rechazar limite mayor a 100", () => {
      expect(() => tenantFiltersSchema.parse({ limit: 200 })).toThrow();
    });
  });

  describe("Constantes", () => {
    it("debe tener planes definidos", () => {
      expect(TENANT_PLANS).toContain("BASIC");
      expect(TENANT_PLANS).toContain("PRO");
      expect(TENANT_PLANS).toContain("ENTERPRISE");
    });

    it("debe tener estados definidos", () => {
      expect(TENANT_STATUSES).toContain("PENDING");
      expect(TENANT_STATUSES).toContain("ACTIVE");
      expect(TENANT_STATUSES).toContain("SUSPENDED");
      expect(TENANT_STATUSES).toContain("CANCELLED");
    });
  });
});
