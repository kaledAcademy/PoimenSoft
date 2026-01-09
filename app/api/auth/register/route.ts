import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRateLimit, RateLimitMiddleware } from "@/lib/middleware-modules/rate-limit";
import { prisma } from "@/lib/prisma";
import { userService } from "@/services/userService";
import { EmailService } from "@/services/emailService";
import { logger } from "@/lib/logger";
import { emailQueue } from "@/lib/email-queue";
import { handleApiError } from "@/lib/error-handler";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { generateAuthToken, generateConfirmationToken } from "@/lib/jwt-utils";
import { setAuthCookie, getCookieExpirationDate } from "@/lib/auth-cookies";
import { createRegisterAuditLog } from "@/lib/audit-helpers";
import { validateUserRegistrationResponse } from "@/lib/user-validation";
import { createUserResponse, createTokenPayload } from "@/lib/user-transformers";
// Referencias a cotizaciones comentadas - modelo no existe en schema actual
// import { linkTemporaryQuotationsToUser } from "@/lib/quotation-temporary";
// import { quotationService } from "@/services/quotationService";

// Schema de validación para registro simplificado (rápido)
const quickRegisterSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
  confirmPassword: z.string().optional(),
  // Consentimientos legales (Ley 1581/2012 - OBLIGATORIOS)
  acceptDataPolicy: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar la Política de Tratamiento de Datos Personales",
  }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los Términos y Condiciones",
  }),
  acceptMarketing: z.boolean().optional(),
});

