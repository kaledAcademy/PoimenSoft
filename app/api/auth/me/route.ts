import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware-modules/auth";
import { withRateLimit, RateLimitMiddleware } from "@/lib/middleware-modules/rate-limit";
import { handleApiError } from "@/lib/error-handler";
import { prisma } from "@/lib/prisma";
import { ALLOWED_AUTH_ROLES } from "@/lib/constants/roles";
import { USER_BASIC_SELECT, createUserResponse } from "@/lib/user-transformers";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     description: Retorna la información de la sesión del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user123"
 *                         email:
 *                           type: string
 *                           example: "usuario@empresa.com"
 *                         name:
 *                           type: string
 *                           example: "Juan Pérez"
 *                         role:
 *                           type: string
 *                           enum: [USST, USPR, USPL, ASIN, ASEX, ADM1, ADM2, CEO1, CEO2, CEO3, CEOM]
 *                           example: "USST"
 *                         customId:
 *                           type: string
 *                           example: "USR001"
 *                         currentMembershipId:
 *                           type: string
 *                           example: "MEM001"
 *                         companyName:
 *                           type: string
 *                           example: "Empresa S.A.S"
 *                         profilePhoto:
 *                           type: string
 *                           format: uri
 *                           example: "https://example.com/photo.jpg"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T10:30:00Z"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, RateLimitMiddleware.CONFIGS.GENERAL);
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    // Autenticación usando constantes de roles
    const authResult = await withAuth(request, {
      requiredRoles: ALLOWED_AUTH_ROLES,
    });
    if (!authResult.success) {
      return authResult.response!;
    }

    const authUser = authResult.context!.user;

    // Obtener datos completos del usuario desde la base de datos
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: USER_BASIC_SELECT,
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    // Crear respuesta base del usuario
    const userResponse = createUserResponse({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      customId: dbUser.customId,
      profilePhoto: dbUser.profilePhoto,
      isActive: dbUser.isActive,
      createdAt: dbUser.createdAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
