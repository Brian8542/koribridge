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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{t.deleteAccount}</h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{t.deleteDesc}</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          {t.deleteConfirmPre} <span className="text-red-600">{t.deleteConfirmKeyword}</span> {t.deleteConfirmPost}
        </p>
        <input
          type="text"
          className="input-field text-sm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t.deleteConfirmKeyword}
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold">
            {t.cancel}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {loading ? t.deleting : t.deleteBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
