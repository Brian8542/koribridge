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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B18]/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-apple-lg shadow-modal p-6 w-full max-w-sm border border-[#E5DED2]/40">
        <p className="text-[16px] font-bold text-[#1E1B18]">{message}</p>
        {description && <p className="mt-1.5 text-[14px] text-[#8A837B] leading-relaxed">{description}</p>}
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full bg-[#F3EEE6] text-[#1E1B18] text-[14px] font-semibold hover:bg-[#F3EEE6] transition-colors"
          >
            {resolvedCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-full text-white text-[14px] font-semibold transition-colors ${
              danger ? "bg-[#C4402E] hover:bg-[#A83525]" : "bg-[#4A1D3F] hover:bg-[#3B1732]"
            }`}
          >
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
