import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // Limpiar datos existentes (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    // Primero eliminar registros dependientes
    await prisma.auditLog.deleteMany()
    await prisma.verificationCode.deleteMany()
    await prisma.user.deleteMany()
    await prisma.userIdSequence.deleteMany()
    console.log('🧹 Datos anteriores eliminados')
  }

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

  // Hash de contraseña común para pruebas: Admin123!
  const passwordHash = await bcrypt.hash('Admin123!', 10)

  // Crear usuarios de prueba para cada rol
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
    },
    {
      email: 'tesorero@poimensoft.com',
      name: 'Ana Tesorera',
      password: passwordHash,
      role: UserRole.TESORERO,
      customId: 'TES001',
      isActive: true,
      emailVerified: new Date(),
      acceptedDataPolicy: true,
      acceptedTerms: true,
      acceptedMarketing: false,
    },
    {
      email: 'admin@poimensoft.com',
      name: 'Carlos Administrativo',
      password: passwordHash,
      role: UserRole.ADMINISTRATIVO,
      customId: 'ADM001',
      isActive: true,
      emailVerified: new Date(),
      acceptedDataPolicy: true,
      acceptedTerms: true,
      acceptedMarketing: false,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user
    })
    console.log(`✅ Usuario creado: ${user.email} (${user.role})`)
  }

  // Actualizar secuencias con el último número usado
  await prisma.userIdSequence.update({
    where: { rolePrefix: 'SAD' },
    data: { lastNumber: 1 }
  })
  await prisma.userIdSequence.update({
    where: { rolePrefix: 'PAS' },
    data: { lastNumber: 1 }
  })
  await prisma.userIdSequence.update({
    where: { rolePrefix: 'SUP' },
    data: { lastNumber: 1 }
  })
  await prisma.userIdSequence.update({
    where: { rolePrefix: 'DIS' },
    data: { lastNumber: 1 }
  })
  await prisma.userIdSequence.update({
    where: { rolePrefix: 'TES' },
    data: { lastNumber: 1 }
  })
  await prisma.userIdSequence.update({
    where: { rolePrefix: 'ADM' },
    data: { lastNumber: 1 }
  })

  console.log('')
  console.log('🎉 Seed completado exitosamente!')
  console.log('')
  console.log('📋 Usuarios de prueba creados:')
  console.log('┌──────────────────────────────────┬──────────────┬─────────────┐')
  console.log('│ Email                            │ Rol          │ Password    │')
  console.log('├──────────────────────────────────┼──────────────┼─────────────┤')
  console.log('│ superadmin@poimensoft.com        │ SUPERADMIN   │ Admin123!   │')
  console.log('│ pastor@poimensoft.com            │ PASTOR       │ Admin123!   │')
  console.log('│ supervisor@poimensoft.com        │ SUPERVISOR   │ Admin123!   │')
  console.log('│ discipulador@poimensoft.com      │ DISCIPULADOR │ Admin123!   │')
  console.log('│ tesorero@poimensoft.com          │ TESORERO     │ Admin123!   │')
  console.log('│ admin@poimensoft.com             │ ADMINISTRATIVO│ Admin123!   │')
  console.log('└──────────────────────────────────┴──────────────┴─────────────┘')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
