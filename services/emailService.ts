/**
 * Servicio de email básico
 * En producción, esto debería integrarse con un servicio de email real
 * como SendGrid, AWS SES, etc.
 */

export class EmailService {
  static async sendWelcomeEmail(data: {
    to: string
    name: string
    customId: string
  }): Promise<void> {
    // Implementación básica - en producción usar servicio real
    console.log(`[EmailService] Welcome email would be sent to ${data.to}`)
  }

  static async sendConfirmationEmail(data: {
    to: string
    name: string
    token: string
  }): Promise<void> {
    // Implementación básica - en producción usar servicio real
    console.log(`[EmailService] Confirmation email would be sent to ${data.to}`)
  }
}
