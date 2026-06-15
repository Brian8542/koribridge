import React, { useState } from "react";

const ANNOUNCEMENTS = [
  {
    id: "2026-06",
    text: "KoriBridge에 오신 것을 환영합니다! 프로필을 등록하고 언어 파트너를 찾아보세요.",
    type: "info",
  },
];

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      const saved = localStorage.getItem("dismissed_announcements");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const visible = ANNOUNCEMENTS.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const current = visible[0];

  const dismiss = () => {
    const next = [...dismissed, current.id];
    setDismissed(next);
    try { localStorage.setItem("dismissed_announcements", JSON.stringify(next)); } catch {}
  };

  const style =
    current.type === "warning"
      ? "bg-amber-50 border border-amber-200 text-amber-800"
      : current.type === "error"
      ? "bg-red-50 border border-red-200 text-red-800"
      : "bg-gradient-to-r from-red-600 to-rose-500 text-white border border-transparent shadow-sm shadow-red-200";

  return (
    <div className={`rounded-2xl px-4 py-3 flex items-start justify-between gap-3 text-sm ${style}`}>
      <p className="flex-1 leading-relaxed font-medium">{current.text}</p>
      <button
        onClick={dismiss}
        className={`text-lg leading-none flex-shrink-0 transition ${
          current.type === "info" ? "text-white/60 hover:text-white" : "opacity-60 hover:opacity-100"
        }`}
      >
        ×
      </button>
    </div>
  );
}
