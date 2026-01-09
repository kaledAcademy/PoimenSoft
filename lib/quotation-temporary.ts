import { logger } from '@/lib/logger'

/**
 * Vincula cotizaciones temporales a un usuario cuando se registra
 * @param userId ID del usuario
 * @param email Email del usuario
 * @param phone Teléfono del usuario
 * @returns Número de cotizaciones vinculadas
 * 
 * NOTA: Modelo Quotation no existe en el schema actual
 * TODO: Implementar cuando se agregue el modelo Quotation al schema
 */
export async function linkTemporaryQuotationsToUser(
  userId: string,
  email: string,
  phone: string
): Promise<number> {
  // Modelo Quotation no existe en el schema actual
  // Retornar 0 por ahora
  logger.debug(
    {
      userId,
      email,
      phone,
    },
    'Quotation linking skipped - model not available'
  )
  return 0
}
