import { NextResponse } from 'next/server'

interface RegistrationData {
  name?: string
  email?: string
  phone?: string
}

/**
 * Valida los campos básicos del registro
 * @param data Datos del formulario de registro
 * @returns NextResponse con error si la validación falla, null si es válido
 */
export function validateUserRegistrationResponse(
  data: RegistrationData
): NextResponse | null {
  // Validación básica - solo verificar campos esenciales
  if (!data.name || data.name.trim().length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'El nombre es requerido',
        fieldErrors: {
          name: 'El nombre es requerido',
        },
      },
      { status: 400 }
    )
  }

  return null // Validación exitosa
}
