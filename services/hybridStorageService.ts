/**
 * Servicio de almacenamiento híbrido para datos de cotizaciones
 * Almacena datos en localStorage del navegador
 */

interface MembershipData {
  selectedProducts: any[]
  selectedContractPlan: any | null
  clientData: any | null
}

export const hybridStorageService = {
  saveMembershipData(membershipId: string, data: MembershipData): void {
    if (typeof window === 'undefined') return
    try {
      const key = `quotation_membership_${membershipId}`
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.warn('Error saving membership data:', error)
    }
  },

  getMembershipData(membershipId: string): MembershipData | null {
    if (typeof window === 'undefined') return null
    try {
      const key = `quotation_membership_${membershipId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.warn('Error getting membership data:', error)
      return null
    }
  },

  clearMembershipData(membershipId: string): void {
    if (typeof window === 'undefined') return
    try {
      const key = `quotation_membership_${membershipId}`
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Error clearing membership data:', error)
    }
  },
}
