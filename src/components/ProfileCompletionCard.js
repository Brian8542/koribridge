import React from "react";

export default function ProfileCompletionCard({ completion }) {
  if (!completion) return null;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-gray-900">프로필 완성도</p>
          <p className="mt-0.5 text-xs text-gray-400">
            완성도가 높을수록 추천과 첫 대화가 더 쉬워집니다.
          </p>
        </div>
        <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-extrabold text-red-600">
          {completion.percentage}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {completion.items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold ${
              item.done ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"
            }`}
          >
            <span
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] ${
                item.done ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {item.done ? "✓" : ""}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {completion.nextItem && (
        <p className="text-xs font-semibold text-gray-500">
          다음 추천: <span className="text-red-600">{completion.nextItem.label}</span>
        </p>
      )}
    </div>
  );
}
