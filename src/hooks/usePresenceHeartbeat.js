import { useEffect } from "react";
import { supabase } from "../lib/supabase";

const HEARTBEAT_MS = 60 * 1000;

export function usePresenceHeartbeat(userId) {
  useEffect(() => {
    if (!userId) return;

    let timer = null;

    const beat = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        await supabase
          .from("profiles")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("id", userId);
      } catch {
        // presence is best-effort; never surface errors
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") beat();
    };

    beat();
    timer = setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userId]);
}

export function isRecentlyActive(lastSeenAt, minutes = 5) {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < minutes * 60 * 1000;
}
