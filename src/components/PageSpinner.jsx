import React from "react";

export default function PageSpinner({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#d2d2d7] border-t-[#0071e3] rounded-full animate-spin" />
        {label && <p className="text-[13px] text-[#86868b] font-medium">{label}</p>}
      </div>
    </div>
  );
}
