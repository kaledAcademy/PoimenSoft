/**
 * Tests unitarios para profile-schemas.ts
 * Valida schemas de validacion de perfiles
 */

import { completeProfileSchema } from "../profile-schemas";
import { UserType, DocumentType, TaxRegime, CompanyTaxRegime } from "@prisma/client";

describe("profile-schemas", () => {
  describe("completeProfileSchema", () => {
    describe("Persona Natural", () => {
      it("debe validar perfil completo de persona natural", () => {
        const validData = {
          userType: UserType.NATURAL,
          email: "test@example.com",
          phone: "3001234567",
          address: "Calle 123",
          firstName: "Juan",
          lastName: "Garcia",
          documentType: DocumentType.CEDULA_CIUDADANIA,
          documentNumber: "1234567890",
          taxRegime: TaxRegime.SIMPLIFICADO,
          useQuotationEmail: true, // Persona natural siempre usa email de cotizacion
        };

        expect(() => completeProfileSchema.parse(validData)).not.toThrow();
      });

      it("debe rechazar si falta nombre", () => {
        const invalidData = {
          userType: UserType.NATURAL,
          email: "test@example.com",
          phone: "3001234567",
          address: "Calle 123",
          // Falta firstName y fullName
        };

        expect(() => completeProfileSchema.parse(invalidData)).toThrow();
      });

      it("debe aceptar fullName en lugar de firstName/lastName", () => {
        const validData = {
          userType: UserType.NATURAL,
          email: "test@example.com",
          phone: "3001234567",
          address: "Calle 123",
          fullName: "Juan Garcia",
          documentType: DocumentType.CEDULA_CIUDADANIA,
          documentNumber: "1234567890",
          taxRegime: TaxRegime.SIMPLIFICADO,
          useQuotationEmail: true,
        };

        expect(() => completeProfileSchema.parse(validData)).not.toThrow();
      });

      it("debe rechazar si falta documento", () => {
        const invalidData = {
          userType: UserType.NATURAL,
          email: "test@example.com",
          phone: "3001234567",
          address: "Calle 123",
          firstName: "Juan",
          lastName: "Garcia",
          // Falta documentType y documentNumber
        };

        expect(() => completeProfileSchema.parse(invalidData)).toThrow();
      });
    });

    describe("Persona Juridica", () => {
      it("debe validar perfil completo de persona juridica", () => {
        const validData = {
          userType: UserType.JURIDICA,
          email: "test@example.com",
          phone: "3001234567",
          address: "Calle 123",
          companyName: "Empresa Test S.A.S.",
          nit: "900123456",
          companyTaxRegime: CompanyTaxRegime.RESPONSABLE_IVA,
          legalRepresentativeName: "Juan Garcia",
          legalRepresentativeDocument: "1234567890",
          useQuotationEmail: false, // Campo requerido
          authEmail: "auth@example.com", // Requerido si useQuotationEmail es false
          password: "Password123!",
          confirmPassword: "Password123!",
        };

        expect(() => completeProfileSchema.parse(validData)).not.toThrow();
      });

      it("debe rechazar si falta razon social", () => {
        const invalidData = {
          userType: UserType.JURIDICA,
          email: "test@example.com",
          phone: "3001234567",
          address: "Calle 123",
          nit: "900123456",
          companyTaxRegime: CompanyTaxRegime.RESPONSABLE_IVA,
          legalRepresentativeName: "Juan Garcia",
          legalRepresentativeDocument: "1234567890",
          useQuotationEmail: false,
          authEmail: "auth@example.com",
          password: "Password123!",
          confirmPassword: "Password123!",
          // Falta companyName
        };

        expect(() => completeProfileSchema.parse(invalidData)).toThrow();
      });

      it("debe rechazar si falta NIT", () => {
        const invalidData = {
          userType: UserType.JURIDICA,
          email: "test@example.com",
          phone: "3001234567",
          address: "Calle 123",
          companyName: "Empresa Test",
          companyTaxRegime: CompanyTaxRegime.RESPONSABLE_IVA,
          legalRepresentativeName: "Juan Garcia",
          legalRepresentativeDocument: "1234567890",
          useQuotationEmail: false,
          authEmail: "auth@example.com",
          password: "Password123!",
          confirmPassword: "Password123!",
          // Falta nit
        };

        expect(() => completeProfileSchema.parse(invalidData)).toThrow();
      });
    });

    describe("Validaciones comunes", () => {
      it("debe rechazar email invalido", () => {
        const invalidData = {
          userType: UserType.NATURAL,
          email: "invalid-email",
          phone: "3001234567",
          address: "Calle 123",
          firstName: "Juan",
          lastName: "Garcia",
          documentType: DocumentType.CEDULA_CIUDADANIA,
          documentNumber: "1234567890",
          taxRegime: TaxRegime.SIMPLIFICADO,
          useQuotationEmail: true,
        };

        expect(() => completeProfileSchema.parse(invalidData)).toThrow();
      });

      it("debe rechazar telefono muy corto", () => {
        const invalidData = {
          userType: UserType.NATURAL,
          email: "test@example.com",
          phone: "123", // Muy corto
          address: "Calle 123",
          firstName: "Juan",
          lastName: "Garcia",
          documentType: DocumentType.CEDULA_CIUDADANIA,
          documentNumber: "1234567890",
          taxRegime: TaxRegime.SIMPLIFICADO,
          useQuotationEmail: true,
        };

        expect(() => completeProfileSchema.parse(invalidData)).toThrow();
      });

      it("debe rechazar direccion vacia", () => {
        const invalidData = {
          userType: UserType.NATURAL,
          email: "test@example.com",
          phone: "3001234567",
          address: "", // Vacio
          firstName: "Juan",
          lastName: "Garcia",
        };

        expect(() => completeProfileSchema.parse(invalidData)).toThrow();
      });
    });
  });
});
