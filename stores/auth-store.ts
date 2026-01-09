import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { AuthService } from "@/lib/auth";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });

        try {
          const response = await AuthService.login(credentials);

          if (response.error) {
            set({ isLoading: false });
            return { success: false, error: response.error };
          }

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido",
          };
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true });

        try {
          const response = await AuthService.register(credentials);

          if (response.error) {
            set({ isLoading: false });
            // Incluir información adicional del error si está disponible
            const errorResponse: any = { success: false, error: response.error };
            if ((response as any).errorData) {
              errorResponse.errorData = (response as any).errorData;
            }
            return errorResponse;
          }

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          // Manejar tanto objetos de error del httpService como instancias de Error
          const errorMessage =
            error?.error || // Error del httpService (objeto con .error)
            (error instanceof Error ? error.message : null) || // Instancia de Error
            "Error desconocido";
          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await AuthService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error during logout:", error);
          set({ isLoading: false });
        }
      },

      setUser: (user: AuthUser | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuth: async () => {
        set({ isLoading: true });

        try {
          const user = await AuthService.getCurrentUser();
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          });
        } catch (error: any) {
          // Si es 401, es normal (usuario no autenticado) - no es un error real
          if (error?.statusCode === 401) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          } else {
            console.error("Error checking auth:", error);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      },

      updateUserAvatar: (avatarUrl: string) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profilePhoto: avatarUrl,
              image: avatarUrl,
            },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
