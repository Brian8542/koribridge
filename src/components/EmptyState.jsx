import React from "react";

const ICONS = {
  search: (
    <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
    </svg>
  ),
  chat: (
    <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  heart: (
    <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  globe: (
    <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  wifi: (
    <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </svg>
  ),
  default: (
    <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
  ),
};

function getIconForEmoji(icon) {
  if (!icon) return ICONS.default;
  if (icon === "🔍") return ICONS.search;
  if (icon === "💬") return ICONS.chat;
  if (icon === "⭐" || icon === "❤️") return ICONS.heart;
  if (icon === "🌏" || icon === "🌍") return ICONS.globe;
  if (icon === "📡") return ICONS.wifi;
  return ICONS.default;
}

export default function EmptyState({ icon, title, desc, action, actionLabel, secondary, secondaryLabel }) {
  return (
    <div className="bg-white rounded-apple-lg border border-[#E5DED2]/40 text-center py-14 px-6 col-span-full">
      <div className="w-14 h-14 rounded-apple bg-[#F3EEE6] flex items-center justify-center mx-auto mb-4">
        {getIconForEmoji(icon)}
      </div>
      <p className="font-semibold text-[#1E1B18] text-[15px]">{title}</p>
      {desc && (
        <p className="text-[13px] text-[#8A837B] mt-2 leading-relaxed max-w-xs mx-auto">{desc}</p>
      )}
      {action && actionLabel && (
        <div className="mt-6 max-w-[200px] mx-auto">
          <button onClick={action} className="btn-primary text-[13px] py-2.5">{actionLabel}</button>
        </div>
      )}
      {secondary && secondaryLabel && (
        <button onClick={secondary} className="mt-3 text-[13px] text-[#4A1D3F] font-semibold hover:underline transition-colors">
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
