import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "./Toast";
import ConfirmModal from "./ConfirmModal";
import { useLocale } from "../hooks/useLocale";

export default function BlockButton({ targetId, onBlockSuccess }) {
  const { showToast } = useToast();
  const { t } = useLocale();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBlockConfirm = async () => {
    setShowConfirm(false);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: targetId });
    if (error) {
      showToast(t.blockErrorMsg, "error");
    } else {
      showToast(t.blockSuccessMsg, "success");
      onBlockSuccess?.();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-neutral-500 border border-neutral-200 bg-surface-bg hover:bg-surface-muted rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        {t.blockBtn}
      </button>
      {showConfirm && (
        <ConfirmModal
          message={t.blockConfirmStandalone}
          description={t.blockDescription}
          confirmLabel={t.blockBtn}
          onConfirm={handleBlockConfirm}
          onCancel={() => setShowConfirm(false)}
          danger
        />
      )}
    </>
  );
}
