import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { useLocale } from "../hooks/useLocale";
import { getLanguageLevel } from "../utils/languageLevel";
import { getMatchScore } from "../utils/matching";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { COMMUNICATION_STYLES, CONVERSATION_GOALS, getProfileOptionLabel } from "../utils/profileOptions";
import { formatRelativeTime } from "../utils/formatters";
import ReportModal from "../components/ReportModal";
import BlockButton from "../components/BlockButton";

const LEVEL_STYLE = {
  고급: "bg-blue-500 text-white",
  중급: "bg-amber-500 text-white",
  초급: "bg-emerald-500 text-white",
};

export default function ProfileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile: myProfile } = useAuth();
  const onlineIds = useOnlineUsers(user?.id);
  const { t, levelLabel } = useLocale();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error: fetchError } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (fetchError) {
        setError(t.profileFetchError);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };
    load();
  }, [id, user, t.profileFetchError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">{t.profileLoading}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="card p-8 max-w-md w-full text-center shadow-md">
          <p className="text-red-600 font-semibold">{error || t.profileNotFound}</p>
          <button onClick={() => navigate(-1)} className="mt-6 btn-secondary">{t.back}</button>
        </div>
      </div>
    );
  }

  const level = getLanguageLevel(profile);
  const isOnline = onlineIds.has(profile.id);
  const match = getMatchScore(myProfile, profile);
  const matchPercentage = match.percentage;
  const lastActive = formatRelativeTime(profile.updated_at || profile.created_at);
  const commonInterests = (myProfile?.interests || []).filter((i) => (profile.interests || []).includes(i));
  const goalLabel = getProfileOptionLabel(CONVERSATION_GOALS, profile.conversation_goal);
  const styleLabel = getProfileOptionLabel(COMMUNICATION_STYLES, profile.communication_style);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Helmet><title>KoriBridge - {profile.display_name || t.tabProfile}</title></Helmet>

      <div className="relative bg-gradient-to-br from-red-600 via-rose-500 to-pink-400 px-6 pt-14 pb-20 overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white/80 hover:text-white text-sm font-semibold transition z-10"
        >
          {t.backBtn}
        </button>
        <button
          onClick={() => setIsReportOpen(true)}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-sm transition z-10"
        >
          {t.reportUser}
        </button>

        <div className="relative z-10">
          <div className="relative inline-block">
            {isRealAvatar(profile.avatar_url) ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-28 h-28 rounded-3xl object-cover border-4 border-white/30 shadow-2xl"
              />
            ) : (
              <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${getAvatarGradient(profile.avatar_url, profile.id)} border-4 border-white/30 flex items-center justify-center text-5xl font-bold text-white shadow-2xl`}>
                {profile.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white shadow ${
                isOnline ? "bg-emerald-400" : "bg-gray-300"
              }`}
            />
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <h1 className="text-2xl font-extrabold text-white">{profile.display_name}</h1>
            {profile.is_verified && (
              <span className="bg-blue-500 text-white p-1 rounded-full shadow-md" title={t.verifiedUser}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
              </span>
            )}
          </div>
          <p className="text-white/70 text-sm mt-0.5">{profile.nationality}</p>
          <p className={`text-sm mt-1 font-semibold ${isOnline ? "text-emerald-300" : "text-white/50"}`}>
            {isOnline ? t.onlineNow : lastActive}
          </p>

          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${LEVEL_STYLE[level] || "bg-white/20 text-white"}`}>
              {levelLabel(level)}
            </span>
            {matchPercentage > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-red-600 shadow-sm">
                {t.matchLabel} {matchPercentage}{t.matchSuffix}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 max-w-lg mx-auto space-y-4">

        <div className="card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3.5">
              <p className="text-xs text-gray-400 mb-1 font-medium">{t.nativeLangLabel}</p>
              <p className="text-sm font-bold text-gray-800">{profile.native_language}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-3.5">
              <p className="text-xs text-gray-400 mb-1 font-medium">{t.learningLangLabel}</p>
              <p className="text-sm font-bold text-red-700">{profile.learning_language}</p>
            </div>
          </div>

          {matchPercentage > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-semibold">{t.matchScoreLabel}</span>
                <span className="text-red-600 font-extrabold">{matchPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
              {match.reasons?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.reasons.slice(0, 3).map((reason) => (
                    <span
                      key={reason}
                      className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-bold"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {(goalLabel || styleLabel || profile.opening_question) && (
          <div className="card p-5 space-y-3">
            {(goalLabel || styleLabel) && (
              <div className="flex flex-wrap gap-2">
                {goalLabel && (
                  <span className="text-xs bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl font-bold">
                    {goalLabel}
                  </span>
                )}
                {styleLabel && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl font-bold">
                    {styleLabel}
                  </span>
                )}
              </div>
            )}
            {profile.opening_question && (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Opening Question</p>
                <p className="text-sm text-gray-800 font-semibold mt-1">{profile.opening_question}</p>
              </div>
            )}
          </div>
        )}

        {profile.interests?.length > 0 && (
          <div className="card p-5">
            <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">{t.interestsLabel}</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    commonInterests.includes(interest)
                      ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  #{interest}
                </span>
              ))}
            </div>
            {commonInterests.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 rounded-2xl flex items-center gap-2">
                <span className="text-base">✨</span>
                <p className="text-xs text-red-800 font-medium">
                  <span className="font-bold">{profile.display_name}</span>{" "}
                  {t.commonInterestsSuffix.startsWith(" ") ? "" : "님과 "}
                  <span className="text-red-600 font-bold">{commonInterests.length}</span>
                  {t.commonInterestsSuffix}
                </p>
              </div>
            )}
          </div>
        )}

        {profile.bio && (
          <div className="card p-5">
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">{t.bioLabel}</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        <button
          onClick={() => navigate(`/chat/${profile.id}`)}
          className="btn-primary w-full py-4 text-base font-extrabold shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>💬</span>
          {t.startChat}
        </button>

        <div className="pt-4 border-t flex flex-col gap-3">
          <button 
            onClick={() => setIsReportOpen(true)}
            className="w-full py-2 text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
          >
            {t.reportUser}
          </button>
          <BlockButton targetId={profile.id} onBlockSuccess={() => navigate("/home")} />
        </div>
      </div>

      {isReportOpen && (
        <ReportModal
          targetId={profile.id}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
}
