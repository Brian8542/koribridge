import React from "react";
import { useNavigate } from "react-router-dom";
import { getMatchScore } from "../utils/matching";

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
  const level = profile.language_level || "초급";
  const match = getMatchScore(myProfile, profile);
  const commonInterests = (myProfile?.interests || []).filter((i) =>
    (profile.interests || []).includes(i)
  );

  return (
    <div className="card p-0 overflow-hidden transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl group">
      <div className="h-1 bg-gradient-to-r from-red-600 to-rose-400" />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                loading="lazy"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-red-100 transition-all"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-2xl text-white font-bold shadow-sm">
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
              <div className="min-w-0">
                <p className="text-base font-extrabold text-gray-900 truncate">{profile.display_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{profile.nationality}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleFavorite?.(profile)}
                  className={`rounded-full p-1.5 transition-all duration-150 ${
                    isFavorite
                      ? "text-red-500 bg-red-50"
                      : "text-gray-300 hover:text-red-400 hover:bg-red-50"
                  }`}
                  title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                >
                  {isFavorite ? "♥" : "♡"}
                </button>
                {showActions && (
                  <button
                    type="button"
                    onClick={() => onReport?.(profile.id, profile.display_name)}
                    className="text-gray-300 hover:text-gray-500 text-lg leading-none px-0.5"
                    title="신고/차단"
                  >
                    ⋯
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${LEVEL_STYLE[level] || LEVEL_STYLE["초급"]}`}>
                {level}
              </span>
              <span className="text-xs bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                매칭 {match.percentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex gap-3 text-xs">
            <span className="text-gray-400 w-14 flex-shrink-0">모국어</span>
            <span className="font-semibold text-gray-800">{profile.native_language}</span>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-gray-400 w-14 flex-shrink-0">학습언어</span>
            <span className="font-semibold text-gray-800">{profile.learning_language}</span>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">{profile.bio}</p>
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
          프로필 보기
        </button>
        <button
          type="button"
          onClick={() => navigate(`/chat/${profile.id}`)}
          className="btn-primary flex-1 py-2.5 text-sm"
        >
          채팅하기
        </button>
      </div>
    </div>
  );
}

export default React.memo(ProfileCard);
