import React from "react";
import { useNavigate } from "react-router-dom";
import { getMatchScore } from "../utils/matching";
import { useLocale } from "../hooks/useLocale";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { COMMUNICATION_STYLES, CONVERSATION_GOALS, getProfileOptionLabel } from "../utils/profileOptions";

const LEVEL_STYLE = {
  고급: "bg-blue-50 text-blue-700 border-blue-100",
  중급: "bg-amber-50 text-amber-700 border-amber-100",
  초급: "bg-emerald-50 text-emerald-700 border-emerald-100",
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
    <div className="bg-white rounded-2xl border border-neutral-150 shadow-card overflow-hidden transition-all duration-200 hover:shadow-card-md hover:-translate-y-0.5 group flex flex-col">
      {/* Top accent */}
      <div className="h-0.5 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="p-5 flex-1">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {isRealAvatar(profile.avatar_url) ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                loading="lazy"
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getAvatarGradient(profile.avatar_url, profile.id)} flex items-center justify-center text-xl text-white font-bold`}>
                {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                isOnline ? "bg-emerald-500" : "bg-neutral-300"
              }`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0 flex items-center gap-1.5">
                <p className="text-sm font-bold text-neutral-900 truncate">{profile.display_name}</p>
                {profile.is_verified && (
                  <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleFavorite?.(profile)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                    isFavorite
                      ? "text-primary-500 bg-primary-50"
                      : "text-neutral-300 hover:text-primary-400 hover:bg-primary-50"
                  }`}
                  title={isFavorite ? t.favRemove : t.favAdd}
                >
                  {isFavorite ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  )}
                </button>
                {showActions && (
                  <button
                    type="button"
                    onClick={() => onReport?.(profile.id, profile.display_name)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-neutral-500 hover:bg-neutral-50 transition-all duration-150"
                    title={t.reportBlockTitle}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={`badge border text-[11px] ${LEVEL_STYLE[level] || LEVEL_STYLE["초급"]}`}>
                {levelLabel(level)}
              </span>
              <span className="badge bg-primary-50 text-primary-600 border border-primary-100 text-[11px]">
                {t.matchingLabel} {match.percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Language info */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-surface-bg rounded-lg px-3 py-2">
            <p className="text-xs text-neutral-400 leading-none mb-0.5">{t.nativeLangShort}</p>
            <p className="text-xs font-semibold text-neutral-700 truncate">{profile.native_language}</p>
          </div>
          <div className="bg-surface-bg rounded-lg px-3 py-2">
            <p className="text-xs text-neutral-400 leading-none mb-0.5">{t.learningLangShort}</p>
            <p className="text-xs font-semibold text-primary-600 truncate">{profile.learning_language}</p>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-3 text-xs text-neutral-500 line-clamp-2 leading-relaxed">{profile.bio}</p>
        )}

        {match.reasons?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {match.reasons.slice(0, 2).map((reason) => (
              <span
                key={reason}
                className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md font-medium"
              >
                {reason}
              </span>
            ))}
          </div>
        )}

        {(goalLabel || styleLabel) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {goalLabel && (
              <span className="text-[11px] bg-surface-muted text-neutral-500 px-2 py-0.5 rounded-md font-medium">
                {goalLabel}
              </span>
            )}
            {styleLabel && (
              <span className="text-[11px] bg-surface-muted text-neutral-500 px-2 py-0.5 rounded-md font-medium">
                {styleLabel}
              </span>
            )}
          </div>
        )}

        {commonInterests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {commonInterests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="text-[11px] bg-primary-50 text-primary-600 border border-primary-100 px-2 py-0.5 rounded-md font-medium"
              >
                {interest}
              </span>
            ))}
            {commonInterests.length > 3 && (
              <span className="text-[11px] text-neutral-400 px-1 py-0.5">+{commonInterests.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 pb-5">
        <button
          type="button"
          onClick={() => navigate(`/profile/${profile.id}`)}
          className="btn-secondary flex-1 py-2.5 text-xs"
        >
          {t.viewProfile}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/chat/${profile.id}`)}
          className="btn-primary flex-1 py-2.5 text-xs"
        >
          {t.chatBtn}
        </button>
      </div>
    </div>
  );
}

export default React.memo(ProfileCard);
