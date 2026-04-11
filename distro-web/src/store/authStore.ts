import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: number;
  phone: string;
  storeName: string;
  role: "BUYER" | "ADMIN";
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isLoggedIn: () => boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      _hasHydrated: false,

      setAuth: (token, user) => {
        setCookie("distro-token", token);
        setCookie("distro-role", user.role);
        set({ token, user });
      },

      clearAuth: () => {
        deleteCookie("distro-token");
        deleteCookie("distro-role");
        set({ token: null, user: null });
      },

      isLoggedIn: () => !!get().token,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "distro-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Sync cookies on hydration for middleware to see
        if (state?.token && state?.user) {
          setCookie("distro-token", state.token);
          setCookie("distro-role", state.user.role);
        }
      },
    }
  )
);
