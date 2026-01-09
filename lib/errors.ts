/**
 * Sistema de Códigos de Error Estandarizado
 *
 * Define códigos de error personalizados y clases de error para toda la aplicación.
 * Cada error incluye código HTTP + código personalizado para mejor rastreo.
 */

// Códigos de error personalizados
export enum ErrorCode {
  // Validación (400)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",

  // Autenticación (401)
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Autorización (403)
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  ROLE_NOT_ALLOWED = "ROLE_NOT_ALLOWED",

  // No encontrado (404)
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND",
  QUOTATION_NOT_FOUND = "QUOTATION_NOT_FOUND",
  ORDER_NOT_FOUND = "ORDER_NOT_FOUND",

  // Conflictos (409)
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  EMAIL_EXISTS = "EMAIL_EXISTS",
  SKU_EXISTS = "SKU_EXISTS",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  // Servidor (500)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  EMAIL_SERVICE_ERROR = "EMAIL_SERVICE_ERROR",
  PAYMENT_SERVICE_ERROR = "PAYMENT_SERVICE_ERROR",
}

/**
 * Clase base para errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errorCode: ErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
    // Mantener el stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Error de validación (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, details);
    this.name = "ValidationError";
  }
}

/**
 * Error de autenticación (401)
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string = "No autorizado",
    errorCode: ErrorCode = ErrorCode.UNAUTHORIZED,
    details?: any
  ) {
    super(message, 401, errorCode, details);
    this.name = "UnauthorizedError";
  }
}

/**
 * Error de autorización (403)
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = "Acceso denegado",
    errorCode: ErrorCode = ErrorCode.FORBIDDEN,
    details?: any
  ) {
    super(message, 403, errorCode, details);
    this.name = "ForbiddenError";
  }
}

/**
 * Error de recurso no encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string = "Recurso",
    errorCode: ErrorCode = ErrorCode.NOT_FOUND,
    details?: any
  ) {
    super(`${resource} no encontrado`, 404, errorCode, details);
    this.name = "NotFoundError";
  }
}

/**
 * Error de conflicto (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.DUPLICATE_ENTRY, details?: any) {
    super(message, 409, errorCode, details);
    this.name = "ConflictError";
  }
}

/**
 * Error de rate limiting (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Demasiadas solicitudes", details?: any) {
    super(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED, details);
    this.name = "RateLimitError";
  }
}

/**
 * Error interno del servidor (500)
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = "Error interno del servidor",
    errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
    details?: any
  ) {
    super(message, 500, errorCode, details);
    this.name = "InternalServerError";
  }
}

/**
 * Helper para crear errores con mensajes descriptivos
 */
export const createError = {
  validation: (message: string, details?: any) => new ValidationError(message, details),
  unauthorized: (message?: string, errorCode?: ErrorCode, details?: any) =>
    new UnauthorizedError(message, errorCode, details),
  forbidden: (message?: string, errorCode?: ErrorCode, details?: any) =>
    new ForbiddenError(message, errorCode, details),
  notFound: (resource?: string, errorCode?: ErrorCode, details?: any) =>
    new NotFoundError(resource, errorCode, details),
  conflict: (message: string, errorCode?: ErrorCode, details?: any) =>
    new ConflictError(message, errorCode, details),
  rateLimit: (message?: string, details?: any) => new RateLimitError(message, details),
  internal: (message?: string, errorCode?: ErrorCode, details?: any) =>
    new InternalServerError(message, errorCode, details),
};
