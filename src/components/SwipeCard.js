import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { CONVERSATION_GOALS, getProfileOptionLabel } from "../utils/profileOptions";

export default function SwipeCard({ profile, score, onSwipeLeft, onSwipeRight }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const goalLabel = getProfileOptionLabel(CONVERSATION_GOALS, profile.conversation_goal);

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 120) onSwipeRight();
    else if (info.offset.x < -120) onSwipeLeft();
  };

  return (
    <motion.div style={{ x, rotate, opacity }} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleDragEnd} className="absolute w-full max-w-sm aspect-[3/4] bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-100">
      <div className="relative h-full flex flex-col">
        <div className="flex-1 bg-gray-200 relative overflow-hidden">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl text-gray-400 bg-gray-100">
              {profile.display_name?.[0]?.toUpperCase()}
            </div>
          )}
          
          {/* 매칭 점수 & 인증 배지 */}
          <div className="absolute top-4 inset-x-4 flex justify-between items-start">
            <div className="bg-white/90 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-800">{score}% Match</span>
            </div>
            {profile.is_verified && (
              <div className="bg-blue-500 text-white p-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-2">
            <h3 className="text-2xl font-black">{profile.display_name}</h3>
            <span className="text-gray-500">{profile.nationality}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-lg">
              {profile.learning_language}
            </span>
            {goalLabel && (
              <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                {goalLabel}
              </span>
            )}
          </div>
          {profile.opening_question && (
            <div className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Opening Question</p>
              <p className="text-sm text-gray-700 font-semibold line-clamp-2">{profile.opening_question}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
