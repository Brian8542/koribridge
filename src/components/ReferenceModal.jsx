import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import { useLocale } from "../hooks/useLocale";

const MAX_LEN = 500;

export default function ReferenceModal({ targetId, existingRef, onClose, onSaved }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLocale();

  const [rating, setRating] = useState(existingRef?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [content, setContent] = useState(existingRef?.content ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!existingRef;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!rating) { showToast(t.refRatingRequired, "error"); return; }
    setSubmitting(true);
    try {
      const payload = {
        author_id: user.id,
        target_id: targetId,
        rating,
        content: content.trim().slice(0, MAX_LEN) || null,
      };
      const { error } = await supabase
        .from("user_references")
        .upsert(payload, { onConflict: "author_id,target_id" });
      if (error) throw error;
      showToast(isEditing ? t.refUpdated : t.refSuccess, "success");
      onSaved();
      onClose();
    } catch {
      showToast(isEditing ? t.refUpdateFailed : t.refFailed, "error");
    } finally {
      setSubmitting(false);
    }
  }, [rating, content, user, targetId, isEditing, showToast, t, onSaved, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-[#1d1d1f]/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-apple-lg border border-[#d2d2d7]/40 shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#d2d2d7]/40">
          <h2 className="text-[17px] font-bold text-[#1d1d1f]">
            {isEditing ? t.refModalEditTitle : t.refModalTitle}
          </h2>
          <button onClick={onClose} className="text-[#86868b] hover:text-[#1d1d1f] transition p-1 -mr-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-[13px] font-semibold text-[#1d1d1f] mb-3">{t.refRatingLabel}</p>
            <div className="flex gap-1.5" onMouseLeave={() => setHovered(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${star}점`}
                >
                  <svg
                    className={`w-9 h-9 transition-colors ${
                      star <= (hovered || rating) ? "text-amber-400" : "text-[#d2d2d7]"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold text-[#1d1d1f]">{t.refSectionTitle}</p>
              <span className={`text-[11px] font-medium ${content.length > MAX_LEN ? "text-[#ff3b30]" : "text-[#86868b]"}`}>
                {content.length} / {MAX_LEN}
              </span>
            </div>
            <textarea
              className="input-field w-full h-28 resize-none text-[14px] leading-relaxed"
              placeholder={t.refContentPlaceholder}
              maxLength={MAX_LEN}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-semibold hover:bg-[#e8e8ed] transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !rating}
            className="flex-1 py-3 rounded-full bg-[#0071e3] text-white text-[14px] font-semibold hover:bg-[#0077ed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t.refSubmitting : isEditing ? t.refUpdateBtn : t.refSubmitBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
