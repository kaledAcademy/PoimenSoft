/**
 * Tests unitarios para common-schemas.ts
 * Valida schemas Zod reutilizables y mensajes de error en espanol
 */

import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  firstNameSchema,
  lastNameSchema,
  fullNameSchema,
  companyNameSchema,
  nitSchema,
  nitWithoutDvSchema,
  documentNumberSchema,
  addressSchema,
  citySchema,
  departmentSchema,
  documentTypeSchema,
  taxRegimeSchema,
  companyTaxRegimeSchema,
  userTypeSchema,
  requiredCheckboxSchema,
  optionalCheckboxSchema,
} from "../common-schemas";

describe("common-schemas", () => {
  describe("emailSchema", () => {
    it("debe validar email correcto", () => {
      expect(emailSchema.safeParse("test@example.com").success).toBe(true);
      expect(emailSchema.safeParse("user.name@domain.co").success).toBe(true);
      expect(emailSchema.safeParse("user+tag@example.com").success).toBe(true);
    });

    it("debe rechazar email vacio", () => {
      const result = emailSchema.safeParse("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("obligatorio");
      }
    });

    it("debe rechazar email sin formato valido", () => {
      const result = emailSchema.safeParse("invalid-email");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("formato");
      }
    });

    it("debe rechazar email sin dominio", () => {
      expect(emailSchema.safeParse("test@").success).toBe(false);
    });

    it("debe rechazar email muy largo", () => {
      const longEmail = "a".repeat(250) + "@test.com";
      expect(emailSchema.safeParse(longEmail).success).toBe(false);
    });

    it("mensaje de error debe estar en espanol", () => {
      const result = emailSchema.safeParse("bad");
      expect(result.success).toBe(false);
      if (!result.success) {
        const message = result.error.issues[0].message;
        expect(message).not.toContain("Invalid");
        expect(message).toMatch(/email|formato|válido/i);
      }
    });
  });

  describe("passwordSchema", () => {
    it("debe validar contrasena segura", () => {
      expect(passwordSchema.safeParse("Test1234").success).toBe(true);
      expect(passwordSchema.safeParse("Abc12345").success).toBe(true);
      expect(passwordSchema.safeParse("SecurePass1").success).toBe(true);
    });

    it("debe rechazar contrasena muy corta", () => {
      const result = passwordSchema.safeParse("Ab1");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("8 caracteres");
      }
    });

    it("debe rechazar contrasena sin mayuscula", () => {
      const result = passwordSchema.safeParse("test1234");
      expect(result.success).toBe(false);
    });

    it("debe rechazar contrasena sin minuscula", () => {
      const result = passwordSchema.safeParse("TEST1234");
      expect(result.success).toBe(false);
    });

    it("debe rechazar contrasena sin numero", () => {
      const result = passwordSchema.safeParse("TestPassword");
      expect(result.success).toBe(false);
    });

    it("debe rechazar contrasena solo numeros", () => {
      const result = passwordSchema.safeParse("12345678");
      expect(result.success).toBe(false);
    });

    it("debe rechazar contrasena muy larga", () => {
      const longPass = "A".repeat(50) + "a".repeat(50) + "1";
      expect(passwordSchema.safeParse(longPass).success).toBe(false);
    });

    it("mensaje de error debe indicar requisitos", () => {
      const result = passwordSchema.safeParse("weak");
      expect(result.success).toBe(false);
      if (!result.success) {
        // Debe mencionar requisitos
        const messages = result.error.issues.map((i) => i.message).join(" ");
        expect(messages).toMatch(/mayúscula|minúscula|número|caracteres/i);
      }
    });
  });

  describe("phoneSchema", () => {
    it("debe validar telefono colombiano de 10 digitos", () => {
      expect(phoneSchema.safeParse("3001234567").success).toBe(true);
      expect(phoneSchema.safeParse("3101234567").success).toBe(true);
      expect(phoneSchema.safeParse("6011234567").success).toBe(true);
    });

    it("debe rechazar telefono vacio", () => {
      const result = phoneSchema.safeParse("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("obligatorio");
      }
    });

    it("debe rechazar telefono con menos de 10 digitos", () => {
      const result = phoneSchema.safeParse("300123456");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("10 dígitos");
      }
    });

    it("debe rechazar telefono con mas de 10 digitos", () => {
      expect(phoneSchema.safeParse("30012345678").success).toBe(false);
    });

    it("debe rechazar telefono con letras", () => {
      expect(phoneSchema.safeParse("300ABC4567").success).toBe(false);
    });

    it("debe rechazar telefono con caracteres especiales", () => {
      expect(phoneSchema.safeParse("300-123-4567").success).toBe(false);
      expect(phoneSchema.safeParse("+573001234567").success).toBe(false);
    });

    it("debe rechazar telefono de solo ceros (edge case)", () => {
      const result = phoneSchema.safeParse("0000000000");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("ceros");
      }
    });
  });

  describe("firstNameSchema", () => {
    it("debe validar nombres validos", () => {
      expect(firstNameSchema.safeParse("Juan").success).toBe(true);
      expect(firstNameSchema.safeParse("Maria Jose").success).toBe(true);
      expect(firstNameSchema.safeParse("Jose").success).toBe(true);
    });

    it("debe validar nombres con acentos", () => {
      expect(firstNameSchema.safeParse("Andres").success).toBe(true);
      expect(firstNameSchema.safeParse("Maria").success).toBe(true);
    });

    it("debe rechazar nombre muy corto", () => {
      const result = firstNameSchema.safeParse("A");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("2 caracteres");
      }
    });

    it("debe rechazar nombre con numeros", () => {
      expect(firstNameSchema.safeParse("Juan123").success).toBe(false);
    });

    it("debe rechazar nombre con caracteres especiales", () => {
      expect(firstNameSchema.safeParse("Juan@Carlos").success).toBe(false);
      expect(firstNameSchema.safeParse("Juan-Carlos").success).toBe(false);
    });

    it("debe rechazar nombre muy largo", () => {
      const longName = "A".repeat(51);
      expect(firstNameSchema.safeParse(longName).success).toBe(false);
    });
  });

  describe("lastNameSchema", () => {
    it("debe validar apellidos validos", () => {
      expect(lastNameSchema.safeParse("Garcia").success).toBe(true);
      expect(lastNameSchema.safeParse("de la Cruz").success).toBe(true);
    });

    it("debe rechazar apellido muy corto", () => {
      expect(lastNameSchema.safeParse("A").success).toBe(false);
    });

    it("debe rechazar apellido con numeros", () => {
      expect(lastNameSchema.safeParse("Garcia123").success).toBe(false);
    });
  });

  describe("companyNameSchema", () => {
    it("debe validar razon social valida", () => {
      expect(companyNameSchema.safeParse("Empresa ABC S.A.S.").success).toBe(true);
      expect(companyNameSchema.safeParse("Tecnologia y Servicios Ltda").success).toBe(true);
    });

    it("debe validar razon social con numeros", () => {
      expect(companyNameSchema.safeParse("Empresa 123").success).toBe(true);
    });

    it("debe rechazar razon social muy corta", () => {
      const result = companyNameSchema.safeParse("AB");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("3 caracteres");
      }
    });

    it("debe rechazar caracteres no permitidos", () => {
      expect(companyNameSchema.safeParse("Empresa@Test").success).toBe(false);
      expect(companyNameSchema.safeParse("Empresa#123").success).toBe(false);
    });
  });

  describe("nitSchema", () => {
    it("debe validar NIT con formato correcto y DV valido", () => {
      // NIT 830999999 tiene DV = 0
      expect(nitSchema.safeParse("830999999-0").success).toBe(true);
    });

    it("debe rechazar NIT sin guion", () => {
      expect(nitSchema.safeParse("8309999990").success).toBe(false);
    });

    it("debe rechazar NIT con formato incorrecto", () => {
      const result = nitSchema.safeParse("12345-0");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("9 dígitos");
      }
    });

    it("debe rechazar NIT con DV incorrecto", () => {
      // NIT 830999999 tiene DV = 0, probamos con 1
      const result = nitSchema.safeParse("830999999-1");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("dígito verificador");
      }
    });

    it("debe rechazar NIT vacio", () => {
      const result = nitSchema.safeParse("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("obligatorio");
      }
    });
  });

  describe("nitWithoutDvSchema", () => {
    it("debe validar NIT de 9 digitos sin DV", () => {
      expect(nitWithoutDvSchema.safeParse("830999999").success).toBe(true);
      expect(nitWithoutDvSchema.safeParse("900123456").success).toBe(true);
    });

    it("debe rechazar NIT con guion", () => {
      expect(nitWithoutDvSchema.safeParse("830999999-0").success).toBe(false);
    });

    it("debe rechazar NIT con menos de 9 digitos", () => {
      expect(nitWithoutDvSchema.safeParse("12345678").success).toBe(false);
    });

    it("debe rechazar NIT con mas de 9 digitos", () => {
      expect(nitWithoutDvSchema.safeParse("1234567890").success).toBe(false);
    });
  });

  describe("documentNumberSchema", () => {
    it("debe validar documentos validos", () => {
      expect(documentNumberSchema.safeParse("12345678").success).toBe(true);
      expect(documentNumberSchema.safeParse("1234567890").success).toBe(true);
      expect(documentNumberSchema.safeParse("AB123456").success).toBe(true); // Pasaporte
    });

    it("debe rechazar documento muy corto", () => {
      const result = documentNumberSchema.safeParse("1234");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("5 caracteres");
      }
    });

    it("debe rechazar caracteres especiales", () => {
      expect(documentNumberSchema.safeParse("123-456-78").success).toBe(false);
    });
  });

  describe("addressSchema", () => {
    it("debe validar direccion valida", () => {
      expect(addressSchema.safeParse("Calle 123 # 45-67").success).toBe(true);
      expect(addressSchema.safeParse("Carrera 10 No. 20-30 Apto 501").success).toBe(true);
    });

    it("debe rechazar direccion muy corta", () => {
      const result = addressSchema.safeParse("Cl 1");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("5 caracteres");
      }
    });
  });

  describe("citySchema", () => {
    it("debe validar ciudades validas", () => {
      expect(citySchema.safeParse("Bogota").success).toBe(true);
      expect(citySchema.safeParse("Medellin").success).toBe(true);
      expect(citySchema.safeParse("Cali").success).toBe(true);
    });

    it("debe rechazar ciudad con numeros", () => {
      expect(citySchema.safeParse("Bogota123").success).toBe(false);
    });
  });

  describe("departmentSchema", () => {
    it("debe validar departamentos validos", () => {
      expect(departmentSchema.safeParse("Cundinamarca").success).toBe(true);
      expect(departmentSchema.safeParse("Antioquia").success).toBe(true);
    });

    it("debe rechazar departamento con numeros", () => {
      expect(departmentSchema.safeParse("Cundinamarca123").success).toBe(false);
    });
  });

  describe("documentTypeSchema (enum)", () => {
    it("debe validar tipos de documento validos", () => {
      expect(documentTypeSchema.safeParse("CEDULA_CIUDADANIA").success).toBe(true);
      expect(documentTypeSchema.safeParse("CEDULA_EXTRANJERIA").success).toBe(true);
      expect(documentTypeSchema.safeParse("PASAPORTE").success).toBe(true);
      expect(documentTypeSchema.safeParse("NIT").success).toBe(true);
    });

    it("debe rechazar tipo de documento invalido", () => {
      const result = documentTypeSchema.safeParse("OTRO");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("válido");
      }
    });
  });

  describe("taxRegimeSchema (enum)", () => {
    it("debe validar regimenes tributarios validos", () => {
      expect(taxRegimeSchema.safeParse("SIMPLIFICADO").success).toBe(true);
      expect(taxRegimeSchema.safeParse("COMUN").success).toBe(true);
      expect(taxRegimeSchema.safeParse("SIMPLE_TRIBUTARIO").success).toBe(true);
    });

    it("debe rechazar regimen invalido", () => {
      expect(taxRegimeSchema.safeParse("OTRO").success).toBe(false);
    });
  });

  describe("companyTaxRegimeSchema (enum)", () => {
    it("debe validar regimenes de empresa validos", () => {
      expect(companyTaxRegimeSchema.safeParse("RESPONSABLE_IVA").success).toBe(true);
      expect(companyTaxRegimeSchema.safeParse("NO_RESPONSABLE_IVA").success).toBe(true);
      expect(companyTaxRegimeSchema.safeParse("GRAN_CONTRIBUYENTE").success).toBe(true);
    });

    it("debe rechazar regimen invalido", () => {
      expect(companyTaxRegimeSchema.safeParse("OTRO").success).toBe(false);
    });
  });

  describe("userTypeSchema (enum)", () => {
    it("debe validar tipos de usuario validos", () => {
      expect(userTypeSchema.safeParse("NATURAL").success).toBe(true);
      expect(userTypeSchema.safeParse("JURIDICA").success).toBe(true);
    });

    it("debe rechazar tipo invalido", () => {
      expect(userTypeSchema.safeParse("EMPRESA").success).toBe(false);
    });
  });

  describe("requiredCheckboxSchema", () => {
    it("debe validar solo cuando es true", () => {
      expect(requiredCheckboxSchema.safeParse(true).success).toBe(true);
    });

    it("debe rechazar false", () => {
      const result = requiredCheckboxSchema.safeParse(false);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("aceptar");
      }
    });
  });

  describe("optionalCheckboxSchema", () => {
    it("debe aceptar true", () => {
      expect(optionalCheckboxSchema.safeParse(true).success).toBe(true);
    });

    it("debe aceptar false", () => {
      expect(optionalCheckboxSchema.safeParse(false).success).toBe(true);
    });

    it("debe aceptar undefined (default false)", () => {
      expect(optionalCheckboxSchema.safeParse(undefined).success).toBe(true);
    });
  });
});
