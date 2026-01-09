/**
 * Servicio HTTP con manejo automático de tokens JWT
 */

import { logger } from "./logger";

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

class HttpService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // El token se envía automáticamente desde cookies HttpOnly
    // No necesitamos leerlo desde localStorage ni agregarlo manualmente
    // El servidor lo leerá automáticamente de las cookies

    return headers;
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    const url = `${this.baseURL}${endpoint}`;
    const method = fetchOptions.method || "GET";

    // Solo loguear en desarrollo
    if (process.env.NODE_ENV === "development") {
      logger.debug(
        {
          method,
          url,
          requireAuth,
        },
        "HTTP request started"
      );
    }

    const headers = {
      ...this.getAuthHeaders(),
      ...fetchOptions.headers,
    };

    // Para requireAuth, el token se envía automáticamente desde cookies HttpOnly
    // No necesitamos verificar localStorage

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: "include", // Incluir cookies automáticamente (incluyendo HttpOnly)
      });

      // Si la respuesta es 401, manejar ANTES de parsear JSON
      // Esto evita ciclos infinitos en páginas públicas como la landing
      if (response.status === 401) {
        // Limpiar cualquier dato local residual
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }

        // Intentar parsear JSON si existe, sino usar valores por defecto
        let errorMessage = "Usuario no autenticado";
        let errorDetails: any = {};

        try {
          // Clonar la respuesta para poder leer el texto sin consumir el body
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          if (text && text.trim()) {
            try {
              const parsedData = JSON.parse(text);
              // El middleware puede retornar error o message
              if (parsedData && typeof parsedData === "object") {
                errorMessage = parsedData.error || parsedData.message || errorMessage;
                // Solo incluir details si existen y no están vacíos
                if (parsedData.details && Object.keys(parsedData.details).length > 0) {
                  errorDetails = parsedData.details;
                } else if (parsedData.code) {
                  errorDetails = { code: parsedData.code };
                }
              }
            } catch (jsonError) {
              // Si el JSON no es válido, usar el texto como mensaje
              if (process.env.NODE_ENV === "development") {
                logger.warn({ error: jsonError, url }, "Invalid JSON in 401 response");
              }
              errorMessage = text.substring(0, 100) || errorMessage;
            }
          }
        } catch (cloneError) {
          // Si no se puede clonar o leer, usar valores por defecto
          // No loguear en producción para evitar ruido
        }

        // Asegurar que siempre tenemos un error válido con estructura correcta
        // Validar que errorMessage no esté vacío
        if (!errorMessage || errorMessage.trim() === "") {
          errorMessage = "Usuario no autenticado";
        }

        const unauthError = {
          success: false,
          error: errorMessage,
          errorCode: "UNAUTHORIZED" as any,
          statusCode: 401,
          details: errorDetails || {},
        };

        // Lanzar error formateado sin redirección automática
        throw unauthError;
      }

      const data = await response.json();

      if (!response.ok) {
        if (process.env.NODE_ENV === "development") {
          logger.warn(
            {
              status: response.status,
              url,
              error: data.error,
            },
            "HTTP request failed"
          );
        }

        // Si la respuesta tiene formato estandarizado de error, preservarlo
        if (data.success === false && data.errorCode) {
          const apiError: any = {
            success: false,
            error: data.error || `Error ${response.status}`,
            errorCode: data.errorCode,
            statusCode: data.statusCode || response.status,
            details: data.details,
          };
          // Incluir información adicional si está disponible (hasPassword, options, etc.)
          if (data.hasPassword !== undefined) {
            apiError.hasPassword = data.hasPassword;
          }
          if (data.options) {
            apiError.options = data.options;
          }
          if (data.existingUser !== undefined) {
            apiError.existingUser = data.existingUser;
          }
          throw apiError;
        }

        // Si no, crear error con formato estandarizado
        throw {
          success: false,
          error: data.error || `Error ${response.status}`,
          errorCode: (data.errorCode as any) || "INTERNAL_ERROR",
          statusCode: response.status,
          details: data.details,
        };
      }

      if (process.env.NODE_ENV === "development") {
        logger.debug({ method, url, status: response.status }, "HTTP request successful");
      }
      return data;
    } catch (error) {
      // Logging detallado para diagnóstico - SOLO en desarrollo
      if (process.env.NODE_ENV === "development") {
        logger.debug(
          {
            error: error instanceof Error ? error.message : String(error),
            errorType: typeof error,
            url,
          },
          "HTTP request error details"
        );
      }

      // PRIMERO: Verificar si es un objeto vacío (esto puede ocurrir antes de otras verificaciones)
      if (
        error &&
        typeof error === "object" &&
        Object.keys(error).length === 0 &&
        !(error instanceof Error)
      ) {
        if (process.env.NODE_ENV === "development") {
          logger.warn({ url }, "Empty error object detected");
        }
        throw {
          success: false,
          error: "Error desconocido en la petición",
          errorCode: "INTERNAL_ERROR" as any,
          statusCode: 500,
          details: {
            originalError: "Empty object",
            errorType: typeof error,
            errorConstructor: error?.constructor?.name,
          },
        };
      }

      // Si ya es un error formateado (con errorCode), re-lanzarlo directamente
      if (error && typeof error === "object" && "errorCode" in error) {
        // Verificar que el error tiene la estructura correcta
        const formattedError = error as any;
        if (!formattedError.error || formattedError.error === "") {
          formattedError.error = "Error desconocido";
        }
        if (!formattedError.statusCode) {
          formattedError.statusCode = 500;
        }
        if (!formattedError.errorCode) {
          formattedError.errorCode = "INTERNAL_ERROR";
        }

        // No loguear errores 401 como errores - son esperados en páginas públicas
        if (formattedError.statusCode !== 401 && process.env.NODE_ENV === "development") {
          logger.error(
            {
              statusCode: formattedError.statusCode,
              errorCode: formattedError.errorCode,
              url,
            },
            "HTTP request error"
          );
        }
        throw formattedError;
      }

      // Si el error es un objeto vacío o sin propiedades, formatearlo
      // También verificar si tiene propiedades pero están ocultas (no enumerables)
      const errorKeys = error && typeof error === "object" ? Object.keys(error) : [];
      const hasErrorCode = error && typeof error === "object" && "errorCode" in error;

      if (error && typeof error === "object" && !hasErrorCode && errorKeys.length === 0) {
        if (process.env.NODE_ENV === "development") {
          logger.warn({ url }, "Empty error detected");
        }
        throw {
          success: false,
          error: "Error desconocido en la petición",
          errorCode: "INTERNAL_ERROR" as any,
          statusCode: 500,
          details: {
            originalError: "Empty object",
            errorType: typeof error,
            errorConstructor: error?.constructor?.name,
            errorString: String(error),
            errorJSON: JSON.stringify(error),
          },
        };
      }

      // Si el error tiene la propiedad errorCode pero no es enumerable, intentar acceder directamente
      if (error && typeof error === "object" && !hasErrorCode) {
        // Intentar acceder a propiedades comunes que podrían no ser enumerables
        const errorObj = error as any;
        if (errorObj.errorCode || errorObj.statusCode || errorObj.error) {
          // El error tiene estructura pero no es enumerable, formatearlo
          throw {
            success: false,
            error: errorObj.error || "Error desconocido",
            errorCode: errorObj.errorCode || "INTERNAL_ERROR",
            statusCode: errorObj.statusCode || 500,
            details: errorObj.details || { originalError: errorObj },
          };
        }
      }

      // Si es un error de red o parseo, formatearlo
      if (error instanceof TypeError && error.message.includes("fetch")) {
        if (process.env.NODE_ENV === "development") {
          logger.error({ error: error.message, url }, "Network error");
        }
        throw {
          success: false,
          error: "Error de conexión. Verifica tu conexión a internet.",
          errorCode: "EXTERNAL_SERVICE_ERROR" as any,
          statusCode: 0,
          details: { type: "network_error", message: error.message },
        };
      }

      // Si es un error de JSON parse
      if (error instanceof SyntaxError) {
        if (process.env.NODE_ENV === "development") {
          logger.error({ error: error.message, url }, "JSON parse error");
        }
        throw {
          success: false,
          error: "Error al procesar la respuesta del servidor",
          errorCode: "INTERNAL_ERROR" as any,
          statusCode: 500,
          details: { type: "parse_error", message: error.message },
        };
      }

      // Error genérico - loguear solo en desarrollo
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : { originalError: String(error) };

      if (process.env.NODE_ENV === "development") {
        logger.error(
          {
            error: errorMessage,
            details: errorDetails,
            url,
          },
          "Unknown HTTP error"
        );
      }

      throw {
        success: false,
        error: errorMessage || "Error desconocido",
        errorCode: "INTERNAL_ERROR" as any,
        statusCode: 500,
        details: errorDetails,
      };
    }
  }

  // Métodos de conveniencia
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const httpService = new HttpService();
export default httpService;
