import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, RateLimitMiddleware } from "@/lib/middleware-modules/rate-limit";
import { handleApiError } from "@/lib/error-handler";
import { removeAuthCookie } from "@/lib/auth-cookies";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Cierra la sesión del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesión cerrada exitosamente"
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
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await withRateLimit(request, RateLimitMiddleware.CONFIGS.AUTH);
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });

    // Limpiar cookie HttpOnly usando helper
    removeAuthCookie(response);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
