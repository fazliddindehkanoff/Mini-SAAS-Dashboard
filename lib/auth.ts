"use client"

// Simple auth utility for client-side protection
// This will be replaced with proper backend auth later

const AUTH_KEY = "auth_token"

export const auth = {
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, token)
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(AUTH_KEY)
    }
    return null
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_KEY)
    }
  },

  isAuthenticated: (): boolean => {
    return auth.getToken() !== null
  },
}

