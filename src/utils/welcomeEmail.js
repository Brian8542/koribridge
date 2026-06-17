import { supabase } from "../lib/supabase";

export async function sendWelcomeEmail({ userId, email, locale }) {
  if (!userId || !email) return;

  try {
    await supabase.functions.invoke("send-welcome-email", {
      body: { user_id: userId, email, locale },
    });
  } catch {
    // Non-critical: Supabase Auth verification email still handles signup.
  }
}
