/**
 * Error Handler Centralizado para APIs
 *
 * Maneja todos los tipos de errores y retorna respuestas estandarizadas
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import {
  AppError,
  ErrorCode,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  createError,
} from "./errors";
import { logger } from "./logger";

/**
 * Interfaz para respuestas de error estandarizadas
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  errorCode: ErrorCode;
  statusCode: number;
  details?: any;
}

/**
 * Maneja errores de Prisma y retorna mensajes descriptivos
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const target = (error.meta?.target as string[]) || [];
      const field = target[0] || "campo";

      // Mensajes específicos según el campo
      if (field === "email") {
        return createError.conflict("El email ya está registrado", ErrorCode.EMAIL_EXISTS, {
          field,
          target,
        });
      }
      if (field === "sku") {
        return createError.conflict(
          "Error al guardar el producto: SKU duplicado",
          ErrorCode.SKU_EXISTS,
          { field, target }
        );
      }
      if (field === "consecutiveNumber") {
        return createError.conflict("El número consecutivo ya existe", ErrorCode.DUPLICATE_ENTRY, {
          field,
          target,
        });
      }

      return createError.conflict(`El ${field} ya existe`, ErrorCode.DUPLICATE_ENTRY, {
        field,
        target,
      });

    case "P2025":
      // Record not found
      return createError.notFound("Recurso");

    case "P2003":
      // Foreign key constraint violation
      return createError.validation("Referencia inválida: el recurso relacionado no existe", {
        code: error.code,
      });

    case "P2014":
      // Required relation violation
      return createError.validation("Faltan datos requeridos para la relación", {
        code: error.code,
      });

    default:
      return createError.internal("Error en la base de datos", ErrorCode.DATABASE_ERROR, {
        code: error.code,
        meta: error.meta,
      });
  }
}

/**
 * Maneja errores de Zod y retorna mensajes descriptivos
 */
function handleZodError(error: ZodError): ValidationError {
  const issues = error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));

  // Construir mensaje descriptivo
  const firstError = issues[0];
  let message = "Datos de entrada inválidos";

  if (issues.length === 1) {
    message = `${firstError.field}: ${firstError.message}`;
  } else if (issues.length > 1) {
    message = `Múltiples errores de validación: ${issues.map((i) => `${i.field}: ${i.message}`).join(", ")}`;
  }

  return createError.validation(message, issues);
}

/**
 * Determina si un error es crítico (requiere modal)
 */
export function isCriticalError(statusCode: number, errorCode: ErrorCode): boolean {
  // Errores críticos: 500, errores de sistema, algunos 409
  if (statusCode >= 500) return true;
  if (errorCode === ErrorCode.EXTERNAL_SERVICE_ERROR) return true;
  if (errorCode === ErrorCode.DATABASE_ERROR) return true;
  if (errorCode === ErrorCode.EMAIL_SERVICE_ERROR) return true;
  if (errorCode === ErrorCode.PAYMENT_SERVICE_ERROR) return true;

  return false;
}

/**
 * Handler centralizado de errores para APIs
 *
 * @param error - Error capturado (puede ser cualquier tipo)
 * @returns NextResponse con formato estandarizado
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  let appError: AppError;

  // Manejar diferentes tipos de errores
  if (error instanceof AppError) {
    // Error personalizado de la aplicación
    appError = error;
  } else if (error instanceof ZodError) {
    // Error de validación Zod
    appError = handleZodError(error);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Error de Prisma conocido
    appError = handlePrismaError(error);
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    // Error de Prisma desconocido
    appError = createError.internal("Error en la base de datos", ErrorCode.DATABASE_ERROR, {
      message: error.message,
    });
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Error de validación de Prisma
    appError = createError.validation("Error de validación en la base de datos", {
      message: error.message,
    });
  } else if (error instanceof Error) {
    // Error genérico de JavaScript
    // Intentar extraer información útil del mensaje
    const message = error.message || "Error interno del servidor";

    // Detectar tipos comunes por mensaje
    if (message.includes("Unauthorized") || message.includes("autenticación")) {
      appError = createError.unauthorized(message);
    } else if (message.includes("Forbidden") || message.includes("prohibido")) {
      appError = createError.forbidden(message);
    } else if (message.includes("Not found") || message.includes("no encontrado")) {
      appError = createError.notFound(message);
    } else if (message.includes("Duplicate") || message.includes("duplicado")) {
      appError = createError.conflict(message);
    } else {
      appError = createError.internal(message);
    }
  } else {
    // Error desconocido
    appError = createError.internal("Error interno del servidor", ErrorCode.INTERNAL_ERROR, {
      originalError: String(error),
    });
  }

  // Log del error estructurado
  logger.error(
    {
      message: appError.message,
      statusCode: appError.statusCode,
      errorCode: appError.errorCode,
      details: appError.details,
      stack: appError.stack,
    },
    "API error handled"
  );

  // Retornar respuesta estandarizada
  const response: ApiErrorResponse = {
    success: false,
    error: appError.message,
    errorCode: appError.errorCode,
    statusCode: appError.statusCode,
  };

  // Incluir details solo si existen y no es producción (o si es error de validación)
  if (appError.details && (process.env.NODE_ENV === "development" || appError.statusCode === 400)) {
    response.details = appError.details;
  }

  return NextResponse.json(response, { status: appError.statusCode });
}

/**
 * Wrapper para endpoints que maneja errores automáticamente
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch(handleApiError);
}
