import { z } from "zod";
// Tipos no disponibles en schema actual - comentados temporalmente
// import { UserType, DocumentType, TaxRegime, CompanyTaxRegime } from "@prisma/client";
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
  rutNumberSchema,
  documentTypeSchema,
  taxRegimeSchema,
  companyTaxRegimeSchema,
  userTypeSchema,
} from "./common-schemas";

/**
 * Schema de validación para completar perfil de usuario
 * Validación condicional según tipo de usuario (NATURAL o JURIDICA)
 */
export const completeProfileSchema = z
  .object({
    userType: userTypeSchema,
    // Campos de autenticación (nuevos)
    authEmail: emailSchema.optional(),
    useQuotationEmail: z.boolean().optional(),
    quotationId: z.string().optional(), // Opcional si no viene de cotización
    password: passwordSchema.optional(),
    confirmPassword: z.string().optional(),
    // Campos comunes
    email: emailSchema,
    phone: z
      .string()
      .min(7, "El teléfono debe tener al menos 7 dígitos")
      .max(15, "El teléfono no puede exceder 15 dígitos"),
    address: addressSchema,
    // Ubicación - IDs de relaciones
    countryId: z.string().cuid().optional(),
    stateId: z.string().cuid().optional(),
    cityId: z.string().cuid().optional(),
    // Campos legacy para compatibilidad temporal
    city: z.string().optional(), // Ahora completamente opcional
    department: z.string().optional(), // Ahora completamente opcional
    country: z.string().default("Colombia").optional(),
    // Persona Natural - todos opcionales, se validan con refine solo si userType === NATURAL
    firstName: z.string().optional().or(z.literal("")),
    lastName: z.string().optional().or(z.literal("")),
    fullName: z.string().optional().or(z.literal("")),
    documentType: documentTypeSchema.optional(),
    documentNumber: z.string().optional().or(z.literal("")),
    taxRegime: taxRegimeSchema.optional(),
    rutNumber: z.string().optional().or(z.literal("")),
    // Persona Jurídica - todos opcionales, se validan con refine solo si userType === JURIDICA
    companyName: z.string().optional().or(z.literal("")),
    tradeName: z.string().optional().or(z.literal("")),
    nit: z.string().optional().or(z.literal("")),
    companyTaxRegime: companyTaxRegimeSchema.optional(),
    legalRepresentativeName: z.string().optional().or(z.literal("")),
    legalRepresentativeDocument: z.string().optional().or(z.literal("")),
    legalRepresentativePhone: z.string().optional().or(z.literal("")),
    legalRepresentativeEmail: z.string().optional().or(z.literal("")),
    legalRepresentativeSuplenteName: z.string().optional().or(z.literal("")),
    legalRepresentativeSuplenteDocument: z.string().optional().or(z.literal("")),
    // Datos adicionales (opcionales) - Relaciones con CIIU y Obligaciones
    businessDevelopmentAreaId: z.string().cuid("ID de área de desarrollo inválido").optional(),
    ciiuCode1Id: z.string().cuid("ID de código CIIU 1 inválido").optional(),
    ciiuCode2Id: z.string().cuid("ID de código CIIU 2 inválido").optional(),
    obligationIds: z.array(z.string().cuid("ID de obligación inválido")).optional(),
    photoLogo: z.string().url("La URL del logo no es válida").optional().or(z.literal("")),
  })
  // ===== VALIDACIONES PARA PERSONA NATURAL =====
  // Nombre requerido para persona natural
  .refine(
    (data) => {
      if (data.userType === 'NATURAL') {
        const hasName =
          (data.firstName && data.firstName.length >= 2) ||
          (data.fullName && data.fullName.length >= 2);
        return hasName;
      }
      return true;
    },
    {
      message: "El nombre es obligatorio (mínimo 2 caracteres)",
      path: ["firstName"],
    }
  )
  // Apellido requerido para persona natural
  .refine(
    (data) => {
      if (data.userType === 'NATURAL') {
        const hasLastName =
          (data.lastName && data.lastName.length >= 2) ||
          (data.fullName && data.fullName.length >= 2);
        return hasLastName;
      }
      return true;
    },
    {
      message: "El apellido es obligatorio (mínimo 2 caracteres)",
      path: ["lastName"],
    }
  )
  // Tipo de documento requerido para persona natural
  .refine(
    (data) => {
      if (data.userType === 'NATURAL') {
        return !!data.documentType;
      }
      return true;
    },
    {
      message: "Selecciona un tipo de documento",
      path: ["documentType"],
    }
  )
  // Número de documento requerido para persona natural
  .refine(
    (data) => {
      if (data.userType === 'NATURAL') {
        return data.documentNumber && data.documentNumber.length >= 5;
      }
      return true;
    },
    {
      message: "El número de documento es obligatorio (mínimo 5 caracteres)",
      path: ["documentNumber"],
    }
  )
  // Régimen tributario requerido para persona natural
  .refine(
    (data) => {
      if (data.userType === 'NATURAL') {
        return !!data.taxRegime;
      }
      return true;
    },
    {
      message: "Selecciona un régimen tributario",
      path: ["taxRegime"],
    }
  )
  // ===== VALIDACIONES PARA PERSONA JURÍDICA =====
  // Razón social requerida para persona jurídica
  .refine(
    (data) => {
      if (data.userType === 'JURIDICA') {
        return data.companyName && data.companyName.length >= 3;
      }
      return true;
    },
    {
      message: "La razón social es obligatoria (mínimo 3 caracteres)",
      path: ["companyName"],
    }
  )
  // NIT requerido para persona jurídica
  .refine(
    (data) => {
      if (data.userType === 'JURIDICA') {
        return data.nit && data.nit.length >= 9;
      }
      return true;
    },
    {
      message: "El NIT es obligatorio (9 dígitos)",
      path: ["nit"],
    }
  )
  // Régimen tributario requerido para persona jurídica
  .refine(
    (data) => {
      if (data.userType === 'JURIDICA') {
        return !!data.companyTaxRegime;
      }
      return true;
    },
    {
      message: "Selecciona un régimen tributario",
      path: ["companyTaxRegime"],
    }
  )
  // Representante legal requerido para persona jurídica
  .refine(
    (data) => {
      if (data.userType === 'JURIDICA') {
        return data.legalRepresentativeName && data.legalRepresentativeName.length >= 2;
      }
      return true;
    },
    {
      message: "El nombre del representante legal es obligatorio",
      path: ["legalRepresentativeName"],
    }
  )
  // Documento del representante legal requerido para persona jurídica
  .refine(
    (data) => {
      if (data.userType === 'JURIDICA') {
        return data.legalRepresentativeDocument && data.legalRepresentativeDocument.length >= 5;
      }
      return true;
    },
    {
      message: "El documento del representante legal es obligatorio",
      path: ["legalRepresentativeDocument"],
    }
  )
  // Validación: Persona Natural siempre usa email de cotización
  .refine(
    (data) => {
      if (data.userType === 'NATURAL') {
        return data.useQuotationEmail === true || data.useQuotationEmail === undefined;
      }
      return true;
    },
    {
      message: "Persona Natural debe usar el email de la cotización",
      path: ["useQuotationEmail"],
    }
  )
  // Validación: Persona Jurídica debe elegir opción de email
  .refine(
    (data) => {
      if (data.userType === 'JURIDICA') {
        return data.useQuotationEmail !== undefined;
      }
      return true;
    },
    {
      message: "Debes elegir si usar el email de la cotización o crear uno nuevo",
      path: ["useQuotationEmail"],
    }
  )
  // Validación: Si Persona Jurídica crea email nuevo, authEmail es requerido y diferente
  .refine(
    (data) => {
      if (data.userType === 'JURIDICA' && data.useQuotationEmail === false) {
        return !!data.authEmail;
      }
      return true;
    },
    {
      message: "Debes proporcionar un email para autenticación",
      path: ["authEmail"],
    }
  )
  // Validación: Si crea email nuevo, password es requerido (asumimos que es nuevo usuario)
  .refine(
    (data) => {
      if (
        data.userType === 'JURIDICA' &&
        data.useQuotationEmail === false &&
        data.authEmail
      ) {
        return !!data.password;
      }
      return true;
    },
    {
      message: "Debes establecer una contraseña para el nuevo email",
      path: ["password"],
    }
  )
  // Validación: confirmPassword debe coincidir con password
  .refine(
    (data) => {
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    }
  );

export type CompleteProfileData = z.infer<typeof completeProfileSchema>;
