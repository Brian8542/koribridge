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
    <div className="bg-[#F1E9EE] border border-[#4A1D3F]/20 rounded-apple px-4 py-3 flex items-start justify-between gap-3 text-[13px]">
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <div className="w-5 h-5 rounded-md bg-[#4A1D3F] flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
          </svg>
        </div>
        <p className="leading-relaxed text-[#1E1B18] font-medium">{t.announcementText}</p>
      </div>
      <button
        onClick={dismiss}
        className="text-[#8A837B] hover:text-[#1E1B18] flex-shrink-0 transition-colors mt-0.5"
        aria-label="닫기"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
