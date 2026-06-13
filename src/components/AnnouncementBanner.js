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

  const bgColor = current.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-800"
    : current.type === "error" ? "bg-red-50 border-red-200 text-red-800"
    : "bg-blue-50 border-blue-200 text-blue-800";

  return (
    <div className={`border rounded-2xl px-4 py-3 flex items-start justify-between gap-3 text-sm ${bgColor}`}>
      <p className="flex-1 leading-relaxed">{current.text}</p>
      <button onClick={dismiss} className="text-lg leading-none opacity-60 hover:opacity-100 flex-shrink-0">×</button>
    </div>
  );
}
