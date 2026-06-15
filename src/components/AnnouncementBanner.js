import React, { useState } from "react";
import { useLocale } from "../hooks/useLocale";

const ANNOUNCEMENT_ID = "2026-06";

export default function AnnouncementBanner() {
  const { t } = useLocale();
  const [dismissed, setDismissed] = useState(() => {
    try {
      const saved = localStorage.getItem("dismissed_announcements");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (dismissed.includes(ANNOUNCEMENT_ID)) return null;

  const dismiss = () => {
    const next = [...dismissed, ANNOUNCEMENT_ID];
    setDismissed(next);
    try { localStorage.setItem("dismissed_announcements", JSON.stringify(next)); } catch {}
  };

  return (
    <div className="rounded-2xl px-4 py-3 flex items-start justify-between gap-3 text-sm bg-gradient-to-r from-red-600 to-rose-500 text-white border border-transparent shadow-sm shadow-red-200">
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <span className="text-base leading-snug flex-shrink-0">📢</span>
        <p className="leading-relaxed font-medium">{t.announcementText}</p>
      </div>
      <button
        onClick={dismiss}
        className="text-lg leading-none flex-shrink-0 transition text-white/60 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}
