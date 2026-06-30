import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { useLocale } from "../hooks/useLocale";
import { getMatchScore } from "../utils/matching";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { COMMUNICATION_STYLES, CONVERSATION_GOALS, getProfileOptionLabel } from "../utils/profileOptions";
import { formatRelativeTime } from "../utils/formatters";
import ReportModal from "../components/ReportModal";
import BlockButton from "../components/BlockButton";

const LEVEL_STYLE = {
  고급: "badge-level-고급",
  중급: "badge-level-중급",
  초급: "badge-level-초급",
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
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-neutral-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400 font-medium">{t.profileLoading}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bg px-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-card border border-neutral-150">
          <p className="text-primary-500 font-semibold">{error || t.profileNotFound}</p>
          <button onClick={() => navigate(-1)} className="mt-6 btn-secondary">{t.back}</button>
        </div>
      </div>
    );
  }

  const level = profile.language_level || "초급";
  const isOnline = onlineIds.has(profile.id);
  const match = getMatchScore(myProfile, profile);
  const matchPercentage = match.percentage;
  const lastActive = formatRelativeTime(profile.last_seen_at || profile.updated_at || profile.created_at);
  const commonInterests = (myProfile?.interests || []).filter((i) => (profile.interests || []).includes(i));
  const goalLabel = getProfileOptionLabel(CONVERSATION_GOALS, profile.conversation_goal);
  const styleLabel = getProfileOptionLabel(COMMUNICATION_STYLES, profile.communication_style);

  return (
    <div className="min-h-screen bg-surface-bg pb-10">
      <Helmet><title>KoriBridge - {profile.display_name || t.tabProfile}</title></Helmet>

      {/* 헤더 */}
      <div className="bg-white border-b border-neutral-150 shadow-nav px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-900 transition p-1 -ml-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-sm font-bold text-neutral-900">{t.tabProfile}</p>
        <button onClick={() => setIsReportOpen(true)} className="text-neutral-400 hover:text-neutral-700 p-1 transition" title={t.reportUser}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">

        {/* 신뢰 배지 행 — 아바타보다 먼저 표시 */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
            profile.is_verified
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-neutral-100 text-neutral-400 border border-neutral-150"
          }`}>
            {profile.is_verified ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            )}
            {profile.is_verified ? t.verifiedUser : t.trustBadgeUnverified}
          </div>
          <span className={`badge border text-xs ${LEVEL_STYLE[level] || "badge"}`}>
            {levelLabel(level)}
          </span>
          {matchPercentage > 0 && (
            <span className="badge bg-primary-50 text-primary-600 border border-primary-100 text-xs">
              {t.matchLabel} {matchPercentage}{t.matchSuffix}
            </span>
          )}
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-6 text-center">
          <div className="relative inline-block">
            {isRealAvatar(profile.avatar_url) ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getAvatarGradient(profile.avatar_url, profile.id)} flex items-center justify-center text-4xl font-bold text-white`}>
                {profile.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-xs ${isOnline ? "bg-emerald-500" : "bg-neutral-300"}`} />
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <h1 className="text-xl font-extrabold text-neutral-900">{profile.display_name}</h1>
            {profile.is_verified && (
              <span className="bg-emerald-500 text-white p-1 rounded-full" title={t.verifiedUser}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </span>
            )}
          </div>
          <p className="text-neutral-500 text-sm mt-0.5">{profile.nationality}</p>
          <p className={`text-xs mt-1 font-semibold ${isOnline ? "text-emerald-600" : "text-neutral-400"}`}>
            {isOnline ? t.onlineNow : lastActive}
          </p>

          {/* Profile completeness chips */}
          <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
            {profile.bio && profile.bio.trim().length >= 20 && (
              <span className="text-[11px] bg-surface-muted text-neutral-500 border border-neutral-100 px-2 py-0.5 rounded-full font-medium">
                {t.profileCompleteBio}
              </span>
            )}
            {isRealAvatar(profile.avatar_url) && (
              <span className="text-[11px] bg-surface-muted text-neutral-500 border border-neutral-100 px-2 py-0.5 rounded-full font-medium">
                {t.profileCompletePhoto}
              </span>
            )}
            {profile.interests?.length > 0 && (
              <span className="text-[11px] bg-surface-muted text-neutral-500 border border-neutral-100 px-2 py-0.5 rounded-full font-medium">
                {t.profileCompleteInterests}
              </span>
            )}
          </div>
        </div>

        {/* 언어 정보 */}
        <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-bg rounded-xl p-3.5">
              <p className="text-xs text-neutral-400 mb-1 font-semibold">{t.nativeLangLabel}</p>
              <p className="text-sm font-bold text-neutral-800">{profile.native_language}</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-3.5">
              <p className="text-xs text-neutral-400 mb-1 font-semibold">{t.learningLangLabel}</p>
              <p className="text-sm font-bold text-primary-700">{profile.learning_language}</p>
            </div>
          </div>

          {matchPercentage > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-500 font-semibold">{t.matchScoreLabel}</span>
                <span className="text-primary-600 font-extrabold">{matchPercentage}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-700"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
              {match.reasons?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.reasons.slice(0, 3).map((reason) => (
                    <span key={reason} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl font-bold">
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {(goalLabel || styleLabel || profile.opening_question) && (
          <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-5 space-y-3">
            {(goalLabel || styleLabel) && (
              <div className="flex flex-wrap gap-2">
                {goalLabel && (
                  <span className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-xl font-bold">
                    {goalLabel}
                  </span>
                )}
                {styleLabel && (
                  <span className="text-xs bg-surface-bg text-neutral-600 border border-neutral-200 px-3 py-1.5 rounded-xl font-bold">
                    {styleLabel}
                  </span>
                )}
              </div>
            )}
            {profile.opening_question && (
              <div className="rounded-xl bg-surface-bg border border-neutral-150 p-4">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Opening Question</p>
                <p className="text-sm text-neutral-800 font-semibold mt-1">{profile.opening_question}</p>
              </div>
            )}
          </div>
        )}

        {profile.interests?.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-5">
            <p className="section-label mb-3">{t.interestsLabel}</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    commonInterests.includes(interest)
                      ? "bg-primary-500 text-white"
                      : "bg-surface-muted text-neutral-600"
                  }`}
                >
                  #{interest}
                </span>
              ))}
            </div>
            {commonInterests.length > 0 && (
              <div className="mt-3 p-3 bg-primary-50 rounded-xl flex items-center gap-2.5 border border-primary-100">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <p className="text-xs text-primary-800 font-medium">
                  <span className="font-bold">{profile.display_name}</span>{t.commonInterestsNimwa}{" "}
                  <span className="text-primary-600 font-bold">{commonInterests.length}</span>
                  {t.commonInterestsSuffix}
                </p>
              </div>
            )}
          </div>
        )}

        {profile.bio && (
          <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-5">
            <p className="section-label mb-2">{t.bioLabel}</p>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        <button
          onClick={() => navigate(`/chat/${profile.id}`)}
          className="btn-primary w-full py-4 text-base font-extrabold flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          {t.startChat}
        </button>

        <div className="pt-3 border-t border-neutral-150 flex flex-col gap-3">
          <button
            onClick={() => setIsReportOpen(true)}
            className="w-full py-2 text-sm font-semibold text-neutral-400 hover:text-primary-500 transition-colors"
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
