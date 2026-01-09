import {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  UserRole,
} from "@/types/auth";
import { MockAuthService } from "./auth-mock";
import { httpService } from "./http";
import { logger } from "./logger";
import { transformUserToAuthUser } from "./user-transformers";

// En el cliente, siempre usar los endpoints reales (no mock)
// El mock solo se usa en tests o cuando explícitamente se configura
const isDatabaseConfigured = typeof window !== "undefined" ? true : !!process.env.DATABASE_URL;

/**
 * Helper para manejar errores de autenticación de forma consistente
 */
function handleAuthError(error: any, context: string): null {
  // Si es un 401, es normal (usuario no autenticado) - no es un error
  if (error?.statusCode === 401 || error?.errorCode === "UNAUTHORIZED") {
    return null; // Usuario no autenticado, retornar null silenciosamente
  }

  // Solo loguear errores reales (no 401) y solo si hay información útil
  if (error && typeof error === "object") {
    const errorMessage = error.error || error.message || "Error desconocido";
    const errorCode = error.errorCode || error.code || "UNKNOWN_ERROR";
    const statusCode = error.statusCode || error.status;

    // Solo loguear si no es un error esperado o si hay información útil
    if (statusCode && statusCode !== 401) {
      logger.error(
        {
          message: errorMessage,
          code: errorCode,
          statusCode: statusCode,
          details: error.details || {},
        },
        `Error in ${context}`
      );
    }
  } else if (error instanceof Error) {
    logger.error({ error: error.message }, `Error in ${context}`);
  } else if (error) {
    logger.error({ error: String(error) }, `Error in ${context}`);
  }

  return null;
}

export class AuthService {
  // Obtener usuario actual
  static async getCurrentUser(): Promise<AuthUser | null> {
    if (!isDatabaseConfigured) {
      return MockAuthService.getCurrentUser();
    }

    try {
      // Verificar autenticación llamando al endpoint /api/auth/me
      // El token se lee automáticamente desde cookies HttpOnly por el servidor
      if (typeof window !== "undefined") {
        const response = await httpService.get("/api/auth/me", { requireAuth: true });

        if (response.success && response.data && response.data.user) {
          // Transformar respuesta del API a AuthUser usando helper
          // El endpoint retorna { success: true, data: { user: {...} } }
          return transformUserToAuthUser(response.data.user);
        }
      }
      return null;
    } catch (error: any) {
      return handleAuthError(error, "getCurrentUser");
    }
  }

  // Iniciar sesión
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!isDatabaseConfigured) {
      return MockAuthService.login(credentials);
    }

    try {
      // Llamar al endpoint de login usando el servicio HTTP
      const data = await httpService.post("/api/auth/login", credentials, { requireAuth: false });

      if (!data.success) {
        return {
          user: null as any,
          session: null,
          error: data.error || "Error al iniciar sesión",
        };
      }

      // El token se guarda automáticamente en cookie HttpOnly por el servidor
      // No necesitamos guardar nada en localStorage

      const authUser = transformUserToAuthUser(data.data.user);

      return {
        user: authUser,
        session: { access_token: "stored-in-http-only-cookie" },
      };
    } catch (error) {
      return {
        user: null as any,
        session: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // Registro
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (process.env.NODE_ENV === "development") {
      logger.debug(
        {
          email: credentials.email,
          userType: credentials.userType,
        },
        "Register called"
      );
    }

    if (!isDatabaseConfigured) {
      if (process.env.NODE_ENV === "development") {
        logger.warn({}, "Database not configured, using mock");
      }
      return MockAuthService.register(credentials);
    }

    try {
      if (process.env.NODE_ENV === "development") {
        logger.debug({ email: credentials.email }, "Calling register endpoint");
      }

      const data = await httpService.post("/api/auth/register", credentials, {
        requireAuth: false,
      });

      if (!data.success) {
        logger.warn({ error: data.error }, "Register failed");
        return {
          user: null as any,
          session: null,
          error: data.error || "Error al registrarse",
        };
      }

      // El token se guarda automáticamente en cookie HttpOnly por el servidor
      // No necesitamos guardar nada en localStorage

      const authUser = transformUserToAuthUser(data.data.user);

      if (process.env.NODE_ENV === "development") {
        logger.info(
          { userId: authUser.id, email: authUser.email },
          "Register completed successfully"
        );
      }

      return {
        user: authUser,
        session: { access_token: data.data.accessToken },
      };
    } catch (error: any) {
      // Extraer mensaje de error correctamente
      let errorMessage = "Error desconocido";

      if (error && typeof error === "object") {
        // Errores del httpService tienen estructura { error, errorCode, statusCode }
        if ("error" in error && typeof error.error === "string") {
          errorMessage = error.error;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        } else {
          // Último recurso: intentar convertir a string de forma segura
          try {
            errorMessage = JSON.stringify(error);
          } catch {
            errorMessage = String(error);
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Solo loguear en desarrollo o si es un error real (no 409 esperado)
      if (process.env.NODE_ENV === "development") {
        logger.error(
          {
            error: errorMessage,
            errorCode: error?.errorCode,
            statusCode: error?.statusCode,
            errorType: typeof error,
          },
          "Register exception"
        );
      } else if (error?.statusCode && error.statusCode !== 409) {
        // En producción, solo loguear errores inesperados (no 409)
        logger.error(
          {
            error: errorMessage,
            errorCode: error?.errorCode,
            statusCode: error?.statusCode,
          },
          "Register exception"
        );
      }

      // Si es un error EMAIL_EXISTS, incluir información adicional si está disponible
      const errorResponse: any = {
        user: null as any,
        session: null,
        error: errorMessage,
      };

      // Si el error tiene información adicional (hasPassword, options), incluirla
      if (
        error &&
        typeof error === "object" &&
        "errorCode" in error &&
        error.errorCode === "EMAIL_EXISTS"
      ) {
        errorResponse.errorData = {
          hasPassword: error.hasPassword,
          options: error.options,
          existingUser: error.existingUser,
        };
      }

      return errorResponse;
    }
  }

  // Cerrar sesión
  static async logout(): Promise<{ error?: string }> {
    if (!isDatabaseConfigured) {
      return MockAuthService.logout();
    }

    try {
      // Llamar al endpoint de logout para limpiar la cookie HttpOnly en el servidor
      if (typeof window !== "undefined") {
        try {
          await httpService.post("/api/auth/logout", {}, { requireAuth: true });
        } catch (error) {
          // Si falla, log para debugging pero no falla el logout
          console.warn("Error al llamar endpoint de logout:", error);
        }
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Error desconocido" };
    }
  }

  // Verificar si el usuario está autenticado
  // Implementación: verifica si hay un usuario actual
  static async isAuthenticated(): Promise<boolean> {
    if (!isDatabaseConfigured) {
      return MockAuthService.isAuthenticated();
    }

    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  // Obtener sesión actual
  // Implementación: retorna el usuario actual como sesión
  static async getSession() {
    if (!isDatabaseConfigured) {
      return MockAuthService.getSession();
    }

    try {
      const user = await this.getCurrentUser();
      return user ? { user } : null;
    } catch (error) {
      return null;
    }
  }
}
