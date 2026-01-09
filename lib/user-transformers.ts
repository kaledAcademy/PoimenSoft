import { User, UserRole } from "@prisma/client";
import { AuthUser, UserRole as AuthUserRole } from "@/types/auth";
import { ExtendedUser } from "@/types/auth-extended";

/**
 * Transforma un usuario de Prisma a AuthUser para el cliente
 * @param user - Usuario de Prisma
 * @returns AuthUser para el cliente
 */
export function transformUserToAuthUser(
  user: User & {
    name?: string | null;
    customId?: string;
    profilePhoto?: string | null;
    image?: string | null;
  }
): AuthUser & { profilePhoto?: string; image?: string } {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    role: user.role as AuthUserRole,
    customId: user.customId,
    profile: undefined, // No se incluye el perfil completo en AuthUser
    hasCompletedPurchase: false, // Campo no existe en schema actual
    purchaseDate: undefined, // Campo no existe en schema actual
    membershipId: undefined, // Campo no existe en schema actual
    profilePhoto: user.profilePhoto ?? user.image ?? undefined,
    image: user.image ?? user.profilePhoto ?? undefined,
  };
}

/**
 * Selección de campos básicos del usuario para respuestas de API
 */
export const USER_BASIC_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  customId: true,
  profilePhoto: true,
  isActive: true,
  createdAt: true,
} as const;

/**
 * Crea un objeto de usuario para respuestas de API
 * @param user - Usuario de Prisma con campos seleccionados
 * @returns Objeto de usuario para respuesta API
 */
export function createUserResponse(user: {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  customId: string;
  profilePhoto?: string | null;
  isActive: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    customId: user.customId,
    currentMembershipId: null, // Campo no existe en schema actual
    companyName: null, // Campo no existe en schema actual
    profilePhoto: user.profilePhoto ?? null,
    hasCompletedPurchase: false, // Campo no existe en schema actual
    purchaseDate: null, // Campo no existe en schema actual
    membershipId: null, // Campo no existe en schema actual
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

/**
 * Crea el payload del token JWT desde un usuario de Prisma o ExtendedUser
 * @param user - Usuario de Prisma o ExtendedUser
 * @returns Payload para token JWT
 */
export function createTokenPayload(user: User | ExtendedUser) {
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    customId: user.customId,
    currentMembershipId: null, // Campo no existe en schema actual
    companyName: null, // Campo no existe en schema actual
    hasCompletedPurchase: false, // Campo no existe en schema actual
    purchaseDate: null, // Campo no existe en schema actual
    membershipId: null, // Campo no existe en schema actual
  };
}
