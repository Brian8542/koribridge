import React from "react";

export default function PageSpinner({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-neutral-200 border-t-primary-500 rounded-full animate-spin" />
        {label && <p className="text-sm text-neutral-400 font-medium">{label}</p>}
      </div>
    </div>
  );
}
