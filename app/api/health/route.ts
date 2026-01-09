import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Health Check Endpoint para Railway
 * GET /api/health
 * 
 * Verifica que la aplicación y la base de datos estén funcionando correctamente.
 */
export async function GET() {
  const startTime = Date.now()
  
  // Información básica de salud (siempre disponible)
  const basicHealth = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    responseTime: `${Date.now() - startTime}ms`,
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development'
  }
  
  // Si no hay DATABASE_URL, retornar healthy sin verificar DB
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      ...basicHealth,
      database: 'not_configured'
    })
  }
  
  try {
    // Verificar conexión a base de datos solo si está configurada
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      ...basicHealth,
      database: 'connected',
      responseTime: `${responseTime}ms`
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    console.error('Health check database error:', error)
    
    // Retornar healthy pero con advertencia de DB
    return NextResponse.json({
      ...basicHealth,
      database: 'disconnected',
      warning: 'Database connection failed but app is running',
      responseTime: `${responseTime}ms`
    })
  }
}
