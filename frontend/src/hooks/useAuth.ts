import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { AuthResponse } from "../types";

export const useAuth = () => {
  const getUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    
    // You would fetch user info here
    // For now, we'll just return null if no token
    return token ? { authenticated: true } : null;
  };

  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiClient.post<AuthResponse>("/api/auth/login", credentials);
      localStorage.setItem("access_token", response.data.access_token);
      return response.data;
    },
  });

  const register = useMutation({
    mutationFn: async (data: { email: string; password: string; full_name?: string }) => {
      const response = await apiClient.post<AuthResponse>("/api/auth/register", data);
      localStorage.setItem("access_token", response.data.access_token);
      return response.data;
    },
  });

  const logout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  return { login, register, logout, getUser };
};
