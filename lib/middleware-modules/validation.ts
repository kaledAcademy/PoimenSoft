import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { handleApiError } from "@/lib/error-handler";

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
}

export class ValidationMiddleware {
  private static instance: ValidationMiddleware;

  static getInstance(): ValidationMiddleware {
    if (!ValidationMiddleware.instance) {
      ValidationMiddleware.instance = new ValidationMiddleware();
    }
    return ValidationMiddleware.instance;
  }

  async validateBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<ValidationResult> {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationError[] = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return {
          success: false,
          errors,
        };
      }

      // Error de JSON inválido
      if (error instanceof SyntaxError) {
        return {
          success: false,
          errors: [
            {
              field: "body",
              message: "Formato JSON inválido",
              code: "invalid_json",
            },
          ],
        };
      }

      return {
        success: false,
        errors: [
          {
            field: "body",
            message: "Error al procesar el cuerpo de la petición",
            code: "parse_error",
          },
        ],
      };
    }
  }

  async validateQuery<T>(request: NextRequest, schema: ZodSchema<T>): Promise<ValidationResult> {
    try {
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams);

      const validatedData = schema.parse(queryParams);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationError[] = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return {
          success: false,
          errors,
        };
      }

      return {
        success: false,
        errors: [
          {
            field: "query",
            message: "Invalid query parameters",
            code: "invalid_query",
          },
        ],
      };
    }
  }

  async validateParams<T>(request: NextRequest, schema: ZodSchema<T>): Promise<ValidationResult> {
    try {
      const url = new URL(request.url);
      const pathSegments = url.pathname.split("/");

      // Extraer parámetros de la URL (ej: /api/users/[id] -> { id: "123" })
      const params: Record<string, string> = {};
      const pathParts = url.pathname.split("/");

      // Buscar patrones como [id], [userId], etc.
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (part.startsWith("[") && part.endsWith("]")) {
          const paramName = part.slice(1, -1);
          if (pathSegments[i]) {
            params[paramName] = pathSegments[i];
          }
        }
      }

      const validatedData = schema.parse(params);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationError[] = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        return {
          success: false,
          errors,
        };
      }

      return {
        success: false,
        errors: [
          {
            field: "params",
            message: "Invalid URL parameters",
            code: "invalid_params",
          },
        ],
      };
    }
  }

  createValidationErrorResponse(errors: ValidationError[]): NextResponse {
    // Usar el error handler centralizado para mantener consistencia
    const zodError = new ZodError(
      errors.map((err) => ({
        code: err.code as any,
        path: err.field.split("."),
        message: err.message,
      }))
    );
    return handleApiError(zodError);
  }

  createInvalidJSONResponse(): NextResponse {
    return handleApiError(new Error("Formato JSON inválido"));
  }
}

// Función helper para validar body
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: boolean; data?: T; response?: NextResponse }> {
  const validationMiddleware = ValidationMiddleware.getInstance();
  const result = await validationMiddleware.validateBody(request, schema);

  if (!result.success) {
    const response = validationMiddleware.createValidationErrorResponse(result.errors!);
    return {
      success: false,
      response,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// Función helper para validar query parameters
export async function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: boolean; data?: T; response?: NextResponse }> {
  const validationMiddleware = ValidationMiddleware.getInstance();
  const result = await validationMiddleware.validateQuery(request, schema);

  if (!result.success) {
    const response = validationMiddleware.createValidationErrorResponse(result.errors!);
    return {
      success: false,
      response,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// Función helper para validar parámetros de URL
export async function validateParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: boolean; data?: T; response?: NextResponse }> {
  const validationMiddleware = ValidationMiddleware.getInstance();
  const result = await validationMiddleware.validateParams(request, schema);

  if (!result.success) {
    const response = validationMiddleware.createValidationErrorResponse(result.errors!);
    return {
      success: false,
      response,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// Función helper para validación combinada
export async function validateRequest<TBody, TQuery, TParams>(options: {
  request: NextRequest;
  bodySchema?: ZodSchema<TBody>;
  querySchema?: ZodSchema<TQuery>;
  paramsSchema?: ZodSchema<TParams>;
}): Promise<{
  success: boolean;
  body?: TBody;
  query?: TQuery;
  params?: TParams;
  response?: NextResponse;
}> {
  const { request, bodySchema, querySchema, paramsSchema } = options;

  // Validar body
  if (bodySchema) {
    const bodyResult = await validateBody(request, bodySchema);
    if (!bodyResult.success) {
      return { success: false, response: bodyResult.response };
    }
  }

  // Validar query
  if (querySchema) {
    const queryResult = await validateQuery(request, querySchema);
    if (!queryResult.success) {
      return { success: false, response: queryResult.response };
    }
  }

  // Validar params
  if (paramsSchema) {
    const paramsResult = await validateParams(request, paramsSchema);
    if (!paramsResult.success) {
      return { success: false, response: paramsResult.response };
    }
  }

  return { success: true };
}
