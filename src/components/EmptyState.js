import React from "react";

export default function EmptyState({ icon, title, desc, action, actionLabel, secondary, secondaryLabel }) {
  return (
    <div className="card text-center py-16 px-6 col-span-full">
      {icon && <div className="text-5xl mb-4 select-none">{icon}</div>}
      <p className="font-bold text-gray-900 text-lg">{title}</p>
      {desc && <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto">{desc}</p>}
      {action && actionLabel && (
        <div className="mt-5 max-w-[200px] mx-auto">
          <button onClick={action} className="btn-primary text-sm py-2.5">{actionLabel}</button>
        </div>
      )}
      {secondary && secondaryLabel && (
        <button onClick={secondary} className="mt-3 text-sm text-red-600 font-semibold hover:text-red-700 transition-colors">
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
