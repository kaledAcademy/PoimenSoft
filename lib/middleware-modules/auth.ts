import { NextRequest, NextResponse } from "next/server";
import { UserRole, AuthMiddlewareOptions, hasPermission } from "@/types/auth-extended";
import jwt from "jsonwebtoken";

// Interfaz para el contexto de autenticación
export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: UserRole;
    customId: string;
    currentMembershipId?: string;
    companyName?: string;
  };
  permissions: string[];
}

// Función para verificar JWT real
async function verifyJWTToken(request: NextRequest): Promise<any | null> {
  try {
    let token: string | null = null;

    // 1. Buscar en header Authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // 2. Si no hay token en header, buscar en cookies
    if (!token) {
      const cookieToken = request.cookies.get("accessToken")?.value;
      if (cookieToken) {
        token = cookieToken;
      }
    }

    // Si no hay token, retornar null
    if (!token) {
      return null;
    }

    const jwtSecret =
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-key";

    const decoded = jwt.verify(token, jwtSecret) as any;
    return decoded;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export class AuthMiddleware {
  private static instance: AuthMiddleware;

  static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  async authenticate(request: NextRequest): Promise<AuthContext | null> {
    try {
      // Verificar JWT token
      const jwtToken = await verifyJWTToken(request);
      if (!jwtToken) {
        return null;
      }

      return {
        user: {
          id: jwtToken.userId,
          email: jwtToken.email,
          role: jwtToken.role as UserRole,
          customId: jwtToken.customId,
          currentMembershipId: jwtToken.currentMembershipId,
          companyName: jwtToken.companyName,
        },
        permissions: this.getUserPermissions(jwtToken.role as UserRole),
      };
    } catch (error) {
      console.error("Error en autenticación:", error);
      return null;
    }
  }

  async authorize(
    request: NextRequest,
    options: AuthMiddlewareOptions = {}
  ): Promise<{ success: boolean; context?: AuthContext; error?: string }> {
    const authContext = await this.authenticate(request);

    if (!authContext) {
      return {
        success: false,
        error: "No autenticado",
      };
    }

    // Verificar roles requeridos
    if (options.requiredRoles && options.requiredRoles.length > 0) {
      if (!options.requiredRoles.includes(authContext.user.role)) {
        return {
          success: false,
          error: `Rol insuficiente. Rol actual: ${authContext.user.role}. Roles permitidos: ${options.requiredRoles.join(", ")}`,
        };
      }
    }

    // Verificar permisos específicos
    if (options.requiredPermissions && options.requiredPermissions.length > 0) {
      for (const permission of options.requiredPermissions) {
        if (!hasPermission(authContext.user.role, permission.resource, permission.action)) {
          return {
            success: false,
            error: `Permiso insuficiente: ${permission.resource}:${permission.action}`,
          };
        }
      }
    }

    // Verificar acceso a recursos propios
    if (options.allowSelfAccess) {
      const url = new URL(request.url);
      const pathSegments = url.pathname.split("/");
      const resourceId = pathSegments[pathSegments.length - 1];

      // Si el ID del recurso coincide con el ID del usuario, permitir acceso
      if (resourceId === authContext.user.id || resourceId === authContext.user.customId) {
        return {
          success: true,
          context: authContext,
        };
      }
    }

    return {
      success: true,
      context: authContext,
    };
  }

  private getUserPermissions(role: UserRole): string[] {
    const permissions: string[] = [];

    switch (role) {
      case "DISCIPULADOR":
        permissions.push(
          "profile:read",
          "profile:update"
        );
        break;
      case "SUPERVISOR":
        permissions.push(
          "users:read",
          "profile:read",
          "profile:update"
        );
        break;
      case "TESORERO":
        permissions.push(
          "users:read",
          "payments:read",
          "payments:update",
          "analytics:read",
          "reports:read"
        );
        break;
      case "ADMINISTRATIVO":
        permissions.push(
          "users:read",
          "users:update",
          "profile:read",
          "profile:update",
          "analytics:read",
          "reports:read"
        );
        break;
      case "PASTOR":
        permissions.push(
          "users:*",
          "profile:*",
          "analytics:*",
          "reports:*"
        );
        break;
      case "SUPERADMIN":
        permissions.push("*:*"); // Acceso completo
        break;
    }

    return permissions;
  }

  createUnauthorizedResponse(message: string = "No autorizado"): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
        code: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  }

  createForbiddenResponse(message: string = "Acceso denegado"): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
        code: "FORBIDDEN",
      },
      { status: 403 }
    );
  }
}

// Función helper para usar en API routes
export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ success: boolean; context?: AuthContext; response?: NextResponse }> {
  const authMiddleware = AuthMiddleware.getInstance();
  const result = await authMiddleware.authorize(request, options);

  if (!result.success) {
    const response =
      result.error === "No autenticado"
        ? authMiddleware.createUnauthorizedResponse()
        : authMiddleware.createForbiddenResponse(result.error);

    return {
      success: false,
      response,
    };
  }

  return {
    success: true,
    context: result.context,
  };
}

// Función helper para verificar permisos específicos
export function checkPermission(userRole: UserRole, resource: string, action: string): boolean {
  return hasPermission(userRole, resource, action);
}

// Función helper para obtener contexto de autenticación
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  const authMiddleware = AuthMiddleware.getInstance();
  return await authMiddleware.authenticate(request);
}

// Función helper para el middleware principal
export async function verifyAuth(
  request: NextRequest
): Promise<{ success: boolean; user?: any; error?: string }> {
  const authMiddleware = AuthMiddleware.getInstance();
  const authContext = await authMiddleware.authenticate(request);

  if (!authContext) {
    return {
      success: false,
      error: "No autenticado",
    };
  }

  return {
    success: true,
    user: authContext.user,
  };
}
