import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// 온라인 사용자 ID 목록을 실시간으로 추적하는 훅
export function useOnlineUsers(myUserId) {
  const [onlineIds, setOnlineIds] = useState(new Set());

  useEffect(() => {
    if (!myUserId) return;

    const channel = supabase.channel("online-users", {
      config: { presence: { key: myUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const ids = new Set(Object.keys(state));
        setOnlineIds(ids);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setOnlineIds((prev) => new Set([...prev, key]));
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: myUserId, online_at: new Date().toISOString() });
          supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", myUserId);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myUserId]);

  return onlineIds;
}
