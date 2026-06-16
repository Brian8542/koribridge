-- Voice memo + correction feature schema
-- Run in: Supabase Dashboard → SQL Editor

-- 1. Add voice columns to messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS voice_url text;

-- 2. Corrections table
CREATE TABLE IF NOT EXISTS public.corrections (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id   uuid        NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  corrector_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text  text      NOT NULL,
  corrected_text text      NOT NULL,
  note         text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;

-- Corrector can see their own corrections; message participants can see corrections on their messages
CREATE POLICY "corrections_select" ON public.corrections
  FOR SELECT USING (
    corrector_id = auth.uid()
    OR message_id IN (
      SELECT id FROM public.messages
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
  );

CREATE POLICY "corrections_insert" ON public.corrections
  FOR INSERT WITH CHECK (corrector_id = auth.uid());

CREATE POLICY "corrections_delete" ON public.corrections
  FOR DELETE USING (corrector_id = auth.uid());

-- 3. voice-memos storage bucket
-- Run in: Supabase Dashboard → Storage (create bucket named "voice-memos", public)
-- Then add these RLS policies on the storage.objects table:

-- INSERT: authenticated users upload into their own folder
CREATE POLICY "voice_memos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-memos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- SELECT: any authenticated user can read (needed for audio playback)
CREATE POLICY "voice_memos_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'voice-memos');

-- DELETE: users can delete their own files
CREATE POLICY "voice_memos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'voice-memos' AND (storage.foldername(name))[1] = auth.uid()::text);
