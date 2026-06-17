-- Voice memo + correction feature schema
-- Run in: Supabase Dashboard → SQL Editor

-- 1. Add voice columns to messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS voice_url text;

-- 2. Corrections table
CREATE TABLE IF NOT EXISTS public.corrections (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id   bigint      NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  corrector_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_text  text      NOT NULL,
  corrected_text text      NOT NULL,
  note         text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;

-- Corrector can see their own corrections; message participants can see corrections on their messages
DROP POLICY IF EXISTS "corrections_select" ON public.corrections;
CREATE POLICY "corrections_select" ON public.corrections
  FOR SELECT USING (
    corrector_id = auth.uid()
    OR message_id IN (
      SELECT id FROM public.messages
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "corrections_insert" ON public.corrections;
CREATE POLICY "corrections_insert" ON public.corrections
  FOR INSERT WITH CHECK (
    corrector_id = auth.uid()
    AND message_id IN (
      SELECT id FROM public.messages
      WHERE receiver_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "corrections_delete" ON public.corrections;
CREATE POLICY "corrections_delete" ON public.corrections
  FOR DELETE USING (corrector_id = auth.uid());

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'corrections_original_text_length'
  ) THEN
    ALTER TABLE public.corrections
      ADD CONSTRAINT corrections_original_text_length
      CHECK (char_length(original_text) BETWEEN 1 AND 1000) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'corrections_corrected_text_length'
  ) THEN
    ALTER TABLE public.corrections
      ADD CONSTRAINT corrections_corrected_text_length
      CHECK (char_length(corrected_text) BETWEEN 1 AND 1000) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'corrections_note_length'
  ) THEN
    ALTER TABLE public.corrections
      ADD CONSTRAINT corrections_note_length
      CHECK (char_length(coalesce(note, '')) <= 1000) NOT VALID;
  END IF;
END $$;

-- 3. voice-memos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-memos', 'voice-memos', true)
ON CONFLICT (id) DO NOTHING;

-- INSERT: authenticated users upload into their own folder
DROP POLICY IF EXISTS "voice_memos_insert" ON storage.objects;
CREATE POLICY "voice_memos_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-memos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- SELECT: any authenticated user can read (needed for audio playback)
DROP POLICY IF EXISTS "voice_memos_select" ON storage.objects;
CREATE POLICY "voice_memos_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'voice-memos');

-- DELETE: users can delete their own files
DROP POLICY IF EXISTS "voice_memos_delete" ON storage.objects;
CREATE POLICY "voice_memos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'voice-memos' AND (storage.foldername(name))[1] = auth.uid()::text);
