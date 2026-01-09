/**
 * Schemas de validación para Órdenes de Trabajo
 *
 * Validaciones centralizadas para operaciones CRUD de órdenes de trabajo.
 */

import { z } from "zod";

/**
 * Estados de orden de trabajo
 */
export const ORDEN_ESTADOS = [
  "PENDIENTE",
  "EN_PROGRESO",
  "EN_REVISION",
  "COMPLETADA",
  "CANCELADA",
  "PAUSADA",
] as const;
export type OrdenEstado = (typeof ORDEN_ESTADOS)[number];

/**
 * Prioridades de orden de trabajo
 */
export const ORDEN_PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "URGENTE"] as const;
export type OrdenPrioridad = (typeof ORDEN_PRIORIDADES)[number];

/**
 * Tipos de orden de trabajo
 */
export const ORDEN_TIPOS = [
  "DESARROLLO",
  "MANTENIMIENTO",
  "SOPORTE",
  "CONSULTORIA",
  "IMPLEMENTACION",
  "CAPACITACION",
] as const;
export type OrdenTipo = (typeof ORDEN_TIPOS)[number];

/**
 * Schema para el título de la orden
 */
export const ordenTituloSchema = z
  .string()
  .min(5, "El título debe tener al menos 5 caracteres")
  .max(200, "El título no puede exceder 200 caracteres");

/**
 * Schema para la descripción de la orden
 */
export const ordenDescripcionSchema = z
  .string()
  .min(10, "La descripción debe tener al menos 10 caracteres")
  .max(2000, "La descripción no puede exceder 2000 caracteres");

/**
 * Schema para crear una orden de trabajo
 */
export const createOrdenSchema = z.object({
  numero: z
    .string()
    .min(1, "El número de orden es requerido")
    .max(50, "El número no puede exceder 50 caracteres")
    .optional(),
  titulo: ordenTituloSchema,
  descripcion: ordenDescripcionSchema,
  tipo: z.enum(ORDEN_TIPOS).default("DESARROLLO"),
  prioridad: z.enum(ORDEN_PRIORIDADES).default("MEDIA"),
  clienteId: z.string().cuid("ID de cliente inválido").optional(),
  proyectoId: z.string().cuid("ID de proyecto inválido").optional(),
  responsableId: z.string().cuid("ID de responsable inválido").optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaEntregaEstimada: z.coerce.date().optional(),
  presupuesto: z.coerce.number().nonnegative("El presupuesto debe ser positivo").optional(),
  horasEstimadas: z.coerce
    .number()
    .nonnegative("Las horas estimadas deben ser positivas")
    .optional(),
});

export type CreateOrdenInput = z.infer<typeof createOrdenSchema>;

/**
 * Schema para actualizar una orden de trabajo
 */
export const updateOrdenSchema = z.object({
  titulo: ordenTituloSchema.optional(),
  descripcion: ordenDescripcionSchema.optional(),
  tipo: z.enum(ORDEN_TIPOS).optional(),
  estado: z.enum(ORDEN_ESTADOS).optional(),
  prioridad: z.enum(ORDEN_PRIORIDADES).optional(),
  responsableId: z.string().cuid("ID de responsable inválido").optional().nullable(),
  fechaInicio: z.coerce.date().optional().nullable(),
  fechaEntregaEstimada: z.coerce.date().optional().nullable(),
  fechaEntregaReal: z.coerce.date().optional().nullable(),
  presupuesto: z.coerce.number().nonnegative("El presupuesto debe ser positivo").optional(),
  horasEstimadas: z.coerce
    .number()
    .nonnegative("Las horas estimadas deben ser positivas")
    .optional(),
  horasReales: z.coerce.number().nonnegative("Las horas reales deben ser positivas").optional(),
  notas: z.string().max(1000, "Las notas no pueden exceder 1000 caracteres").optional(),
});

export type UpdateOrdenInput = z.infer<typeof updateOrdenSchema>;

