import React from "react";
import { useLocale } from "../hooks/useLocale";

export default function ConfirmModal({
  message,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = false,
}) {
  const { t } = useLocale();
  const resolvedConfirm = confirmLabel ?? t.confirm;
  const resolvedCancel = cancelLabel ?? t.cancel;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-apple-lg shadow-modal p-6 w-full max-w-sm border border-[#d2d2d7]/40">
        <p className="text-[16px] font-bold text-[#1d1d1f]">{message}</p>
        {description && <p className="mt-1.5 text-[14px] text-[#86868b] leading-relaxed">{description}</p>}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-semibold hover:bg-[#e8e8ed] transition-colors"
          >
            {resolvedCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-full text-white text-[14px] font-semibold transition-colors ${
              danger ? "bg-[#ff3b30] hover:bg-[#e0352a]" : "bg-[#0071e3] hover:bg-[#0077ed]"
            }`}
          >
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
