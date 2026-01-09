import { z } from "zod";
import { validateNitWithDv } from "@/lib/nit-validator";

/**
 * Schemas de validación comunes reutilizables
 * Estos schemas pueden ser importados y usados en cualquier formulario
 */

// Email con validación de formato
export const emailSchema = z
  .string()
  .min(1, "El email es obligatorio")
  .email("El formato del email no es válido")
  .max(255, "El email no puede exceder 255 caracteres");

// Contraseña con reglas de seguridad
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
  )
  .max(100, "La contraseña no puede exceder 100 caracteres");

// Teléfono colombiano (10 dígitos)
export const phoneSchema = z
  .string()
  .min(1, "El teléfono es obligatorio")
  .regex(/^[0-9]{10}$/, "El teléfono debe tener exactamente 10 dígitos numéricos")
  .refine(
    (val) => {
      // Validar que no sea solo ceros
      return val !== "0000000000";
    },
    { message: "El teléfono no puede ser solo ceros" }
  );

// Nombres (texto con longitud mínima y máxima)
export const firstNameSchema = z
  .string()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(50, "El nombre no puede exceder 50 caracteres")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras y espacios");

export const lastNameSchema = z
  .string()
  .min(2, "El apellido debe tener al menos 2 caracteres")
  .max(50, "El apellido no puede exceder 50 caracteres")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El apellido solo puede contener letras y espacios");

export const fullNameSchema = z
  .string()
  .min(2, "El nombre completo debe tener al menos 2 caracteres")
  .max(100, "El nombre completo no puede exceder 100 caracteres")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre completo solo puede contener letras y espacios");

// Razón social (para persona jurídica)
export const companyNameSchema = z
  .string()
  .min(3, "La razón social debe tener al menos 3 caracteres")
  .max(200, "La razón social no puede exceder 200 caracteres")
  .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,-]+$/, "La razón social contiene caracteres no permitidos");

// NIT con validación de dígito verificador
export const nitSchema = z
  .string()
  .min(1, "El NIT es obligatorio")
  .regex(
    /^\d{9}-\d$/,
    "El NIT debe tener el formato: 123456789-0 (9 dígitos, guión, 1 dígito verificador)"
  )
  .refine(
    (val) => {
      return validateNitWithDv(val);
    },
    { message: "El dígito verificador del NIT no es válido" }
  );

// NIT sin dígito verificador (para cuando se calcula automáticamente)
export const nitWithoutDvSchema = z
  .string()
  .min(1, "El NIT es obligatorio")
  .regex(/^\d{9}$/, "El NIT debe tener exactamente 9 dígitos numéricos");

// Número de documento (cédula, pasaporte, etc.)
export const documentNumberSchema = z
  .string()
  .min(5, "El número de documento debe tener al menos 5 caracteres")
  .max(20, "El número de documento no puede exceder 20 caracteres")
  .regex(/^[a-zA-Z0-9]+$/, "El número de documento solo puede contener letras y números");

// Dirección
export const addressSchema = z
  .string()
  .min(5, "La dirección debe tener al menos 5 caracteres")
  .max(200, "La dirección no puede exceder 200 caracteres");

// Ciudad
export const citySchema = z
  .string()
  .min(2, "La ciudad debe tener al menos 2 caracteres")
  .max(100, "La ciudad no puede exceder 100 caracteres")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "La ciudad solo puede contener letras y espacios");

// Departamento
export const departmentSchema = z
  .string()
  .min(2, "El departamento debe tener al menos 2 caracteres")
  .max(100, "El departamento no puede exceder 100 caracteres")
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El departamento solo puede contener letras y espacios");

// RUT Number (Registro Único Tributario)
export const rutNumberSchema = z
  .string()
  .min(1, "El número de RUT es obligatorio")
  .max(50, "El número de RUT no puede exceder 50 caracteres")
  .regex(/^[a-zA-Z0-9-]+$/, "El número de RUT contiene caracteres no permitidos");

// Enums de Prisma como schemas Zod
export const documentTypeSchema = z.enum(
  ["CEDULA_CIUDADANIA", "CEDULA_EXTRANJERIA", "PASAPORTE", "NIT"],
  {
    message: "Debe seleccionar un tipo de documento válido",
  }
);

export const taxRegimeSchema = z.enum(["SIMPLIFICADO", "COMUN", "SIMPLE_TRIBUTARIO"], {
  message: "Debe seleccionar un régimen tributario válido",
});

export const companyTaxRegimeSchema = z.enum(
  ["RESPONSABLE_IVA", "NO_RESPONSABLE_IVA", "GRAN_CONTRIBUYENTE"],
  {
    message: "Debe seleccionar un régimen tributario válido",
  }
);

export const userTypeSchema = z.enum(["NATURAL", "JURIDICA"], {
  message: "Debe seleccionar un tipo de usuario válido",
});

// Checkbox requerido (para aceptación de políticas)
export const requiredCheckboxSchema = z.boolean().refine((val) => val === true, {
  message: "Debe aceptar este campo para continuar",
});

// Checkbox opcional
export const optionalCheckboxSchema = z.boolean().optional().default(false);
