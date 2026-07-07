import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { useLocale } from "../hooks/useLocale";
import { useToast } from "../components/Toast";
import { getMatchScore } from "../utils/matching";
import { isRealAvatar, getAvatarGradient } from "../utils/avatarUtils";
import { COMMUNICATION_STYLES, CONVERSATION_GOALS, getProfileOptionLabel } from "../utils/profileOptions";
import { formatRelativeTime } from "../utils/formatters";
import ReportModal from "../components/ReportModal";
import BlockButton from "../components/BlockButton";
import ReferenceModal from "../components/ReferenceModal";
import { normalizePrompts, getPromptLabel } from "../utils/prompts";
import { isRecentlyActive } from "../hooks/usePresenceHeartbeat";
import MatchModal from "../components/MatchModal";

const HeartIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

function LikeHeartButton({ onLike, label, className = "" }) {
  if (!onLike) return null;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onLike}
      className={`w-11 h-11 rounded-full bg-[#FAF7F2] text-[#E8604C] flex items-center justify-center shadow-card hover:scale-105 active:scale-[0.95] transition-transform duration-200 ${className}`}
    >
      <HeartIcon className="w-5 h-5" />
    </button>
  );
}

function PromptCard({ prompt, locale, onLike, likeLabel }) {
  return (
    <div className="bg-white rounded-[22px] shadow-card p-6 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A837B]">
          {getPromptLabel(prompt.id, locale)}
        </p>
        <p className="font-display text-[20px] text-[#1E1B18] mt-2 leading-snug whitespace-pre-wrap">
          {prompt.answer}
        </p>
      </div>
      {onLike && (
        <button
          type="button"
          aria-label={likeLabel}
          onClick={onLike}
          className="w-10 h-10 rounded-full border border-[#E5DED2] text-[#E8604C] flex items-center justify-center flex-shrink-0 hover:bg-[#FBEAE6] hover:border-[#E8604C]/40 active:scale-[0.95] transition-all duration-200"
        >
          <HeartIcon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </button>
      )}
    </div>
  );
}

