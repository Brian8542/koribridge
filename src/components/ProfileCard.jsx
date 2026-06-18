import React from "react";
import { useNavigate } from "react-router-dom";
import { getMatchScore } from "../utils/matching";
import { useLocale } from "../hooks/useLocale";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { COMMUNICATION_STYLES, CONVERSATION_GOALS, getProfileOptionLabel } from "../utils/profileOptions";

const LEVEL_STYLE = {
  고급: "bg-blue-100 text-blue-700",
  중급: "bg-amber-100 text-amber-700",
  초급: "bg-emerald-100 text-emerald-700",
};

function ProfileCard({
  profile,
  showActions = true,
  myProfile,
  isOnline,
  isFavorite,
  onToggleFavorite,
  onReport,
}) {
  const navigate = useNavigate();
  const { t, levelLabel } = useLocale();
  const level = profile.language_level || "초급";
  const match = getMatchScore(myProfile, profile);
  const goalLabel = getProfileOptionLabel(CONVERSATION_GOALS, profile.conversation_goal);
  const styleLabel = getProfileOptionLabel(COMMUNICATION_STYLES, profile.communication_style);
  const commonInterests = (myProfile?.interests || []).filter((i) =>
    (profile.interests || []).includes(i)
  );

  return (
    <div className="card p-0 overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl group">
      <div className="h-1 bg-gradient-to-r from-red-600 to-rose-400" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {isRealAvatar(profile.avatar_url) ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                loading="lazy"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-red-100 transition-all"
              />
            ) : (
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarGradient(profile.avatar_url, profile.id)} flex items-center justify-center text-3xl text-white font-black shadow-md`}>
                {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                isOnline ? "bg-emerald-400" : "bg-gray-300"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0 flex items-center gap-1.5">
                <p className="text-base font-extrabold text-gray-900 truncate">{profile.display_name}</p>
                {profile.is_verified && (
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleFavorite?.(profile)}
                  className={`rounded-full w-10 h-10 flex items-center justify-center transition-all duration-150 ${
                    isFavorite
                      ? "text-red-500 bg-red-50"
                      : "text-gray-300 hover:text-red-400 hover:bg-red-50"
                  }`}
                  title={isFavorite ? t.favRemove : t.favAdd}
                >
                  {isFavorite ? "♥" : "♡"}
                </button>
                {showActions && (
                  <button
                    type="button"
                    onClick={() => onReport?.(profile.id, profile.display_name)}
                    className="text-gray-300 hover:text-gray-500 hover:bg-gray-50 text-lg leading-none rounded-full w-10 h-10 flex items-center justify-center"
                    title={t.reportBlockTitle}
                  >
                    ⋯
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${LEVEL_STYLE[level] || LEVEL_STYLE["초급"]}`}>
                {levelLabel(level)}
              </span>
              <span className="text-xs bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                {t.matchingLabel} {match.percentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex gap-3 text-xs">
            <span className="text-gray-400 w-14 flex-shrink-0">{t.nativeLangShort}</span>
            <span className="font-semibold text-gray-800">{profile.native_language}</span>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-gray-400 w-14 flex-shrink-0">{t.learningLangShort}</span>
            <span className="font-semibold text-gray-800">{profile.learning_language}</span>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">{profile.bio}</p>
        )}

        {match.reasons?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {match.reasons.slice(0, 2).map((reason) => (
              <span
                key={reason}
                className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold"
              >
                {reason}
              </span>
            ))}
          </div>
        )}

        {(goalLabel || styleLabel) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {goalLabel && (
              <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                {goalLabel}
              </span>
            )}
            {styleLabel && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                {styleLabel}
              </span>
            )}
          </div>
        )}

        {profile.opening_question && (
          <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Opening Question</p>
            <p className="text-xs text-gray-700 font-semibold mt-0.5 line-clamp-2">{profile.opening_question}</p>
          </div>
        )}

        {commonInterests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {commonInterests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold"
              >
                {interest}
              </span>
            ))}
            {commonInterests.length > 3 && (
              <span className="text-[10px] text-gray-400 px-1 py-0.5">+{commonInterests.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 px-5 pb-5">
        <button
          type="button"
          onClick={() => navigate(`/profile/${profile.id}`)}
          className="btn-secondary flex-1 py-2.5 text-sm"
        >
          {t.viewProfile}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/chat/${profile.id}`)}
          className="btn-primary flex-1 py-2.5 text-sm"
        >
          {t.chatBtn}
        </button>
      </div>
    </div>
  );
}

export default React.memo(ProfileCard);
