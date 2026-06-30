import React from "react";
import { useLocale } from "../hooks/useLocale";

function StatsBanner({ onlineCount, total, today }) {
  const { t } = useLocale();
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-apple border border-[#d2d2d7]/40 p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-2xs font-semibold uppercase tracking-widest text-[#86868b]">{t.statsBannerOnline}</p>
        </div>
        <p className="text-[20px] font-bold text-emerald-600">{onlineCount}</p>
      </div>
      <div className="bg-white rounded-apple border border-[#d2d2d7]/40 p-4 text-center">
        <p className="text-2xs font-semibold uppercase tracking-widest text-[#86868b] mb-1">{t.statsBannerTotal}</p>
        <p className="text-[20px] font-bold text-[#1d1d1f]">{total}</p>
      </div>
      <div className="bg-white rounded-apple border border-[#d2d2d7]/40 p-4 text-center">
        <p className="text-2xs font-semibold uppercase tracking-widest text-[#86868b] mb-1">{t.statsBannerToday}</p>
        <p className="text-[20px] font-bold text-[#0071e3]">+{today}</p>
      </div>
    </div>
  );
}

export default React.memo(StatsBanner);
