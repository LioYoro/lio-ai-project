-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data (cast auth.uid() to text since our IDs are varchar)
CREATE POLICY "Users can view own profile" ON public.users
  FOR ALL USING (id::text = auth.uid()::text);

CREATE POLICY "Users can manage own documents" ON public.documents
  FOR ALL USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Users can manage own workflows" ON public.workflows
  FOR ALL USING (user_id::text = auth.uid()::text);