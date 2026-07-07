import React, { useCallback, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "./Toast";
import { useLocale } from "../hooks/useLocale";

export const MAX_PHOTOS = 6;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function PhotoManager({ userId, photos, onChange }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast(t.errAvatarType, "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast(t.errAvatarSize, "error");
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      showToast(t.photosMaxReached, "error");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/gallery-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      onChange([...photos, data.publicUrl]);
    } catch {
      showToast(t.photosUploadFailed, "error");
    } finally {
      setUploading(false);
    }
  }, [userId, photos, onChange, showToast, t.errAvatarType, t.errAvatarSize, t.photosMaxReached, t.photosUploadFailed]);

  const handleRemove = useCallback((url) => {
    onChange(photos.filter((p) => p !== url));
    const marker = "/avatars/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      supabase.storage.from("avatars").remove([url.slice(idx + marker.length)]).then(() => {});
    }
  }, [photos, onChange]);

  return (
    <div className="space-y-3">
      <div>
        <p className="font-display text-[17px] text-[#1E1B18]">{t.photosSectionTitle}</p>
        <p className="text-[12px] text-[#8A837B] mt-0.5 leading-relaxed">{t.photosSectionDesc}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-[14px] overflow-hidden bg-[#F3EEE6] group">
            <img src={url} alt={`${t.photosSectionTitle} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#4A1D3F] text-[#FAF7F2]">
                {t.photosMainBadge}
              </span>
            )}
            <button
              type="button"
              onClick={() => handleRemove(url)}
              aria-label={t.photosDeleteLabel}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#1E1B18]/60 text-white flex items-center justify-center hover:bg-[#C4402E] transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label={t.photosAddBtn}
            className="aspect-square rounded-[14px] border border-dashed border-[#4A1D3F]/30 flex flex-col items-center justify-center gap-1 text-[#4A1D3F] hover:bg-[#F1E9EE] transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[#E5DED2] border-t-[#4A1D3F] rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[10px] font-semibold">{t.photosAddBtn}</span>
              </>
            )}
          </button>
        )}
      </div>
      <p className="text-[11px] text-[#B3AB9F]">{photos.length}/{MAX_PHOTOS} · {t.avatarLimit}</p>
      <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleSelect} />
    </div>
  );
}

export default React.memo(PhotoManager);
