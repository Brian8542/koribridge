import React from "react";

export default function ConfirmModal({
  message,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
  danger = false,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-modal p-6 w-full max-w-sm border border-neutral-100">
        <p className="text-base font-bold text-neutral-900">{message}</p>
        {description && <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">{description}</p>}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-surface-muted border border-neutral-200 text-neutral-600 text-sm font-semibold hover:bg-neutral-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
              danger ? "bg-primary-500 hover:bg-primary-600" : "bg-neutral-900 hover:bg-neutral-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
