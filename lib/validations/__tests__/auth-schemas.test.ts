/**
 * Tests unitarios para auth-schemas.ts
 * Valida schemas de autenticacion y registro
 */

import {
  quickRegistrationSchema,
  loginSchema,
  QuickRegistrationData,
  LoginData,
} from "../auth-schemas";

describe("auth-schemas", () => {
  describe("quickRegistrationSchema", () => {
    const validData: QuickRegistrationData = {
      firstName: "Juan",
      lastName: "Garcia",
      email: "juan@example.com",
      phone: "3001234567",
      password: "Test1234",
      confirmPassword: "Test1234",
      acceptDataPolicy: true,
      acceptTerms: true,
      acceptMarketing: false,
    };

    describe("Validacion completa", () => {
      it("debe validar datos correctos", () => {
        const result = quickRegistrationSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it("debe validar con acceptMarketing true", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          acceptMarketing: true,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Validacion de nombre", () => {
      it("debe rechazar nombre vacio", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          firstName: "",
        });
        expect(result.success).toBe(false);
      });

      it("debe rechazar nombre muy corto", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          firstName: "A",
        });
        expect(result.success).toBe(false);
      });

      it("debe rechazar nombre con numeros", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          firstName: "Juan123",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Validacion de apellido", () => {
      it("debe rechazar apellido vacio", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          lastName: "",
        });
        expect(result.success).toBe(false);
      });

      it("debe rechazar apellido muy corto", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          lastName: "G",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Validacion de email", () => {
      it("debe rechazar email invalido", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          email: "invalid-email",
        });
        expect(result.success).toBe(false);
      });

      it("debe rechazar email vacio", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          email: "",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Validacion de telefono", () => {
      it("debe rechazar telefono corto", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          phone: "300123456",
        });
        expect(result.success).toBe(false);
      });

      it("debe rechazar telefono con letras", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          phone: "300ABC4567",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Validacion de contrasena", () => {
      it("debe rechazar contrasena debil", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          password: "weak",
          confirmPassword: "weak",
        });
        expect(result.success).toBe(false);
      });

      it("debe rechazar contrasena sin mayuscula", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          password: "test1234",
          confirmPassword: "test1234",
        });
        expect(result.success).toBe(false);
      });

      it("debe rechazar contrasena sin numero", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          password: "TestPassword",
          confirmPassword: "TestPassword",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Validacion de confirmacion de contrasena", () => {
      it("debe rechazar cuando contrasenas no coinciden", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          password: "Test1234",
          confirmPassword: "Test5678",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          // El error debe estar en confirmPassword
          const confirmError = result.error.issues.find((issue) =>
            issue.path.includes("confirmPassword")
          );
          expect(confirmError).toBeDefined();
          expect(confirmError?.message).toContain("no coinciden");
        }
      });

      it("debe rechazar confirmPassword vacio", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          confirmPassword: "",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const confirmError = result.error.issues.find((issue) =>
            issue.path.includes("confirmPassword")
          );
          expect(confirmError?.message).toContain("confirmar");
        }
      });
    });

    describe("Validacion de checkboxes", () => {
      it("debe rechazar si no acepta politica de datos", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          acceptDataPolicy: false,
        });
        expect(result.success).toBe(false);
      });

      it("debe rechazar si no acepta terminos", () => {
        const result = quickRegistrationSchema.safeParse({
          ...validData,
          acceptTerms: false,
        });
        expect(result.success).toBe(false);
      });

      it("acceptMarketing debe ser opcional", () => {
        const dataWithoutMarketing = {
          firstName: "Juan",
          lastName: "Garcia",
          email: "juan@example.com",
          phone: "3001234567",
          password: "Test1234",
          confirmPassword: "Test1234",
          acceptDataPolicy: true,
          acceptTerms: true,
          // Sin acceptMarketing
        };

        const result = quickRegistrationSchema.safeParse(dataWithoutMarketing);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.acceptMarketing).toBe(false); // Default false
        }
      });
    });

    describe("Mensajes de error en espanol", () => {
      it("mensajes deben estar en espanol", () => {
        const result = quickRegistrationSchema.safeParse({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          acceptDataPolicy: false,
          acceptTerms: false,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message);
          // Verificar que al menos algunos mensajes estan en espanol
          const spanishKeywords = ["obligatorio", "caracteres", "debe", "formato", "aceptar"];
          const hasSpanishMessage = messages.some((msg) =>
            spanishKeywords.some((keyword) => msg.toLowerCase().includes(keyword))
          );
          expect(hasSpanishMessage).toBe(true);
        }
      });
    });
  });

  describe("loginSchema", () => {
    const validLogin: LoginData = {
      email: "user@example.com",
      password: "password",
    };

    describe("Validacion completa", () => {
      it("debe validar login correcto", () => {
        const result = loginSchema.safeParse(validLogin);
        expect(result.success).toBe(true);
      });

      it("debe validar cualquier contrasena no vacia", () => {
        // Login no valida fortaleza, solo que no este vacia
        const result = loginSchema.safeParse({
          email: "user@example.com",
          password: "1",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Validacion de email", () => {
      it("debe rechazar email vacio", () => {
        const result = loginSchema.safeParse({
          ...validLogin,
          email: "",
        });
        expect(result.success).toBe(false);
      });

      it("debe rechazar email invalido", () => {
        const result = loginSchema.safeParse({
          ...validLogin,
          email: "not-an-email",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Validacion de contrasena", () => {
      it("debe rechazar contrasena vacia", () => {
        const result = loginSchema.safeParse({
          ...validLogin,
          password: "",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("obligatoria");
        }
      });
    });

    describe("Diferencia con registro", () => {
      it("login no requiere confirmPassword", () => {
        const result = loginSchema.safeParse({
          email: "user@example.com",
          password: "anypassword",
        });
        expect(result.success).toBe(true);
      });

      it("login no requiere checkboxes", () => {
        const result = loginSchema.safeParse({
          email: "user@example.com",
          password: "anypassword",
        });
        expect(result.success).toBe(true);
      });

      it("login no valida fortaleza de contrasena", () => {
        // Una contrasena debil es valida para login
        const result = loginSchema.safeParse({
          email: "user@example.com",
          password: "a",
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
