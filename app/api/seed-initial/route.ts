import { NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Endpoint temporal para ejecutar seed inicial en producción
 * ⚠️ ELIMINAR DESPUÉS DE EJECUTAR UNA VEZ
 * 
 * GET /api/seed-initial
 */
export async function GET() {
  try {
    // Solo permitir en producción Y solo si no hay usuarios
    const userCount = await prisma.user.count()
    
    if (userCount > 0) {
      return NextResponse.json(
        { 
          error: 'Seed ya ejecutado', 
          message: `Ya existen ${userCount} usuarios en la base de datos`,
          users: await prisma.user.findMany({ select: { email: true, role: true } })
        },
        { status: 400 }
      )
    }

    console.log('🌱 Iniciando seed de base de datos en producción...')

    // Crear secuencias de IDs para cada rol
    const sequences = [
      { rolePrefix: 'SAD', lastNumber: 0 },  // SUPERADMIN
      { rolePrefix: 'PAS', lastNumber: 0 },  // PASTOR
      { rolePrefix: 'SUP', lastNumber: 0 },  // SUPERVISOR
      { rolePrefix: 'DIS', lastNumber: 0 },  // DISCIPULADOR
      { rolePrefix: 'TES', lastNumber: 0 },  // TESORERO
      { rolePrefix: 'ADM', lastNumber: 0 },  // ADMINISTRATIVO
    ]

    for (const seq of sequences) {
      await prisma.userIdSequence.upsert({
        where: { rolePrefix: seq.rolePrefix },
        update: {},
        create: seq
      })
    }

    console.log('✅ Secuencias de IDs creadas')

    // Hash de contraseña común para pruebas
    const passwordHash = await bcrypt.hash('Admin123!', 10)

    // Crear usuarios de prueba
    const users = [
      {
        email: 'superadmin@poimensoft.com',
        name: 'Super Administrador',
        password: passwordHash,
        role: UserRole.SUPERADMIN,
        customId: 'SAD001',
        isActive: true,
        emailVerified: new Date(),
        acceptedDataPolicy: true,
        acceptedTerms: true,
        acceptedMarketing: false,
        dataConsentDate: new Date(),
        termsConsentDate: new Date(),
      },
      {
        email: 'pastor@poimensoft.com',
        name: 'Juan Pastor',
        password: passwordHash,
        role: UserRole.PASTOR,
        customId: 'PAS001',
        isActive: true,
        emailVerified: new Date(),
        acceptedDataPolicy: true,
        acceptedTerms: true,
        acceptedMarketing: false,
        dataConsentDate: new Date(),
        termsConsentDate: new Date(),
      },
      {
        email: 'supervisor@poimensoft.com',
        name: 'María Supervisora',
        password: passwordHash,
        role: UserRole.SUPERVISOR,
        customId: 'SUP001',
        isActive: true,
        emailVerified: new Date(),
        acceptedDataPolicy: true,
        acceptedTerms: true,
        acceptedMarketing: false,
        dataConsentDate: new Date(),
        termsConsentDate: new Date(),
      },
      {
        email: 'discipulador@poimensoft.com',
        name: 'Pedro Discipulador',
        password: passwordHash,
        role: UserRole.DISCIPULADOR,
        customId: 'DIS001',
        isActive: true,
        emailVerified: new Date(),
        acceptedDataPolicy: true,
        acceptedTerms: true,
        acceptedMarketing: false,
        dataConsentDate: new Date(),
        termsConsentDate: new Date(),
      },
    ]

    const createdUsers = []
    for (const user of users) {
      const created = await prisma.user.create({ data: user })
      createdUsers.push({
        email: created.email,
        role: created.role,
        customId: created.customId
      })
      console.log(`✅ Usuario creado: ${created.email} (${created.role})`)
    }

    console.log('🎉 Seed completado exitosamente!')

    return NextResponse.json({
      success: true,
      message: 'Seed ejecutado exitosamente en producción',
      users: createdUsers,
      credentials: {
        example: {
          email: 'superadmin@poimensoft.com',
          password: 'Admin123!'
        }
      },
      warning: '⚠️ ELIMINAR el endpoint /api/seed-initial después de usar'
    })

  } catch (error) {
    console.error('❌ Error en seed:', error)
    
    return NextResponse.json(
      { 
        error: 'Error ejecutando seed', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
