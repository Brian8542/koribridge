import React from "react";

export default function PageSpinner({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        {label && <p className="text-sm text-gray-400 font-medium">{label}</p>}
      </div>
    </div>
  );
}
