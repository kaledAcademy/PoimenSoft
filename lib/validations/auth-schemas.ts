import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  firstNameSchema,
  lastNameSchema,
  requiredCheckboxSchema,
  optionalCheckboxSchema,
} from "./common-schemas";

/**
 * Schema de validación para registro rápido
 * Usado en QuickRegistrationModal
 */
export const quickRegistrationSchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Debe confirmar la contraseña"),
    acceptDataPolicy: requiredCheckboxSchema,
    acceptTerms: requiredCheckboxSchema,
    acceptMarketing: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // Mostrar error en el campo confirmPassword
  });

export type QuickRegistrationData = z.infer<typeof quickRegistrationSchema>;

/**
 * Schema de validación para login
 * Usado en LoginPage y AuthModal
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginData = z.infer<typeof loginSchema>;
