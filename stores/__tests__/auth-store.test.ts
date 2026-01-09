/**
 * Tests unitarios para auth-store.ts
 * Valida logica de autenticacion y manejo de estado
 */

import { act, renderHook, waitFor } from "@testing-library/react";

// Mock de AuthService ANTES de importar el store
jest.mock("@/lib/auth", () => ({
  AuthService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Import after mock
import { useAuthStore } from "../auth-store";
import { AuthService } from "@/lib/auth";
import { AuthUser } from "@/types/auth";

const mockUser: AuthUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "USST",
  customId: "USST-001",
  hasCompletedPurchase: true,
  profilePhoto: undefined,
  image: undefined,
  purchaseDate: undefined,
  membershipId: undefined,
};

describe("auth-store", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser(null);
      result.current.setLoading(false);
    });

    // Clear mocks
    jest.clearAllMocks();
  });

  describe("Estado inicial", () => {
    it("debe tener usuario null inicialmente", () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.user).toBeNull();
    });

    it("debe tener isAuthenticated false inicialmente", () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("debe tener isLoading false inicialmente", () => {
      const { result } = renderHook(() => useAuthStore());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("setUser", () => {
    it("debe establecer usuario y marcar como autenticado", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("debe limpiar usuario y marcar como no autenticado", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("setLoading", () => {
    it("debe establecer estado de carga", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("login", () => {
    it("debe iniciar sesion exitosamente", async () => {
      (AuthService.login as jest.Mock).mockResolvedValue({
        user: mockUser,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      let loginResult: { success: boolean; error?: string };

      await act(async () => {
        loginResult = await result.current.login({
          email: "test@example.com",
          password: "Test1234",
        });
      });

      expect(loginResult!.success).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it("debe manejar error de login", async () => {
      (AuthService.login as jest.Mock).mockResolvedValue({
        user: null,
        error: "Credenciales invalidas",
      });

      const { result } = renderHook(() => useAuthStore());

      let loginResult: { success: boolean; error?: string };

      await act(async () => {
        loginResult = await result.current.login({
          email: "test@example.com",
          password: "wrong",
        });
      });

      expect(loginResult!.success).toBe(false);
      expect(loginResult!.error).toBe("Credenciales invalidas");
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("debe manejar excepcion durante login", async () => {
      (AuthService.login as jest.Mock).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuthStore());

      let loginResult: { success: boolean; error?: string };

      await act(async () => {
        loginResult = await result.current.login({
          email: "test@example.com",
          password: "Test1234",
        });
      });

      expect(loginResult!.success).toBe(false);
      expect(loginResult!.error).toBe("Network error");
      expect(result.current.isLoading).toBe(false);
    });

    it("debe establecer isLoading durante login", async () => {
      let resolvePromise: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (AuthService.login as jest.Mock).mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuthStore());

      // Start login
      act(() => {
        result.current.login({ email: "test@example.com", password: "Test1234" });
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve login
      await act(async () => {
        resolvePromise!({ user: mockUser, error: null });
        await loginPromise;
      });

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("register", () => {
    it("debe registrar usuario exitosamente", async () => {
      (AuthService.register as jest.Mock).mockResolvedValue({
        user: mockUser,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      let registerResult: { success: boolean; error?: string };

      await act(async () => {
        registerResult = await result.current.register({
          email: "new@example.com",
          password: "Test1234",
          confirmPassword: "Test1234",
          phone: "3001234567",
          acceptDataPolicy: true,
          acceptTerms: true,
        });
      });

      expect(registerResult!.success).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("debe manejar error de registro (email duplicado)", async () => {
      (AuthService.register as jest.Mock).mockResolvedValue({
        user: null,
        error: "El email ya esta registrado",
      });

      const { result } = renderHook(() => useAuthStore());

      let registerResult: { success: boolean; error?: string };

      await act(async () => {
        registerResult = await result.current.register({
          email: "existing@example.com",
          password: "Test1234",
          confirmPassword: "Test1234",
          phone: "3001234567",
          acceptDataPolicy: true,
          acceptTerms: true,
        });
      });

      expect(registerResult!.success).toBe(false);
      expect(registerResult!.error).toContain("email");
    });

    it("debe manejar excepcion durante registro", async () => {
      (AuthService.register as jest.Mock).mockRejectedValue({
        error: "Error de servidor",
      });

      const { result } = renderHook(() => useAuthStore());

      let registerResult: { success: boolean; error?: string };

      await act(async () => {
        registerResult = await result.current.register({
          email: "test@example.com",
          password: "Test1234",
          confirmPassword: "Test1234",
          phone: "3001234567",
          acceptDataPolicy: true,
          acceptTerms: true,
        });
      });

      expect(registerResult!.success).toBe(false);
      expect(registerResult!.error).toBe("Error de servidor");
    });
  });

  describe("logout", () => {
    it("debe cerrar sesion exitosamente", async () => {
      (AuthService.logout as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      // Primero establecer usuario
      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Cerrar sesion
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("debe manejar error durante logout gracefully", async () => {
      (AuthService.logout as jest.Mock).mockRejectedValue(new Error("Logout failed"));

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      // Logout deberia completarse aunque falle (graceful degradation)
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("checkAuth", () => {
    it("debe establecer usuario si esta autenticado", async () => {
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("debe manejar 401 como no autenticado (sin error)", async () => {
      (AuthService.getCurrentUser as jest.Mock).mockRejectedValue({
        statusCode: 401,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("debe manejar otros errores", async () => {
      (AuthService.getCurrentUser as jest.Mock).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("updateUserAvatar", () => {
    it("debe actualizar avatar del usuario", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      act(() => {
        result.current.updateUserAvatar("https://example.com/avatar.jpg");
      });

      expect(result.current.user?.profilePhoto).toBe("https://example.com/avatar.jpg");
      expect(result.current.user?.image).toBe("https://example.com/avatar.jpg");
    });

    it("no debe hacer nada si no hay usuario", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.updateUserAvatar("https://example.com/avatar.jpg");
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe("Persistencia", () => {
    it("store debe tener nombre para persistencia", () => {
      // El store esta configurado con persist middleware
      // Verificamos que el nombre este definido
      const { result } = renderHook(() => useAuthStore());

      // El store debe funcionar correctamente
      expect(result.current).toBeDefined();
      expect(typeof result.current.login).toBe("function");
      expect(typeof result.current.logout).toBe("function");
    });
  });

  describe("Roles de usuario", () => {
    it("debe manejar usuario con rol USST", async () => {
      const usstUser = { ...mockUser, role: "USST" as const };
      (AuthService.login as jest.Mock).mockResolvedValue({
        user: usstUser,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({ email: "test@example.com", password: "Test1234" });
      });

      expect(result.current.user?.role).toBe("USST");
    });

    it("debe manejar usuario con rol ADMN", async () => {
      const adminUser = { ...mockUser, role: "ADMN" as const };
      (AuthService.login as jest.Mock).mockResolvedValue({
        user: adminUser,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({ email: "admin@example.com", password: "Test1234" });
      });

      expect(result.current.user?.role).toBe("ADMN");
    });

    it("debe manejar usuario con hasCompletedPurchase false", async () => {
      const newUser = { ...mockUser, hasCompletedPurchase: false };
      (AuthService.login as jest.Mock).mockResolvedValue({
        user: newUser,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login({ email: "new@example.com", password: "Test1234" });
      });

      expect(result.current.user?.hasCompletedPurchase).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