/**
 * Schema para filtrar órdenes de trabajo
 */
export const ordenFiltersSchema = z.object({
  estado: z.enum(ORDEN_ESTADOS).optional(),
  prioridad: z.enum(ORDEN_PRIORIDADES).optional(),
  tipo: z.enum(ORDEN_TIPOS).optional(),
  responsableId: z.string().cuid().optional(),
  clienteId: z.string().cuid().optional(),
  proyectoId: z.string().cuid().optional(),
  search: z.string().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  orderBy: z
    .enum(["createdAt", "fechaEntregaEstimada", "prioridad", "numero"])
    .default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
});

export type OrdenFiltersInput = z.infer<typeof ordenFiltersSchema>;

/**
 * Schema para crear una actividad de orden
 */
export const createActividadSchema = z.object({
  ordenId: z.string().cuid("ID de orden inválido"),
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(200),
  descripcion: z.string().max(1000).optional(),
  responsableId: z.string().cuid("ID de responsable inválido").optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
  horasEstimadas: z.coerce.number().nonnegative().optional(),
  prioridad: z.enum(ORDEN_PRIORIDADES).default("MEDIA"),
});

export type CreateActividadInput = z.infer<typeof createActividadSchema>;

/**
 * Schema para actualizar una actividad
 */
export const updateActividadSchema = z.object({
  titulo: z.string().min(3).max(200).optional(),
  descripcion: z.string().max(1000).optional(),
  estado: z.enum(["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "BLOQUEADA"]).optional(),
  responsableId: z.string().cuid().optional().nullable(),
  fechaInicio: z.coerce.date().optional().nullable(),
  fechaFin: z.coerce.date().optional().nullable(),
  horasEstimadas: z.coerce.number().nonnegative().optional(),
  horasReales: z.coerce.number().nonnegative().optional(),
  prioridad: z.enum(ORDEN_PRIORIDADES).optional(),
  notas: z.string().max(500).optional(),
});

export type UpdateActividadInput = z.infer<typeof updateActividadSchema>;

/**
 * Schema para cambiar el estado de una orden
 */
export const cambiarEstadoOrdenSchema = z.object({
  estado: z.enum(ORDEN_ESTADOS),
  motivo: z.string().max(500, "El motivo no puede exceder 500 caracteres").optional(),
  fechaEntregaReal: z.coerce.date().optional(),
});

export type CambiarEstadoOrdenInput = z.infer<typeof cambiarEstadoOrdenSchema>;

/**
 * Schema para asignar responsable
 */
export const asignarResponsableSchema = z.object({
  responsableId: z.string().cuid("ID de responsable inválido"),
  notificar: z.boolean().default(true),
  mensaje: z.string().max(500).optional(),
});

export type AsignarResponsableInput = z.infer<typeof asignarResponsableSchema>;

/**
 * Schema para registrar tiempo trabajado
 */
export const registrarTiempoSchema = z.object({
  ordenId: z.string().cuid("ID de orden inválido"),
  actividadId: z.string().cuid("ID de actividad inválido").optional(),
  horas: z.coerce.number().positive("Las horas deben ser positivas").max(24, "Máximo 24 horas"),
  descripcion: z.string().max(500).optional(),
  fecha: z.coerce.date().default(() => new Date()),
});

export type RegistrarTiempoInput = z.infer<typeof registrarTiempoSchema>;

/**
 * Schema para crear un acta de cierre
 */
export const createActaCierreSchema = z.object({
  ordenId: z.string().cuid("ID de orden inválido"),
  resumen: z.string().min(10, "El resumen debe tener al menos 10 caracteres").max(2000),
  entregables: z.array(z.string()).optional(),
  observaciones: z.string().max(1000).optional(),
  firmaCliente: z.boolean().default(false),
  firmaResponsable: z.boolean().default(false),
});

export type CreateActaCierreInput = z.infer<typeof createActaCierreSchema>;
