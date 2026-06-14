import React from "react";
import { useNavigate } from "react-router-dom";
import { getMatchScore } from "../utils/matching";

const LEVEL_COLOR = {
  고급: "bg-blue-50 text-blue-700",
  중급: "bg-yellow-50 text-yellow-700",
  초급: "bg-green-50 text-green-700",
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
    <div className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute -top-2 -left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            매칭 {match.percentage}%
          </div>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              loading="lazy"
              className="w-16 h-16 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-2xl text-red-600 border border-gray-200 font-bold">
              {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <span
            className={`absolute -bottom-0.5 right-0 h-4 w-4 rounded-full border-2 border-white ${
              isOnline ? "bg-emerald-400" : "bg-gray-300"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-lg font-bold text-gray-900 truncate">{profile.display_name}</p>
              <p className="text-sm text-gray-500">{profile.nationality}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleFavorite?.(profile)}
                className={`rounded-full p-2 ${
                  isFavorite ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              >
                {isFavorite ? "♥" : "♡"}
              </button>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLOR[level] || LEVEL_COLOR["초급"]}`}>
                {level}
              </span>
              {showActions && (
                <button
                  type="button"
                  onClick={() => onReport?.(profile.id, profile.display_name)}
                  className="text-gray-300 hover:text-gray-500 text-lg leading-none"
                  title="신고/차단"
                >
                  ⋯
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p><strong className="text-gray-800">모국어:</strong> {profile.native_language}</p>
            <p><strong className="text-gray-800">학습언어:</strong> {profile.learning_language}</p>
            {commonInterests.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                공통 관심사: {commonInterests.slice(0, 2).join(", ")}
                {commonInterests.length > 2 && " 등"}
              </p>
            )}
          </div>

          {profile.bio && (
            <p className="mt-3 text-sm text-gray-500 line-clamp-2">{profile.bio}</p>
          )}
          {profile.reason && (
            <p className="mt-2 text-xs text-red-600 font-medium">추천 이유: {profile.reason}</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
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
