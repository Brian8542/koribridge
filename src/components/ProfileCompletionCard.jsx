import React from "react";
import { useLocale } from "../hooks/useLocale";

function ProfileCompletionCard({ completion }) {
  const { t } = useLocale();
  if (!completion) return null;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-[17px] text-[#1E1B18]">{t.profileCompletionTitle}</p>
          <p className="mt-0.5 text-xs text-[#8A837B]">
            {t.profileCompletionBoost}
          </p>
        </div>
        <span className="rounded-full bg-[#F1E9EE] px-3 py-1 text-[13px] font-bold text-[#4A1D3F]">
          {completion.percentage}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#F3EEE6]" role="progressbar" aria-valuenow={completion.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={t.profileCompletionTitle}>
        <div
          className="h-full rounded-full bg-[#4A1D3F] transition-all duration-500"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {completion.items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-[12px] font-semibold ${
              item.done ? "bg-[#EDF3EF] text-[#40664F]" : "bg-[#F3EEE6] text-[#8A837B]"
            }`}
          >
            <span
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                item.done ? "bg-[#5B8A72] text-white" : "bg-[#E5DED2]"
              }`}
            >
              {item.done && (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {completion.nextItem && (
        <p className="text-xs font-semibold text-[#6E675F]">
          {t.profileCompletionNext} <span className="text-[#4A1D3F]">{completion.nextItem.label}</span>
        </p>
      )}
    </div>
  );
}

export default React.memo(ProfileCompletionCard);
