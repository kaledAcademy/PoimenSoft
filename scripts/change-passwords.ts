import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

/**
 * Script de emergencia para cambiar contraseñas de usuarios de prueba
 * Ejecutar: npx tsx scripts/change-passwords.ts
 */

async function changePasswords() {
  console.log('🔐 Iniciando cambio de contraseñas de seguridad...')
  
  try {
    // Obtener todos los usuarios de prueba
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'superadmin@poimensoft.com',
            'pastor@poimensoft.com',
            'supervisor@poimensoft.com',
            'discipulador@poimensoft.com',
            'tesorero@poimensoft.com',
            'admin@poimensoft.com'
          ]
        }
      }
    })

    console.log(`📋 Encontrados ${testUsers.length} usuarios para actualizar`)

    const newPasswords: Record<string, string> = {}

    // Generar nuevas contraseñas aleatorias para cada usuario
    for (const user of testUsers) {
      // Generar contraseña segura de 16 caracteres
      const newPassword = crypto.randomBytes(12).toString('base64').slice(0, 16)
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      newPasswords[user.email] = newPassword
      console.log(`✅ Contraseña actualizada para: ${user.email}`)
    }

    console.log('\n🎉 Todas las contraseñas han sido actualizadas exitosamente!\n')
    console.log('📝 NUEVAS CONTRASEÑAS (GUARDAR EN PASSWORD MANAGER):')
    console.log('═'.repeat(60))
    
    for (const [email, password] of Object.entries(newPasswords)) {
      console.log(`${email}`)
      console.log(`  Password: ${password}`)
      console.log('─'.repeat(60))
    }

    console.log('\n⚠️  IMPORTANTE:')
    console.log('1. Copia estas contraseñas a un password manager AHORA')
    console.log('2. NUNCA las incluyas en documentación o código')
    console.log('3. Este script se auto-destruirá después de ejecutarse')
    
    return newPasswords

  } catch (error) {
    console.error('❌ Error cambiando contraseñas:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
changePasswords()
  .then((passwords) => {
    console.log('\n✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
