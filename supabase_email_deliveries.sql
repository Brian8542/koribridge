-- Email delivery log
-- Run in: Supabase Dashboard -> SQL Editor

CREATE TABLE IF NOT EXISTS public.email_deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  email_type text NOT NULL,
  provider text NOT NULL DEFAULT 'resend',
  provider_message_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, email_type)
);

ALTER TABLE public.email_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own email deliveries" ON public.email_deliveries;
CREATE POLICY "Users can view own email deliveries"
  ON public.email_deliveries FOR SELECT
  USING (auth.uid() = user_id);
