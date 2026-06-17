import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    ".env 파일에 REACT_APP_SUPABASE_URL 과 REACT_APP_SUPABASE_ANON_KEY 또는 VITE_SUPABASE_URL 과 VITE_SUPABASE_ANON_KEY 를 설정해 주세요."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "supabase.auth.token",
  },
});
