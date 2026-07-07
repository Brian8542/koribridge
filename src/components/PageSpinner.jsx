import React from "react";

export default function PageSpinner({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#E5DED2] border-t-[#4A1D3F] rounded-full animate-spin" />
        {label && <p className="text-[13px] text-[#8A837B] font-medium">{label}</p>}
      </div>
    </div>
  );
}
