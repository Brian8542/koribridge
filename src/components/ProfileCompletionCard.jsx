import React from "react";
import { useLocale } from "../hooks/useLocale";

export default function ProfileCompletionCard({ completion }) {
  const { t } = useLocale();
  if (!completion) return null;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-neutral-900">{t.profileCompletionTitle}</p>
          <p className="mt-0.5 text-xs text-neutral-400">
            {t.profileCompletionDesc}
          </p>
        </div>
        <span className="rounded-full bg-[#e8f4ff] px-3 py-1 text-[13px] font-bold text-[#0071e3]">
          {completion.percentage}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#f5f5f7]">
        <div
          className="h-full rounded-full bg-[#0071e3] transition-all duration-500"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {completion.items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-2 rounded-apple px-3 py-2 text-[12px] font-semibold ${
              item.done ? "bg-emerald-50 text-emerald-700" : "bg-[#f5f5f7] text-[#86868b]"
            }`}
          >
            <span
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                item.done ? "bg-emerald-500 text-white" : "bg-neutral-200"
              }`}
            >
              {item.done && (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {completion.nextItem && (
        <p className="text-xs font-semibold text-neutral-500">
          {t.profileCompletionNext} <span className="text-[#0071e3]">{completion.nextItem.label}</span>
        </p>
      )}
    </div>
  );
}
