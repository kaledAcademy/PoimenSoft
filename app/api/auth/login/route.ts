import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit, RateLimitMiddleware } from "@/lib/middleware-modules/rate-limit";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { handleApiError } from "@/lib/error-handler";
import { createError, ErrorCode } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { generateAuthToken } from "@/lib/jwt-utils";
import { setAuthCookie, getCookieExpirationDate } from "@/lib/auth-cookies";
import { createLoginAuditLog } from "@/lib/audit-helpers";
import { createUserResponse, createTokenPayload } from "@/lib/user-transformers";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y retorna un token JWT
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@empresa.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expires:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-02-14T19:20:40.368Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales inválidas
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
  const requestId = request.headers.get("x-request-id") || "unknown";
  const requestLogger = logger.child({ requestId, action: "login" });

  try {
    requestLogger.info({}, "Login process started");

    // Rate limiting
    const rateLimitResult = await withRateLimit(request, RateLimitMiddleware.CONFIGS.AUTH);
    if (!rateLimitResult.success) {
      requestLogger.warn({}, "Rate limit exceeded");
      return rateLimitResult.response!;
    }

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
    requestLogger.debug({ email }, "Body parsed");

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      requestLogger.warn({ email }, "User not found or inactive");
      throw createError.unauthorized("Credenciales inválidas", ErrorCode.INVALID_CREDENTIALS);
    }

    requestLogger.debug({ userId: user.id, email: user.email }, "User found");

    // Verificar contraseña hasheada
    if (!user.password) {
      // Para usuarios sin password (migración), usar password temporal
      const isValidPassword = password === "password123";
      if (!isValidPassword) {
        requestLogger.warn({ userId: user.id, email: user.email }, "Invalid password (no hash)");
        throw createError.unauthorized("Credenciales inválidas", ErrorCode.INVALID_CREDENTIALS);
      }
    } else {
      // Verificar con bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        requestLogger.warn({ userId: user.id, email: user.email }, "Invalid password");
        throw createError.unauthorized("Credenciales inválidas", ErrorCode.INVALID_CREDENTIALS);
      }
    }

    requestLogger.debug({ userId: user.id }, "Password validated");

    // Generar token JWT usando helper
    const tokenPayload = createTokenPayload(user);
    const token = generateAuthToken(tokenPayload);
    requestLogger.debug({ userId: user.id }, "Token generated");

    // Registrar login en auditoría usando helper
    await createLoginAuditLog(user.id, user.email, user.role, request);
    requestLogger.debug({ userId: user.id }, "Audit log created");

    // Crear respuesta con cookie HttpOnly
    const cookieExpires = getCookieExpirationDate();
    const response = NextResponse.json({
      success: true,
      data: {
        user: createUserResponse({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          customId: user.customId,
          profilePhoto: user.profilePhoto,
          isActive: user.isActive,
          createdAt: user.createdAt,
        }),
        // No enviar token en el body por seguridad (solo en cookie HttpOnly)
        expires: cookieExpires.toISOString(),
      },
    });

    // Establecer cookie HttpOnly usando helper
    setAuthCookie(response, token);
    response.headers.set("x-request-id", requestId);

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    requestLogger.info(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        ip: ipAddress,
      },
      "Login successful"
    );

    return response;
  } catch (error) {
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Login failed"
    );
    return handleApiError(error);
  }
}
