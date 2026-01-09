/**
 * Constantes y funciones relacionadas con membresías
 * TODO: Implementar cuando se agreguen los modelos de membresía al schema
 */

import type { Product, MembershipPlan, ContractPlan, ServiceItem } from '@/types/membership'

interface LegacyPricing {
  subtotal: number
  productSubtotal: number
  serviceSubtotal: number
  membershipDiscount: number
  contractDiscount: number
  totalDiscount: number
  finalTotal: number
  taxes: number
  subtotalWithTaxes: number
  grandTotal: number
}

/**
 * Calcula el pricing de una cotización
 * Función básica - implementar lógica completa cuando se agreguen modelos
 */
export function calculateQuotationPricing(
  products: Product[],
  membership: MembershipPlan | null,
  contractPlan: ContractPlan | null,
  services: ServiceItem[]
): LegacyPricing {
  // Cálculo básico - implementar lógica completa después
  const productSubtotal = products.reduce((sum, p) => sum + (p.basePrice || 0), 0)
  const serviceSubtotal = services.reduce(
    (sum, s) => sum + (s.price || 0) * (s.quantity || 1),
    0
  )
  const membershipPrice = membership?.price || 0
  const subtotal = productSubtotal + serviceSubtotal + membershipPrice

  const membershipDiscount = 0 // TODO: Calcular descuento de membresía
  const contractDiscount = 0 // TODO: Calcular descuento de contrato
  const totalDiscount = membershipDiscount + contractDiscount
  const finalTotal = subtotal - totalDiscount

  const taxRate = 0.19
  const taxes = finalTotal * taxRate
  const subtotalWithTaxes = finalTotal + taxes
  const grandTotal = subtotalWithTaxes

  return {
    subtotal,
    productSubtotal,
    serviceSubtotal,
    membershipDiscount,
    contractDiscount,
    totalDiscount,
    finalTotal,
    taxes,
    subtotalWithTaxes,
    grandTotal,
  }
}
