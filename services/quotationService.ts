// Servicio de cotizaciones - Modelo Quotation no existe en schema actual
// TODO: Implementar cuando se agregue el modelo Quotation al schema

export const quotationService = {
  async getQuotationById(id: string): Promise<any | null> {
    // Modelo no disponible
    return null
  },

  async getQuotationsByUserId(userId: string): Promise<any[]> {
    // Modelo no disponible
    return []
  },

  async createQuotation(data: {
    userId?: string | null
    temporaryEmail?: string | null
    temporaryPhone?: string | null
    status?: string
    total?: number
  }): Promise<any> {
    // Modelo no disponible
    throw new Error('Quotation model not available')
  },
}