function PhotoCard({ url, index, name, onLike, likeLabel }) {
  return (
    <div className="bg-white rounded-[24px] shadow-card overflow-hidden relative">
      <div className="aspect-[4/5] bg-[#F3EEE6]">
        <img src={url} alt={`${name} 사진 ${index + 1}`} loading="lazy" className="w-full h-full object-cover" />
      </div>
      {onLike && <LikeHeartButton onLike={onLike} label={likeLabel} className="absolute bottom-4 right-4" />}
    </div>
  );
}

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
  const { t, levelLabel, locale } = useLocale();

  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [references, setReferences] = useState([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [myRef, setMyRef] = useState(null);
  const [hasConversation, setHasConversation] = useState(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [meProfile, setMeProfile] = useState(null);

  useEffect(() => {
    if (!user?.id || !id || user.id === id) return;
    supabase.from("favorites").select("id").eq("user_id", user.id).eq("partner_id", id).maybeSingle()
      .then(({ data }) => setHasLiked(!!data));
  }, [user?.id, id]);

  const sendLike = useCallback(async (likedContent) => {
    if (!user?.id || user.id === id) return;
    if (hasLiked) {
      showToast(t.alreadyLiked, "info");
      return;
    }
    const { error: likeError } = await supabase.from("favorites").insert({
      user_id: user.id,
      partner_id: id,
      liked_content: likedContent,
    });
    if (likeError) {
      if (likeError.code === "23505") setHasLiked(true);
      else showToast(t.favAddFailed, "error");
      return;
    }
    setHasLiked(true);
    showToast(t.liked, "success");
    const { data: mutual } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", id)
      .eq("partner_id", user.id)
      .maybeSingle();
    if (mutual) {
      const { data: me } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      setMeProfile(me || { id: user.id });
      setMatchOpen(true);
    }
  }, [user?.id, id, hasLiked, showToast, t.alreadyLiked, t.favAddFailed, t.liked]);

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

  const loadRefs = useCallback(async () => {
    if (!id) return;
    setRefsLoading(true);
    const [{ data: refs }, { data: convCheck }, { data: mine }] = await Promise.all([
      supabase
        .from("user_references")
        .select("id, author_id, rating, content, created_at, author:profiles!author_id(display_name, avatar_url, nationality)")
        .eq("target_id", id)
        .order("created_at", { ascending: false }),
      user
        ? supabase
            .from("messages")
            .select("id")
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
            .limit(1)
        : Promise.resolve({ data: [] }),
      user
        ? supabase
            .from("user_references")
            .select("*")
            .eq("author_id", user.id)
            .eq("target_id", id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setReferences(refs || []);
    setHasConversation((convCheck || []).length > 0);
    setMyRef(mine || null);
    setRefsLoading(false);
  }, [id, user]);

  useEffect(() => { loadRefs(); }, [loadRefs]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#E5DED2] border-t-[#4A1D3F] rounded-full animate-spin" />
          <p className="text-[13px] text-[#8A837B] font-medium">{t.profileLoading}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] px-6">
        <div className="bg-white rounded-apple-lg p-8 max-w-md w-full text-center shadow-card border border-[#E5DED2]/40">
          <p className="text-[#C4402E] font-semibold">{error || t.profileNotFound}</p>
          <button onClick={() => navigate(-1)} className="mt-6 btn-secondary">{t.back}</button>
        </div>
      </div>
    );
  }

  const level = profile.language_level || "초급";
  const isOnline = onlineIds.has(profile.id) || isRecentlyActive(profile.last_seen_at);
  const prompts = normalizePrompts(profile.prompts);
  const photos = Array.isArray(profile.photos) ? profile.photos : [];
  const canLike = user?.id && user.id !== profile.id;
  const match = getMatchScore(myProfile, profile);
  const matchPercentage = match.percentage;
  const lastActive = formatRelativeTime(profile.last_seen_at || profile.updated_at || profile.created_at, locale);
  const commonInterests = (myProfile?.interests || []).filter((i) => (profile.interests || []).includes(i));
  const goalLabel = getProfileOptionLabel(CONVERSATION_GOALS, profile.conversation_goal);
  const styleLabel = getProfileOptionLabel(COMMUNICATION_STYLES, profile.communication_style);

  const avgRating = references.length > 0
    ? references.reduce((sum, r) => sum + r.rating, 0) / references.length
    : 0;
  const isSelf = user?.id === profile.id;
  const canWriteRef = !isSelf && hasConversation;

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-10">
      <Helmet><title>KoriBridge - {profile.display_name || t.tabProfile}</title></Helmet>

      <div className="bg-white/90 backdrop-blur-xl border-b border-[#E5DED2]/40 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} aria-label={t.back} className="text-[#8A837B] hover:text-[#1E1B18] transition p-1 -ml-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-[13px] font-semibold text-[#1E1B18]">{t.tabProfile}</p>
        <button onClick={() => setIsReportOpen(true)} aria-label={t.reportUser} className="text-[#8A837B] hover:text-[#1E1B18] p-1 transition" title={t.reportUser}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">

        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
            profile.is_verified
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-[#F3EEE6] text-[#8A837B] border border-[#E5DED2]"
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
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F1E9EE] text-[#4A1D3F] border border-[#4A1D3F]/20">
              {t.matchLabel} {matchPercentage}{t.matchSuffix}
            </span>
          )}
          {references.length > 0 && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {avgRating.toFixed(1)} · {references.length}{t.refReviews}
            </span>
          )}
        </div>

        <div className="bg-white rounded-[24px] shadow-card overflow-hidden">
          <div className="relative aspect-[4/5] bg-[#F3EEE6]">
            {isRealAvatar(profile.avatar_url) ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full ${getAvatarGradient(profile.avatar_url, profile.id)} flex items-center justify-center text-8xl font-display text-white`}>
                {profile.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-[#1E1B18]/45 px-5 pt-8 pb-4">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-[28px] text-white leading-tight truncate">{profile.display_name}</h1>
                {profile.is_verified && (
                  <span className="bg-[#5B8A72] text-white p-1 rounded-full flex-shrink-0" title={t.verifiedUser}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white/85 text-[14px]">{profile.nationality}</p>
                <span className="w-1 h-1 rounded-full bg-white/50" aria-hidden="true" />
                <p className={`text-[12px] font-semibold flex items-center gap-1.5 ${isOnline ? "text-[#A8D3BC]" : "text-white/70"}`}>
                  {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-[#8FB3A0]" aria-hidden="true" />}
                  {isOnline ? t.activeNow : lastActive}
                </p>
              </div>
            </div>
            {canLike && (
              <LikeHeartButton
                onLike={() => sendLike({ type: "photo", photo_index: 0 })}
                label={t.likePhotoBtn}
                className="absolute bottom-4 right-4"
              />
            )}
          </div>
        </div>

        {prompts[0] && (
          <PromptCard
            prompt={prompts[0]}
            locale={locale}
            likeLabel={t.likePromptBtn}
            onLike={canLike ? () => sendLike({ type: "prompt", prompt_id: prompts[0].id, answer: prompts[0].answer.slice(0, 120) }) : null}
          />
        )}

        {photos[0] && (
          <PhotoCard
            url={photos[0]}
            index={1}
            name={profile.display_name}
            likeLabel={t.likePhotoBtn}
            onLike={canLike ? () => sendLike({ type: "photo", photo_index: 1 }) : null}
          />
        )}

        <div className="bg-white rounded-apple-lg border border-[#E5DED2]/40 shadow-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F3EEE6] rounded-apple p-3.5">
              <p className="text-[11px] text-[#8A837B] mb-1 font-semibold uppercase tracking-wide">{t.nativeLangLabel}</p>
              <p className="text-[14px] font-bold text-[#1E1B18]">{profile.native_language}</p>
            </div>
            <div className="bg-[#F1E9EE] rounded-apple p-3.5">
              <p className="text-[11px] text-[#8A837B] mb-1 font-semibold uppercase tracking-wide">{t.learningLangLabel}</p>
              <p className="text-[14px] font-bold text-[#4A1D3F]">{profile.learning_language}</p>
            </div>
          </div>

          {matchPercentage > 0 && (
            <div>
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="text-[#8A837B] font-semibold">{t.matchScoreLabel}</span>
                <span className="text-[#4A1D3F] font-bold">{matchPercentage}%</span>
              </div>
              <div className="h-1.5 bg-[#F3EEE6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4A1D3F] rounded-full transition-all duration-700"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
              {match.reasons?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.reasons.slice(0, 3).map((reason) => (
                    <span key={reason} className="text-[12px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-semibold">
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {prompts[1] && (
          <PromptCard
            prompt={prompts[1]}
            locale={locale}
            likeLabel={t.likePromptBtn}
            onLike={canLike ? () => sendLike({ type: "prompt", prompt_id: prompts[1].id, answer: prompts[1].answer.slice(0, 120) }) : null}
          />
        )}

        {photos[1] && (
          <PhotoCard
            url={photos[1]}
            index={2}
            name={profile.display_name}
            likeLabel={t.likePhotoBtn}
            onLike={canLike ? () => sendLike({ type: "photo", photo_index: 2 }) : null}
          />
        )}

        {(goalLabel || styleLabel || profile.opening_question) && (
          <div className="bg-white rounded-apple-lg border border-[#E5DED2]/40 shadow-card p-5 space-y-3">
            {(goalLabel || styleLabel) && (
              <div className="flex flex-wrap gap-2">
                {goalLabel && (
                  <span className="text-[12px] bg-[#F1E9EE] text-[#4A1D3F] border border-[#4A1D3F]/20 px-3 py-1.5 rounded-full font-semibold">
                    {goalLabel}
                  </span>
                )}
                {styleLabel && (
                  <span className="text-[12px] bg-[#F3EEE6] text-[#1E1B18] border border-[#E5DED2] px-3 py-1.5 rounded-full font-semibold">
                    {styleLabel}
                  </span>
                )}
              </div>
            )}
            {profile.opening_question && (
              <div className="rounded-apple bg-[#F3EEE6] p-4">
                <p className="text-[10px] text-[#8A837B] font-semibold uppercase tracking-wider mb-1">Opening Question</p>
                <p className="text-[14px] text-[#1E1B18] font-semibold">{profile.opening_question}</p>
              </div>
            )}
          </div>
        )}

        {profile.interests?.length > 0 && (
          <div className="bg-white rounded-apple-lg border border-[#E5DED2]/40 shadow-card p-5">
            <p className="section-label mb-3">{t.interestsLabel}</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className={`text-[12px] px-3 py-1.5 rounded-full font-semibold transition-colors ${
                    commonInterests.includes(interest)
                      ? "bg-[#4A1D3F] text-white"
                      : "bg-[#F3EEE6] text-[#1E1B18]"
                  }`}
                >
                  #{interest}
                </span>
              ))}
            </div>
            {commonInterests.length > 0 && (
              <div className="mt-3 p-3 bg-[#F1E9EE] rounded-apple flex items-center gap-2.5 border border-[#4A1D3F]/20">
                <svg className="w-4 h-4 text-[#4A1D3F] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <p className="text-[12px] text-[#1E1B18] font-medium">
                  <span className="font-bold">{profile.display_name}</span>{t.commonInterestsNimwa}{" "}
                  <span className="text-[#4A1D3F] font-bold">{commonInterests.length}</span>
                  {t.commonInterestsSuffix}
                </p>
              </div>
            )}
          </div>
        )}

        {prompts[2] && (
          <PromptCard
            prompt={prompts[2]}
            locale={locale}
            likeLabel={t.likePromptBtn}
            onLike={canLike ? () => sendLike({ type: "prompt", prompt_id: prompts[2].id, answer: prompts[2].answer.slice(0, 120) }) : null}
          />
        )}

        {photos.slice(2).map((url, i) => (
          <PhotoCard
            key={url}
            url={url}
            index={i + 3}
            name={profile.display_name}
            likeLabel={t.likePhotoBtn}
            onLike={canLike ? () => sendLike({ type: "photo", photo_index: i + 3 }) : null}
          />
        ))}

        {profile.bio && (
          <div className="bg-white rounded-apple-lg border border-[#E5DED2]/40 shadow-card p-5">
            <p className="section-label mb-2">{t.bioLabel}</p>
            <p className="text-[14px] text-[#1E1B18] leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {!isSelf && (
          <button
            onClick={() => navigate(`/chat/${profile.id}`)}
            className="btn-primary w-full py-4 text-[15px] font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            {t.startChat}
          </button>
        )}

        {canWriteRef && (
          <button
            onClick={() => setIsRefModalOpen(true)}
            className="w-full py-3 rounded-full border border-[#4A1D3F] text-[#4A1D3F] text-[14px] font-semibold hover:bg-[#F1E9EE] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {myRef ? t.refEditBtn : t.refWriteBtn}
          </button>
        )}

        <div className="bg-white rounded-apple-lg border border-[#E5DED2]/40 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <p className="section-label">{t.refSectionTitle}</p>
              {references.length > 0 && (
                <span className="text-[12px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {avgRating.toFixed(1)}
                </span>
              )}
            </div>
            {!refsLoading && (
              <span className="text-[12px] text-[#8A837B] font-medium">{references.length}{t.refReviews}</span>
            )}
          </div>

          {refsLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-[#E5DED2] border-t-[#4A1D3F] rounded-full animate-spin" />
            </div>
          ) : references.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-apple bg-[#F3EEE6] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#E5DED2]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-[#1E1B18]">{t.refEmpty}</p>
              <p className="text-[12px] text-[#8A837B] mt-1">{t.refEmptyDesc}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {references.map((ref) => {
                const authorName = ref.author?.display_name || t.unknownUser;
                const authorInitial = authorName[0]?.toUpperCase() || "?";
                return (
                  <div key={ref.id} className="border border-[#E5DED2]/40 rounded-apple p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      {isRealAvatar(ref.author?.avatar_url) ? (
                        <img
                          src={ref.author.avatar_url}
                          alt={authorName}
                          className="w-9 h-9 rounded-apple object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-apple flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${getAvatarGradient(ref.author?.avatar_url, ref.author_id)}`}>
                          {authorInitial}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] font-semibold text-[#1E1B18] truncate">{authorName}</p>
                          <p className="text-[11px] text-[#8A837B] flex-shrink-0">
                            {formatRelativeTime(ref.created_at, locale)}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= ref.rating ? "text-amber-400" : "text-[#E5DED2]"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    {ref.content && (
                      <p className="text-[13px] text-[#1E1B18] leading-relaxed">{ref.content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isSelf && (
          <div className="pt-3 border-t border-[#E5DED2]/40 flex flex-col gap-3">
            <button
              onClick={() => setIsReportOpen(true)}
              className="w-full py-2 text-[13px] font-semibold text-[#8A837B] hover:text-[#1E1B18] transition-colors"
            >
              {t.reportUser}
            </button>
            <BlockButton targetId={profile.id} onBlockSuccess={() => navigate("/home")} />
          </div>
        )}
      </div>

      {isReportOpen && (
        <ReportModal
          targetId={profile.id}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {isRefModalOpen && (
        <ReferenceModal
          targetId={profile.id}
          existingRef={myRef}
          onClose={() => setIsRefModalOpen(false)}
          onSaved={loadRefs}
        />
      )}

      {matchOpen && (
        <MatchModal
          me={meProfile || myProfile}
          partner={profile}
          onClose={() => setMatchOpen(false)}
        />
      )}
    </div>
  );
}