// Schema de validación para registro completo (tradicional)
// Simplificado para trabajar con el schema actual de Prisma
const fullRegisterSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),

    // Datos comunes
    phone: z.string().min(1, "El teléfono es requerido"),
    name: z.string().min(1, "El nombre es requerido"),

    // Consentimientos legales (Ley 1581/2012 - OBLIGATORIOS)
    acceptDataPolicy: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar la Política de Tratamiento de Datos Personales",
    }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los Términos y Condiciones",
    }),
    acceptMarketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
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
 *               - confirmPassword
 *               - userType
 *               - phone
 *               - address
 *               - city
 *               - department
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevo@empresa.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "password123"
 *               confirmPassword:
 *                 type: string
 *                 example: "password123"
 *               userType:
 *                 type: string
 *                 enum: [NATURAL, JURIDICA]
 *               phone:
 *                 type: string
 *                 example: "+57 300 123 4567"
 *               address:
 *                 type: string
 *                 example: "Calle 123 #45-67"
 *               city:
 *                 type: string
 *                 example: "Bogotá"
 *               department:
 *                 type: string
 *                 example: "Cundinamarca"
 *               fullName:
 *                 type: string
 *                 example: "Juan Pérez"
 *               documentType:
 *                 type: string
 *                 enum: [CEDULA_CIUDADANIA, CEDULA_EXTRANJERIA, PASAPORTE, NIT]
 *               documentNumber:
 *                 type: string
 *                 example: "1234567890"
 *               companyName:
 *                 type: string
 *                 example: "Empresa S.A.S."
 *               nit:
 *                 type: string
 *                 example: "900123456-7"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
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
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         customId:
 *                           type: string
 *                     accessToken:
 *                       type: string
 *                     expires:
 *                       type: string
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: El usuario ya existe
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || "unknown";
  const requestLogger = logger.child({ requestId, action: "register" });

  try {
    requestLogger.info({}, "Registration process started");

    // Rate limiting
    const rateLimitResult = await withRateLimit(request, RateLimitMiddleware.CONFIGS.AUTH);
    if (!rateLimitResult.success) {
      requestLogger.warn({}, "Rate limit exceeded");
      return rateLimitResult.response!;
    }

    // Parsear datos
    const body = await request.json();

    // Detectar tipo de registro: simplificado o completo
    const isQuickRegister =
      !body.userType && !body.address && !body.city && !body.department && body.email && body.phone;

    let data: any;

    if (isQuickRegister) {
      // Registro rápido (simplificado)
      const quickValidation = quickRegisterSchema.safeParse(body);
      if (!quickValidation.success) {
        requestLogger.warn(
          { issues: quickValidation.error.issues },
          "Quick registration validation failed"
        );
        return NextResponse.json(
          {
            success: false,
            error: "Datos de entrada inválidos",
            details: quickValidation.error.issues,
          },
          { status: 400 }
        );
      }
      data = quickValidation.data;
      requestLogger.debug({ email: data.email }, "Quick registration validated");
    } else {
      // Registro completo (tradicional)
      const fullValidation = fullRegisterSchema.safeParse(body);
      if (!fullValidation.success) {
        requestLogger.warn(
          { issues: fullValidation.error.issues },
          "Full registration validation failed"
        );
        return NextResponse.json(
          {
            success: false,
            error: "Datos de entrada inválidos",
            details: fullValidation.error.issues,
          },
          { status: 400 }
        );
      }
      data = fullValidation.data;
      requestLogger.debug(
        { email: data.email },
        "Full registration validated"
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      requestLogger.warn({ email: data.email }, "Email already registered");

      // Usuario ya existe - retornar error con opciones
      requestLogger.warn(
        {
          userId: existingUser.id,
          email: data.email,
        },
        "Email already registered, returning 409 with options"
      );

      return NextResponse.json(
        {
          success: false,
          error: "Este email ya está registrado.",
          errorCode: "EMAIL_EXISTS",
          existingUser: true,
          hasPassword: !!existingUser.password, // Indica si el usuario tiene contraseña configurada
          options: {
            login: true, // Opción de iniciar sesión disponible
            recoverPassword: !!existingUser.password, // Solo si tiene contraseña puede recuperarla
          },
          message:
            "Este email ya está registrado. Puedes iniciar sesión o recuperar tu contraseña si la olvidaste.",
        },
        { status: 409 }
      );
    }

    // Hash de la contraseña (si se proporciona)
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 12) : null;
    requestLogger.debug({}, "Password processed");

    // Preparar datos para crear usuario
    const userData: any = {
      email: data.email,
      password: hashedPassword,
      role: UserRole.DISCIPULADOR, // Por defecto Discipulador
      // Consentimientos legales (Ley 1581/2012)
      acceptedDataPolicy: data.acceptDataPolicy,
      acceptedTerms: data.acceptTerms,
      acceptedMarketing: data.acceptMarketing || false,
      dataConsentDate: new Date(),
      termsConsentDate: new Date(),
    };

    if (isQuickRegister) {
      // Registro rápido: solo datos mínimos
      userData.name = data.name; // Nombres y apellidos del usuario
    } else {
      // Registro completo: todos los datos
      userData.name = data.name;
    }

    // Crear usuario
    let newUser = await userService.createUser(userData);
    requestLogger.info(
      { userId: newUser.id, customId: newUser.customId, isQuickRegister },
      "User created"
    );

    // Lógica de cotizaciones comentada - modelo no existe en schema actual
    // TODO: Implementar cuando se agregue el modelo Quotation al schema

    // Generar token JWT usando helper (con rol actualizado si corresponde)
    const tokenPayload = createTokenPayload(newUser);
    const token = generateAuthToken(tokenPayload);
    requestLogger.debug({ userId: newUser.id }, "Token generated");

    // Registrar en audit log usando helper
    await createRegisterAuditLog(
      newUser.id,
      newUser.email,
      newUser.role,
      newUser.customId,
      request
    );
    requestLogger.debug({ userId: newUser.id }, "Audit log created");

    // Nota: El email de confirmación de cuenta se enviará cuando el usuario complete
    // el formulario completo de empresa (más completo) antes del pago y acceso al dashboard.
    // No se envía en el registro rápido para evitar emails innecesarios.

    // Crear respuesta con cookie HttpOnly
    const cookieExpires = getCookieExpirationDate();
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: createUserResponse({
            id: newUser.id,
            email: newUser.email,
            name: newUser.name ?? null,
            role: newUser.role,
            customId: newUser.customId,
            profilePhoto: newUser.profilePhoto ?? null,
            isActive: newUser.isActive,
            createdAt: newUser.createdAt,
          }),
          // No enviar token en el body por seguridad (solo en cookie HttpOnly)
          expires: cookieExpires.toISOString(),
        },
        message: "Usuario registrado exitosamente",
      },
      { status: 201 }
    );

    // Establecer cookie HttpOnly usando helper
    setAuthCookie(response, token);
    response.headers.set("x-request-id", requestId);

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    requestLogger.info(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        ip: ipAddress,
      },
      "Registration completed successfully"
    );

    return response;
  } catch (error) {
    requestLogger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Registration failed"
    );
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos de entrada inválidos", details: error.issues },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
