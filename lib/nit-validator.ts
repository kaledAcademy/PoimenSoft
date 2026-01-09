/**
 * Validador de NIT colombiano con dígito verificador
 * Formato: 123456789-0 (9 dígitos, guión, 1 dígito verificador)
 */

/**
 * Calcula el dígito verificador de un NIT
 * @param nit Sin dígito verificador (9 dígitos)
 * @returns Dígito verificador calculado
 */
function calculateNitCheckDigit(nit: string): number {
  const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3]
  let sum = 0

  for (let i = 0; i < nit.length; i++) {
    sum += parseInt(nit[i]) * weights[i]
  }

  const remainder = sum % 11
  if (remainder < 2) {
    return remainder
  }
  return 11 - remainder
}

/**
 * Valida un NIT con su dígito verificador
 * @param nit NIT completo con formato: 123456789-0
 * @returns true si el dígito verificador es válido
 */
export function validateNitWithDv(nit: string): boolean {
  // Validar formato básico
  if (!/^\d{9}-\d$/.test(nit)) {
    return false
  }

  const [nitNumber, checkDigit] = nit.split('-')
  const calculatedCheckDigit = calculateNitCheckDigit(nitNumber)

  return calculatedCheckDigit === parseInt(checkDigit)
}

/**
 * Calcula y retorna el NIT completo con dígito verificador
 * @param nit Sin dígito verificador (9 dígitos)
 * @returns NIT completo con formato: 123456789-0
 */
export function addNitCheckDigit(nit: string): string {
  if (!/^\d{9}$/.test(nit)) {
    throw new Error('NIT debe tener exactamente 9 dígitos')
  }

  const checkDigit = calculateNitCheckDigit(nit)
  return `${nit}-${checkDigit}`
}
