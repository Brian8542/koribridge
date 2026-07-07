import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLocale } from "../hooks/useLocale";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { formatTimeAgo } from "../utils/formatters";

function notificationText(n, t) {
  const name = n.actor?.display_name || "";
  if (n.type === "match") return `${name}${t.notifMatchSuffix}`;
  if (n.type === "like") {
    const target = n.payload?.type;
    if (target === "prompt") return `${name}${t.likedYourPrompt}`;
    if (target === "photo") return `${name}${t.likedYourPhoto}`;
    return `${name}${t.likedYourProfile}`;
  }
  return n.payload?.message || "";
}

function NotificationBell({ userId }) {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);
    if (!error) setUnread(count || 0);
  }, [userId]);

  const loadItems = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, payload, read_at, created_at, actor:profiles!actor_id(id, display_name, avatar_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (!error) setItems(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadUnreadCount(); }, [loadUnreadCount]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`notifications:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => {
          setUnread((c) => c + 1);
          if (open) loadItems();
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId, open, loadItems]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) loadItems();
  };

  const markAllRead = async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    if (!error) {
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    }
  };

  const openItem = async (n) => {
    if (!n.read_at) {
      supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id).then(() => {});
      setUnread((c) => Math.max(0, c - 1));
      setItems((prev) => prev.map((item) => item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item));
    }
    setOpen(false);
    if (n.type === "match" && n.actor?.id) navigate(`/chat/${n.actor.id}`);
    else if (n.actor?.id) navigate(`/profile/${n.actor.id}`);
  };

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={t.notifBellLabel}
        className="relative w-9 h-9 rounded-full bg-[#F3EEE6] hover:bg-[#ECE5DA] flex items-center justify-center text-[#8A837B] hover:text-[#1E1B18] transition-colors"
      >
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E8604C] text-[9px] text-white font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] bg-white rounded-[20px] shadow-modal border border-[#E5DED2] overflow-hidden z-[60]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3EEE6]">
            <p className="font-display text-[16px] text-[#1E1B18]">{t.notifTitle}</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[12px] font-semibold text-[#4A1D3F] hover:underline"
              >
                {t.notifMarkAllRead}
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-[#E5DED2] border-t-[#4A1D3F] rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10 px-6">
                <div className="w-12 h-12 rounded-full bg-[#F3EEE6] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#C9C1B4]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <p className="text-[14px] font-semibold text-[#1E1B18]">{t.notifEmpty}</p>
                <p className="text-[12px] text-[#8A837B] mt-1">{t.notifEmptyDesc}</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openItem(n)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-[#FAF7F2] ${
                    n.read_at ? "" : "bg-[#F1E9EE]/60"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {isRealAvatar(n.actor?.avatar_url) ? (
                      <img src={n.actor.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${getAvatarGradient(n.actor?.avatar_url, n.actor?.id)} flex items-center justify-center text-sm font-bold text-white`}>
                        {n.actor?.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                      n.type === "match" ? "bg-[#4A1D3F]" : "bg-[#E8604C]"
                    }`}>
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1E1B18] leading-snug">{notificationText(n, t)}</p>
                    {n.payload?.answer && (
                      <p className="mt-1 text-[12px] text-[#8A837B] italic line-clamp-2">"{n.payload.answer}"</p>
                    )}
                    <p className="mt-1 text-[11px] text-[#B3AB9F]">{formatTimeAgo(n.created_at, locale)}</p>
                  </div>
                  {!n.read_at && <span className="w-2 h-2 rounded-full bg-[#E8604C] flex-shrink-0 mt-1.5" aria-hidden="true" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(NotificationBell);
