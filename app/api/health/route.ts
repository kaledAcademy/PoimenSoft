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
  
  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed',
        responseTime: `${responseTime}ms`
      },
      { status: 503 }
    )
  }
}
