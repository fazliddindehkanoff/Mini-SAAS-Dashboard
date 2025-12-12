"use client"

// Auth utility for client-side token management
// Works with backend JWT authentication

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

  // Get authorization header for API requests
  getAuthHeader: (): { Authorization: string } | {} => {
    const token = auth.getToken()
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
    return {}
  },
}

