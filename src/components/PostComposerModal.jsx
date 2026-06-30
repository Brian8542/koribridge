import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocale } from "../hooks/useLocale";
import { useToast } from "./Toast";
import { supabase } from "../lib/supabase";

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어", "일본어", "기타",
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_CHARS = 500;
const MAX_IMG_BYTES = 5 * 1024 * 1024;

function PostComposerModal({ currentUser, onClose, onPosted }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const [content, setContent] = useState("");
  const [language, setLanguage] = useState(currentUser?.learning_language || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast(t.communityImgTypeErr, "error");
      return;
    }
    if (file.size > MAX_IMG_BYTES) {
      showToast(t.communityImgTooBig, "error");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, [showToast, t]);

  const removeImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) { showToast(t.communityContentRequired, "error"); return; }
    if (trimmed.length > MAX_CHARS) { showToast(t.communityContentTooLong, "error"); return; }
    if (!language) { showToast(t.communityLangRequired, "error"); return; }

    setPosting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${currentUser.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("community-images")
          .upload(path, imageFile, { contentType: imageFile.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("community-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("posts").insert({
        author_id: currentUser.id,
        content: trimmed,
        language,
        image_url: imageUrl,
      });
      if (error) throw error;

      showToast(t.communityPostSuccess, "success");
      onPosted();
      onClose();
    } catch {
      showToast(t.communityPostFailed, "error");
    } finally {
      setPosting(false);
    }
  }, [content, language, imageFile, currentUser, showToast, t, onPosted, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1d1d1f]/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-[28px] sm:rounded-apple-lg w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-xl border border-[#d2d2d7]/40">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#d2d2d7]/40 flex-shrink-0">
          <h2 className="text-[17px] font-bold text-[#1d1d1f]">{t.communityNewPost}</h2>
          <button onClick={onClose} className="text-[#86868b] hover:text-[#1d1d1f] p-1 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Author row */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar_url || `https://api.dicebear.com/8.x/thumbs/svg?seed=${currentUser?.id}`}
              alt=""
              className="w-10 h-10 rounded-full object-cover bg-[#f5f5f7]"
            />
            <span className="text-[14px] font-semibold text-[#1d1d1f]">{currentUser?.display_name}</span>
          </div>

          {/* Text area */}
          <div>
            <textarea
              className="w-full resize-none rounded-[14px] bg-[#f5f5f7] border border-transparent focus:border-[#0071e3] focus:bg-white transition-colors p-3.5 text-[14px] text-[#1d1d1f] placeholder-[#86868b] outline-none"
              rows={5}
              maxLength={MAX_CHARS}
              placeholder={t.communityPostPlaceholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-[12px] font-medium ${content.length >= MAX_CHARS ? "text-[#ff3b30]" : "text-[#86868b]"}`}>
                {content.length}/{MAX_CHARS}{t.communityCharCount}
              </span>
            </div>
          </div>

          {/* Language select */}
          <div>
            <label className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wide block mb-1.5">
              {t.communitySelectLang}
            </label>
            <select
              className="input-field"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">{t.communitySelectLang}</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative rounded-[14px] overflow-hidden">
              <img src={imagePreview} alt="" className="w-full max-h-56 object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 bg-[#1d1d1f]/60 text-white rounded-full flex items-center justify-center hover:bg-[#1d1d1f]/80 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-[#d2d2d7]/40 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2.5 rounded-full bg-[#f5f5f7] text-[#86868b] hover:text-[#0071e3] hover:bg-[#e8f4ff] transition-colors"
            title="사진 첨부"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleImage}
          />
          <button
            onClick={handleSubmit}
            disabled={posting || !content.trim()}
            className="flex-1 py-3 rounded-full bg-[#0071e3] text-white text-[14px] font-semibold hover:bg-[#0077ed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? t.communityPosting : t.communityPostBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PostComposerModal);
