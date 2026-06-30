import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { CONVERSATION_GOALS, getProfileOptionLabel } from "../utils/profileOptions";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { useLocale } from "../hooks/useLocale";

export default function SwipeCard({ profile, score, reasons = [], onSwipeLeft, onSwipeRight }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const goalLabel = getProfileOptionLabel(CONVERSATION_GOALS, profile.conversation_goal);
  const { t } = useLocale();

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 120) onSwipeRight();
    else if (info.offset.x < -120) onSwipeLeft();
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-sm aspect-[3/4] bg-white rounded-3xl shadow-card-lg overflow-hidden cursor-grab active:cursor-grabbing border border-neutral-150"
    >
      <div className="relative h-full flex flex-col">
        <div className="flex-1 bg-neutral-200 relative overflow-hidden">
          {isRealAvatar(profile.avatar_url) ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-7xl text-white font-black bg-gradient-to-br ${getAvatarGradient(profile.avatar_url, profile.id)}`}>
              {profile.display_name?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="absolute top-4 inset-x-4 flex justify-between items-start">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-neutral-800">{score}% Match</span>
            </div>
            {profile.is_verified && (
              <div className="bg-primary-500 text-white p-1.5 rounded-full shadow-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-xl font-black text-neutral-900">{profile.display_name}</h3>
            <span className="text-sm text-neutral-400">{profile.nationality}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge bg-primary-50 text-primary-700 border border-primary-100">
              {profile.learning_language}
            </span>
            {goalLabel && (
              <span className="badge bg-surface-muted text-neutral-600 border border-neutral-200">
                {goalLabel}
              </span>
            )}
          </div>
          {reasons.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {reasons.slice(0, 2).map((reason) => (
                <span key={reason} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold">
                  {reason}
                </span>
              ))}
            </div>
          )}
          {profile.opening_question && (
            <div className="rounded-xl bg-surface-bg border border-neutral-150 px-3 py-2">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">{t.chatOpeningQuestionLabel}</p>
              <p className="text-sm text-neutral-700 font-semibold line-clamp-2 mt-0.5">{profile.opening_question}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
