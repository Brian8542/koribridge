import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../hooks/useLocale";

export default function DeleteAccountModal({ onClose }) {
  const { user, signOut } = useAuth();
  const { t } = useLocale();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirm !== t.deleteConfirmKeyword) {
      setError(t.deleteConfirmErr);
      return;
    }
    setLoading(true);
    try {
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.storage.from("avatars").remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`]);
      await signOut();
    } catch {
      setError(t.deleteError);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d1f]/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-apple-lg shadow-modal p-6 w-full max-w-sm border border-[#d2d2d7]/40">
        <h3 className="text-[16px] font-bold text-[#1d1d1f] mb-1">{t.deleteAccount}</h3>
        <p className="text-[14px] text-[#86868b] mb-4 leading-relaxed">{t.deleteDesc}</p>
        <p className="text-[13px] font-semibold text-[#1d1d1f] mb-2">
          {t.deleteConfirmPre} <span className="text-[#ff3b30]">{t.deleteConfirmKeyword}</span> {t.deleteConfirmPost}
        </p>
        <input
          type="text"
          className="input-field text-[13px]"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t.deleteConfirmKeyword}
        />
        {error && <p className="mt-2 text-[12px] text-[#ff3b30]">{error}</p>}
        <div className="mt-4 flex gap-2.5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[13px] font-semibold hover:bg-[#e8e8ed] transition-colors">
            {t.cancel}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-full bg-[#ff3b30] hover:bg-[#e0352a] text-white text-[13px] font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? t.deleting : t.deleteBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
