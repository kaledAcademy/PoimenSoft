/**
 * Cola de emails para procesamiento asíncrono
 * Implementación básica que procesa emails inmediatamente
 * En producción, esto debería usar una cola real como Bull, RabbitMQ, etc.
 */

interface EmailJob {
  type: string
  data: any
}

class EmailQueue {
  private queue: EmailJob[] = []

  async add(type: string, data: any): Promise<void> {
    // En desarrollo, solo agregar a la cola
    // En producción, esto debería agregar a una cola real
    this.queue.push({ type, data })
    
    // Procesar inmediatamente (en producción sería asíncrono)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EmailQueue] Added job: ${type}`, data)
    }
  }

  async process(): Promise<void> {
    // Procesar cola (implementación básica)
    // En producción, esto sería manejado por workers
  }
}

export const emailQueue = new EmailQueue()
