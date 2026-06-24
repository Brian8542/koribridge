import React from "react";

function StatsBanner({ onlineCount, total, today }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-xl border border-neutral-150 shadow-xs p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-2xs font-semibold uppercase tracking-widest text-neutral-400">Online</p>
        </div>
        <p className="text-xl font-bold text-emerald-600">{onlineCount}</p>
      </div>
      <div className="bg-white rounded-xl border border-neutral-150 shadow-xs p-4 text-center">
        <p className="text-2xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">Total</p>
        <p className="text-xl font-bold text-neutral-900">{total}</p>
      </div>
      <div className="bg-white rounded-xl border border-neutral-150 shadow-xs p-4 text-center">
        <p className="text-2xs font-semibold uppercase tracking-widest text-neutral-400 mb-1">Today</p>
        <p className="text-xl font-bold text-primary-500">+{today}</p>
      </div>
    </div>
  );
}

export default React.memo(StatsBanner);
