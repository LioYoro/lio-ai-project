import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sohzqjyqtotlzpttumgm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvaHpxanlxdG90bHpwdHR1bWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2Mjk1OTMsImV4cCI6MjA5NDIwNTU5M30.0QzmGxhPTlr8Es8pFSpAIy_jy7Isf0nErM6WAGDUjzE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)