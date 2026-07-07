import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { normalizePrompts, getPromptLabel } from "../utils/prompts";
import { useLocale } from "../hooks/useLocale";

const HeartIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

function SwipeCard({ profile, score, reasons = [], onSwipeLeft, onSwipeRight }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const { t, levelLabel, locale } = useLocale();
  const prompts = normalizePrompts(profile.prompts);
  const firstPrompt = prompts[0];

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 120) onSwipeRight({ type: "profile" });
    else if (info.offset.x < -120) onSwipeLeft();
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-sm bg-white rounded-[24px] shadow-card-lg overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <div className="flex flex-col max-h-[72vh]">
        {/* 사진 — 카드의 대부분을 차지 */}
        <div className="relative aspect-[4/5] bg-[#F3EEE6] overflow-hidden flex-shrink-0">
          {isRealAvatar(profile.avatar_url) ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || ""}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-7xl text-white font-display ${getAvatarGradient(profile.avatar_url, profile.id)}`}>
              {profile.display_name?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="absolute top-4 inset-x-4 flex justify-between items-start">
            <div className="bg-[#FAF7F2]/95 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="text-xs font-bold text-[#4A1D3F]">{score}% {t.matchingLabel}</span>
            </div>
            {profile.is_verified && (
              <div className="bg-[#5B8A72] text-white p-1.5 rounded-full shadow-xs" title={t.verifiedUser}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* 이름 오버레이 */}
          <div className="absolute bottom-0 inset-x-0 bg-[#1E1B18]/45 px-5 pt-8 pb-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-[26px] text-white leading-tight truncate">{profile.display_name}</h3>
                <p className="text-[13px] text-white/85 mt-0.5">
                  {profile.nationality} · {profile.native_language} → {profile.learning_language} · {levelLabel(profile.language_level || "초급")}
                </p>
              </div>
              <button
                type="button"
                aria-label={t.likePhotoBtn}
                onClick={() => onSwipeRight({ type: "photo" })}
                className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#E8604C] flex items-center justify-center shadow-card flex-shrink-0 hover:scale-105 active:scale-[0.95] transition-transform duration-200"
              >
                <HeartIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Hinge식 프롬프트 카드 */}
        {firstPrompt ? (
          <div className="p-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A837B]">
                {getPromptLabel(firstPrompt.id, locale)}
              </p>
              <p className="font-display text-[18px] text-[#1E1B18] mt-1.5 leading-snug line-clamp-3">
                {firstPrompt.answer}
              </p>
            </div>
            <button
              type="button"
              aria-label={t.likePromptBtn}
              onClick={() => onSwipeRight({ type: "prompt", prompt_id: firstPrompt.id, answer: firstPrompt.answer.slice(0, 120) })}
              className="w-11 h-11 rounded-full border border-[#E5DED2] text-[#E8604C] flex items-center justify-center flex-shrink-0 hover:bg-[#FBEAE6] hover:border-[#E8604C]/40 active:scale-[0.95] transition-all duration-200"
            >
              <HeartIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="p-5">
            {reasons.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {reasons.slice(0, 2).map((reason) => (
                  <span key={reason} className="text-[11px] bg-[#EDF3EF] text-[#40664F] px-2.5 py-1 rounded-full font-semibold">
                    {reason}
                  </span>
                ))}
              </div>
            ) : profile.bio ? (
              <p className="text-[14px] text-[#57514A] leading-relaxed line-clamp-2">{profile.bio}</p>
            ) : (
              <p className="text-[13px] text-[#B3AB9F]">{profile.opening_question || ""}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default React.memo(SwipeCard);
