import { supabase } from "../lib/supabase";

export async function sendPushNotification({ receiverId, title, body, url, type, messageId }) {
  if (!receiverId) return;
  try {
    await supabase.functions.invoke("send-push", {
      body: { receiver_id: receiverId, title, body, url, type, message_id: messageId },
    });
  } catch {
    // non-critical — push delivery failure should not surface to user
  }
}
