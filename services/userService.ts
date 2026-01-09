import { prisma } from '@/lib/prisma'
import type { User, UserRole } from '@prisma/client'

interface CreateUserData {
  email: string
  password?: string | null
  name?: string | null
  role?: UserRole
  acceptedDataPolicy?: boolean
  acceptedTerms?: boolean
  acceptedMarketing?: boolean
  dataConsentDate?: Date
  termsConsentDate?: Date
}

/**
 * Genera un customId único basado en el rol y un número secuencial
 */
async function generateCustomId(role: UserRole): Promise<string> {
  const rolePrefixMap: Record<UserRole, string> = {
    SUPERADMIN: 'SA',
    PASTOR: 'PA',
    SUPERVISOR: 'SU',
    DISCIPULADOR: 'DI',
    TESORERO: 'TE',
    ADMINISTRATIVO: 'AD',
  }

  const prefix = rolePrefixMap[role] || 'US'
  
  // Obtener o crear la secuencia para este rol
  const sequence = await prisma.userIdSequence.upsert({
    where: { rolePrefix: prefix },
    update: { lastNumber: { increment: 1 } },
    create: { rolePrefix: prefix, lastNumber: 1 },
  })

  return `${prefix}-${String(sequence.lastNumber).padStart(3, '0')}`
}

export const userService = {
  async createUser(data: CreateUserData): Promise<User> {
    const role = data.role || 'DISCIPULADOR'
    const customId = await generateCustomId(role)

    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role,
        customId,
        acceptedDataPolicy: data.acceptedDataPolicy || false,
        acceptedTerms: data.acceptedTerms || false,
        acceptedMarketing: data.acceptedMarketing || false,
        dataConsentDate: data.dataConsentDate || new Date(),
        termsConsentDate: data.termsConsentDate || new Date(),
      },
    })
  },

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  },
}
