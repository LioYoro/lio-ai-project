import { useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useAuth = () => {
  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
      
      if (error) throw new Error(error.message)
      
      // Store token
      if (data.session) {
        localStorage.setItem('sb-access-token', data.session.access_token)
      }
      
      return data
    },
  })

  const register = useMutation({
    mutationFn: async (data: { email: string; password: string; full_name?: string }) => {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name || ''
          }
        }
      })
      
      if (error) throw new Error(error.message)
      
      // If auto-confirmed, login immediately
      if (signUpData.session) {
        localStorage.setItem('sb-access-token', signUpData.session.access_token)
      }
      
      return signUpData
    },
  })

  const logout = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut()
      localStorage.removeItem('sb-access-token')
    },
  })

  return { login, register, logout }
}