import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '@/types/auth'

/**
 * Mock Auth Service para desarrollo y testing
 * Solo se usa cuando DATABASE_URL no está configurado
 */
export class MockAuthService {
  private static mockUser: AuthUser | null = null

  static async getCurrentUser(): Promise<AuthUser | null> {
    return this.mockUser
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock login - siempre falla en mock
    return {
      user: null as any,
      session: null,
      error: 'Mock service: Database not configured',
    }
  }

  static async register(
    credentials: RegisterCredentials
  ): Promise<AuthResponse> {
    // Mock register - siempre falla en mock
    return {
      user: null as any,
      session: null,
      error: 'Mock service: Database not configured',
    }
  }

  static async logout(): Promise<{ error?: string }> {
    this.mockUser = null
    return {}
  }

  static async isAuthenticated(): Promise<boolean> {
    return this.mockUser !== null
  }

  static async getSession() {
    return this.mockUser ? { user: this.mockUser } : null
  }
}
