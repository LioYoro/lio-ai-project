import { useMutation } from "@tanstack/react-query";
import apiClient from "../lib/api";

export const useAuth = () => {
  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiClient.post("/api/auth/login", credentials)
      
      // Store token
      if (response.data.access_token) {
        localStorage.setItem('sb-access-token', response.data.access_token)
      }
      
      return response.data
    },
  })

  const register = useMutation({
    mutationFn: async (data: { email: string; password: string; full_name?: string }) => {
      const response = await apiClient.post("/api/auth/register", data)
      return response.data
    },
  })

  const logout = useMutation({
    mutationFn: async () => {
      localStorage.removeItem('sb-access-token')
    },
  })

  return { login, register, logout }
}