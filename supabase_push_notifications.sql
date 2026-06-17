-- Push subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT push_subscriptions_user_id_unique UNIQUE (user_id)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subscriptions_select" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_select"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_subscriptions_insert" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_insert"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_subscriptions_update" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_update"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_subscriptions_delete" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_delete"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);
