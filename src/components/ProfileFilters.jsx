import React, { useCallback } from "react";
import { useLocale } from "../hooks/useLocale";

function ProfileFilters({ activeCount, onOpenFilter, onReset, resultCount }) {
  const { t } = useLocale();

  const handleReset = useCallback((e) => {
    e.stopPropagation();
    onReset();
  }, [onReset]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenFilter}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all border ${
          activeCount > 0
            ? "bg-[#e8f4ff] text-[#0071e3] border-[#0071e3]/30 hover:bg-[#daeeff]"
            : "bg-white text-[#1d1d1f] border-[#d2d2d7] hover:bg-[#f5f5f7]"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        {t.filterOpenBtn}
        {activeCount > 0 && (
          <span className="bg-[#0071e3] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
            {activeCount}
          </span>
        )}
      </button>

      {activeCount > 0 && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-full text-[12px] font-semibold text-[#86868b] hover:text-[#ff3b30] bg-white border border-[#d2d2d7] hover:border-[#ff3b30]/30 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t.filterResetBtn}
        </button>
      )}

      {resultCount !== undefined && (
        <span className="ml-auto text-[12px] text-[#86868b] font-medium flex-shrink-0">
          {resultCount}{t.filterResultCount}
        </span>
      )}
    </div>
  );
}

export default React.memo(ProfileFilters);
