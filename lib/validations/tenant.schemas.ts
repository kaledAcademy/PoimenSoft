/**
 * Schemas de validación para Tenants
 *
 * Validaciones centralizadas para operaciones CRUD de tenants.
 */

import { z } from "zod";
import { emailSchema, phoneSchema, addressSchema, citySchema } from "./common-schemas";

/**
 * Tipos de planes de tenant
 */
export const TENANT_PLANS = ["BASIC", "PRO", "ENTERPRISE"] as const;
export type TenantPlan = (typeof TENANT_PLANS)[number];

/**
 * Estados de tenant
 */
export const TENANT_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED", "CANCELLED"] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

/**
 * Schema para el nombre del tenant
 */
export const tenantNameSchema = z
  .string()
  .min(3, "El nombre debe tener al menos 3 caracteres")
  .max(100, "El nombre no puede exceder 100 caracteres")
  .regex(
    /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_.]+$/,
    "El nombre solo puede contener letras, números, espacios, guiones, puntos y guiones bajos"
  );

/**
 * Schema para el slug del tenant
 */
export const tenantSlugSchema = z
  .string()
  .min(3, "El slug debe tener al menos 3 caracteres")
  .max(50, "El slug no puede exceder 50 caracteres")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "El slug solo puede contener letras minúsculas, números y guiones"
  );

/**
 * Schema para el NIT del tenant
 */
export const tenantNitSchema = z
  .string()
  .min(9, "El NIT debe tener al menos 9 caracteres")
  .max(12, "El NIT no puede exceder 12 caracteres")
  .regex(/^[0-9-]+$/, "El NIT solo puede contener números y guiones")
  .optional();

/**
 * Schema para crear un tenant
 */
export const createTenantSchema = z.object({
  userId: z.string().cuid("ID de usuario inválido"),
  quotationId: z.string().cuid("ID de cotización inválido").optional(),
  orderId: z.string().cuid("ID de orden inválido").optional(),
  name: tenantNameSchema,
  email: emailSchema,
  nit: tenantNitSchema,
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema.optional(),
  plan: z.enum(TENANT_PLANS).default("BASIC"),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

/**
 * Schema para actualizar un tenant
 */
export const updateTenantSchema = z.object({
  name: tenantNameSchema.optional(),
  email: emailSchema.optional(),
  nit: tenantNitSchema,
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  city: citySchema.optional(),
  plan: z.enum(TENANT_PLANS).optional(),
  status: z.enum(TENANT_STATUSES).optional(),
  maxUsers: z.number().int().positive("Máximo de usuarios debe ser positivo").optional(),
  maxOrdenes: z.number().int().positive("Máximo de órdenes debe ser positivo").optional(),
});

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;

/**
 * Schema para filtrar tenants
 */
export const tenantFiltersSchema = z.object({
  status: z.enum(TENANT_STATUSES).optional(),
  plan: z.enum(TENANT_PLANS).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type TenantFiltersInput = z.infer<typeof tenantFiltersSchema>;

/**
 * Schema para datos de aprovisionamiento
 */
export const tenantProvisioningSchema = z.object({
  branchId: z.string().min(1, "Branch ID es requerido"),
  connectionUrl: z.string().url("URL de conexión inválida"),
});

export type TenantProvisioningInput = z.infer<typeof tenantProvisioningSchema>;

/**
 * Schema para suspender/reactivar tenant
 */
export const tenantStatusChangeSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  reason: z.string().max(500, "La razón no puede exceder 500 caracteres").optional(),
});

export type TenantStatusChangeInput = z.infer<typeof tenantStatusChangeSchema>;

/**
 * Schema para impersonación de tenant
 */
export const impersonateTenantSchema = z.object({
  tenantId: z.string().cuid("ID de tenant inválido"),
  duration: z.coerce
    .number()
    .int()
    .positive()
    .max(24 * 60, "Duración máxima es 24 horas")
    .default(60), // 60 minutos por defecto
});

export type ImpersonateTenantInput = z.infer<typeof impersonateTenantSchema>;
