import React from "react";

export default function StatsBanner({ onlineCount, total, today }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-red-600 rounded-3xl p-4 text-white text-center shadow-lg shadow-red-100">
        <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider mb-1">Online</p>
        <p className="text-xl font-black">{onlineCount}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-4 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total</p>
        <p className="text-xl font-black text-gray-900">{total}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-4 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Today</p>
        <p className="text-xl font-black text-red-600">+{today}</p>
      </div>
    </div>
  );
}
