import { defineStore } from "pinia";
import { ApiError, apiRequest } from "@/services/api";
import type { User } from "@/types";

type AuthResponse = {
  user: User;
};

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ProfilePayload = {
  firstName: string;
  lastName: string;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  postalCode?: string | null;
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    initialized: false,
    loading: false,
    error: ""
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user)
  },
  actions: {
    async initialize() {
      if (this.initialized) return;

      try {
        const data = await apiRequest<{ user: User }>("/auth/me");
        this.user = data.user;
      } catch (error) {
        this.user = null;
        if (!(error instanceof ApiError && error.status === 401)) {
          this.error = error instanceof Error ? error.message : "Не удалось проверить сессию";
        }
      } finally {
        this.initialized = true;
      }
    },
    async register(payload: RegisterPayload) {
      this.loading = true;
      this.error = "";

      try {
        const data = await apiRequest<AuthResponse>("/auth/register", {
          method: "POST",
          auth: false,
          body: JSON.stringify(payload)
        });

        this.user = data.user;
        this.initialized = true;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Регистрация не выполнена";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async login(payload: LoginPayload) {
      this.loading = true;
      this.error = "";

      try {
        const data = await apiRequest<AuthResponse>("/auth/login", {
          method: "POST",
          auth: false,
          body: JSON.stringify(payload)
        });

        this.user = data.user;
        this.initialized = true;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Вход не выполнен";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async loadProfile() {
      try {
        const data = await apiRequest<{ user: User }>("/auth/me");
        this.user = data.user;
      } catch (error) {
        this.user = null;
        throw error;
      }
    },
    async updateProfile(payload: ProfilePayload) {
      this.loading = true;
      this.error = "";

      try {
        const data = await apiRequest<{ user: User }>("/users/me", {
          method: "PATCH",
          body: JSON.stringify(payload)
        });

        this.user = data.user;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Профиль не сохранён";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        await apiRequest<never>("/auth/logout", { method: "POST" });
      } catch {
        // Local state must still be cleared when the API is unavailable.
      } finally {
        this.user = null;
        this.initialized = true;
        this.error = "";
      }
    }
  }
});
