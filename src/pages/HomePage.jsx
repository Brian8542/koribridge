import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { useLocale } from "../hooks/useLocale";
import LanguageSelector from "../components/LanguageSelector";
import { isRealAvatar, getAvatarGradient, AVATAR_GRADIENTS } from "../utils/avatarUtils";
import DeleteAccountModal from "../components/DeleteAccountModal";
import SwipeCard from "../components/SwipeCard";
import ProfileCard from "../components/ProfileCard";
import ProfileSkeleton from "../components/ProfileSkeleton";
import ProfileFilters from "../components/ProfileFilters";
import ConversationItem from "../components/ConversationItem";
import StatsBanner from "../components/StatsBanner";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import { getMatchScore } from "../utils/matching";
import { pageView } from "../utils/analytics";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { sendPushNotification } from "../utils/pushNotifications";
import { COMMUNICATION_STYLES, CONVERSATION_GOALS } from "../utils/profileOptions";
import { getProfileCompletion } from "../utils/profileCompletion";
import ProfileCompletionCard from "../components/ProfileCompletionCard";

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어", "일본어", "기타",
];

const NATIONALITIES = [
  "한국", "미국", "영국", "캐나다", "호주", "베트남", "태국", "필리핀",
  "인도네시아", "말레이시아", "카자흐스탄", "우즈베키스탄", "중국", "일본", "기타",
];

const INTERESTS = ["K-pop", "한국 음식", "여행", "드라마", "언어 교환", "게임", "영화", "스포츠"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const NAV_ICONS = {
  home: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
    </svg>
  ),
  swipe: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  chatlist: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  favorites: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  profile: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
};

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const onlineIds = useOnlineUsers(user?.id);
  const { darkMode, toggleDarkMode } = useTheme();
  const { locale, t, levelLabel } = useLocale();

  const [myProfile, setMyProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [tab, setTab] = useState("home");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [convoLoading, setConvoLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [profileForm, setProfileForm] = useState({
    display_name: "", nationality: "", native_language: "",
    learning_language: "", language_level: "초급", bio: "", avatar_url: "", interests: [], is_public: true,
    conversation_goal: "culture_exchange", communication_style: "text_first", opening_question: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  const { permission: pushPermission, subscribed: pushSubscribed, loading: pushLoading, subscribe: subscribePush, unsubscribe: unsubscribePush } = usePushNotifications(user?.id);
  const notifGranted = useRef(false);
  const bottomNavRef = useRef(null);
  const profileCompletion = useMemo(() => getProfileCompletion({
    ...profileForm,
    avatar_url: avatarPreview ? "preview" : profileForm.avatar_url,
  }), [profileForm, avatarPreview]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => { notifGranted.current = perm === "granted"; });
    } else if (Notification.permission === "granted") {
      notifGranted.current = true;
    }
  }, []);

  useEffect(() => { pageView("홈"); }, []);

  useEffect(() => {
    if (!user) return;
    const loadAll = async () => {
      setLoadError(false);
      try {
        const { data: me } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (me) {
          setMyProfile(me);
          setProfileForm({
            display_name: me.display_name || "",
            nationality: me.nationality || "",
            native_language: me.native_language || "",
            learning_language: me.learning_language || "",
            language_level: me.language_level || "초급",
            bio: me.bio || "",
            avatar_url: me.avatar_url || "",
            interests: me.interests || [],
            is_public: me.is_public ?? true,
            conversation_goal: me.conversation_goal || "culture_exchange",
            communication_style: me.communication_style || "text_first",
            opening_question: me.opening_question || "",
          });
        }

        const { data: blocks } = await supabase.from("blocked_users").select("blocked_id").eq("blocker_id", user.id);
        const bIds = (blocks || []).map((b) => b.blocked_id);
        setBlockedIds(bIds);

        const { data: favs } = await supabase.from("favorites").select("partner_id").eq("user_id", user.id);
        const fIds = new Set((favs || []).map((f) => f.partner_id));
        setFavoriteIds(fIds);
        if (fIds.size > 0) {
          const { data: favoriteProfiles } = await supabase
            .from("profiles")
            .select("id, display_name, nationality, native_language, learning_language, language_level, avatar_url, bio, interests, conversation_goal, communication_style, opening_question")
            .in("id", Array.from(fIds));
          setFavorites(favoriteProfiles || []);
        } else {
          setFavorites([]);
        }
        setFavoritesLoading(false);

        const { count: totalCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const { count: todayCount } = await supabase
          .from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString());
        setStats({ total: totalCount || 0, today: todayCount || 0 });

        const { data: allProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, display_name, nationality, native_language, learning_language, language_level, avatar_url, bio, interests, conversation_goal, communication_style, opening_question")
          .eq("is_public", true)
          .neq("id", user.id)
          .order("created_at", { ascending: false });
        if (!profilesError) setProfiles(allProfiles || []);
        setProfilesLoading(false);

        const { data: msgs, error: msgsError } = await supabase
          .from("messages")
          .select("id, sender_id, receiver_id, content, created_at, read_at")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (!msgsError) {
          const byPartner = new Map();
          msgs?.forEach((message) => {
            const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
            const current = byPartner.get(partnerId) || { partnerId, lastMessage: message, unreadCount: 0 };
            if (new Date(message.created_at) > new Date(current.lastMessage.created_at)) current.lastMessage = message;
            if (message.receiver_id === user.id && !message.read_at) current.unreadCount += 1;
            byPartner.set(partnerId, current);
          });
          const partnerIds = Array.from(byPartner.keys());
          if (partnerIds.length > 0) {
            const { data: partnerProfiles } = await supabase
              .from("profiles")
              .select("id, display_name, nationality, native_language, learning_language, language_level, avatar_url, bio, interests, conversation_goal, communication_style, opening_question")
              .in("id", partnerIds);
            const partnerMap = new Map(partnerProfiles?.map((p) => [p.id, p]));
            const sorted = Array.from(byPartner.values())
              .map((item) => ({ ...item, partner: partnerMap.get(item.partnerId) || { id: item.partnerId, display_name: t.unknownUser } }))
              .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));
            setConversations(sorted);
          } else {
            setConversations([]);
          }
        }
        setConvoLoading(false);
      } catch {
        setLoadError(true);
        setProfilesLoading(false);
        setFavoritesLoading(false);
        setConvoLoading(false);
      }
    };
    loadAll();
  }, [user, loadRetryKey, t.unknownUser]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel("home-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          const msg = payload.new;
          if (notifGranted.current && document.visibilityState !== "visible") {
            new Notification(t.newMsgNotif, { body: msg.content, icon: "/favicon.ico" });
          }
          setConversations((prev) => {
            const partnerId = msg.sender_id;
            const existing = prev.find((c) => c.partnerId === partnerId);
            if (existing) return prev.map((c) => c.partnerId === partnerId ? { ...c, lastMessage: msg, unreadCount: c.unreadCount + 1 } : c);
            return prev;
          });
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id, t.newMsgNotif]);

  const recommendedProfiles = useMemo(() => {
    if (!myProfile || profiles.length === 0) return [];
    return profiles
      .filter((p) => !blockedIds.includes(p.id))
      .map((p) => ({ ...p, ...getMatchScore(myProfile, p) }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [myProfile, profiles, blockedIds]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (blockedIds.includes(p.id)) return false;
      if (nationalityFilter && p.nationality !== nationalityFilter) return false;
      if (languageFilter && p.learning_language !== languageFilter) return false;
      if (levelFilter && p.language_level !== levelFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!p.display_name?.toLowerCase().includes(q) && !p.nationality?.toLowerCase().includes(q) &&
          !p.native_language?.toLowerCase().includes(q) && !p.learning_language?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [profiles, nationalityFilter, languageFilter, levelFilter, blockedIds, searchQuery]);

  useEffect(() => { setVisibleCount(12); }, [nationalityFilter, languageFilter, levelFilter, searchQuery]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      if (bottomNavRef.current) bottomNavRef.current.style.bottom = `${offset}px`;
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update); };
  }, []);

  const handleProfileChange = (field, value) => setProfileForm((prev) => ({ ...prev, [field]: value }));

  const toggleInterest = (interest) => {
    setProfileForm((prev) => {
      const has = prev.interests.includes(interest);
      return { ...prev, interests: has ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest] };
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { setProfileError(t.errAvatarType); e.target.value = ""; return; }
    if (file.size > 2 * 1024 * 1024) { setProfileError(t.errAvatarSize); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileError("");
  };

  const handleGradientSelect = (idx) => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileForm((prev) => ({ ...prev, avatar_url: `gradient:${idx}` }));
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user?.id) return profileForm.avatar_url;
    setAvatarUploading(true);
    const ext = avatarFile.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
    setAvatarUploading(false);
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    if (!profileForm.display_name.trim()) return setProfileError(t.errName);
    if (profileForm.display_name.trim().length > 50) return setProfileError(t.errNameLen);
    if (!profileForm.nationality) return setProfileError(t.errNationality);
    if (!profileForm.native_language) return setProfileError(t.errNativeLang);
    if (!profileForm.learning_language) return setProfileError(t.errLearningLang);
    if (profileForm.bio.length > 500) return setProfileError(t.errBioLen);
    if (profileForm.opening_question.length > 140) return setProfileError("첫 질문은 140자 이하로 입력해 주세요.");
    setProfileLoading(true);
    try {
      const avatar_url = await uploadAvatar();
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: profileForm.display_name.trim(),
        nationality: profileForm.nationality,
        native_language: profileForm.native_language,
        learning_language: profileForm.learning_language,
        language_level: profileForm.language_level || "초급",
        bio: profileForm.bio.trim(),
        avatar_url: avatar_url || profileForm.avatar_url || "",
        interests: profileForm.interests,
        is_public: profileForm.is_public,
        conversation_goal: profileForm.conversation_goal,
        communication_style: profileForm.communication_style,
        opening_question: profileForm.opening_question.trim(),
      });
      if (error) throw error;
      showToast(t.profileSaveBtn, "success");
      setTab("home");
      const { data: myUpdated } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (myUpdated) setMyProfile(myUpdated);
    } catch {
      setProfileError(t.saveError);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleToggleFavorite = useCallback(async (profile) => {
    if (!user?.id) return;
    const isFav = favoriteIds.has(profile.id);
    if (isFav) {
      const { error } = await supabase.from("favorites").delete().match({ user_id: user.id, partner_id: profile.id });
      if (error) { showToast(t.favRemoveFailed, "error"); return; }
      setFavoriteIds((prev) => { const next = new Set(prev); next.delete(profile.id); return next; });
      setFavorites((prev) => prev.filter((item) => item.id !== profile.id));
      showToast(t.favRemoved, "success");
    } else {
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, partner_id: profile.id });
      if (error) { showToast(t.favAddFailed, "error"); return; }
      setFavoriteIds((prev) => new Set(prev).add(profile.id));
      setFavorites((prev) => [...prev, profile]);
      showToast(t.favAdded, "success");
    }
  }, [user?.id, favoriteIds, showToast, t.favRemoveFailed, t.favAddFailed, t.favRemoved, t.favAdded]);

  const handleReport = useCallback((profileId, displayName) => {
    setReportModal({ profileId, displayName });
  }, []);

  const blockUser = async () => {
    if (!blockConfirm) return;
    const { targetId, displayName } = blockConfirm;
    const { error } = await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: targetId });
    if (error && error.code !== "23505") {
      showToast(t.blockFailed, "error");
      setBlockConfirm(null);
      return;
    }
    setBlockedIds((prev) => [...prev, targetId]);
    setBlockConfirm(null);
    setReportModal(null);
    showToast(`${displayName}${t.blocked}`, "success");
  };

  const submitReport = async () => {
    if (!reportModal || !reportReason.trim()) return;
    setReportLoading(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: reportModal.profileId,
      reason: reportReason.trim().slice(0, 1000),
    });
    setReportLoading(false);
    if (error) { showToast(t.reportFailed, "error"); return; }
    setReportModal(null);
    setReportReason("");
    showToast(t.reportDone, "success");
  };

  const handleSwipe = async (targetId, direction) => {
    if (direction === "right" && !favoriteIds.has(targetId)) {
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, partner_id: targetId });
      if (!error) {
        setFavoriteIds((prev) => new Set(prev).add(targetId));
        showToast(t.liked, "success");
        const { data: mutual } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", targetId)
          .eq("partner_id", user.id)
          .maybeSingle();
        if (mutual) {
          const senderName = myProfile?.display_name || "";
          sendPushNotification({
            receiverId: targetId,
            title: t.pushMatchTitle,
            body: `${senderName}${t.pushMatchBody}`,
            url: `/chat/${user.id}`,
            type: "match",
          });
        }
      }
    }
    setProfiles((prev) => prev.filter((p) => p.id !== targetId));
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const renderHomeContent = () => (
    <div className="space-y-8">
      {myProfile && (
        <div className="card p-4 flex items-center gap-4 bg-gradient-to-r from-red-50 to-rose-50 border-red-100/60">
          <div className="flex-shrink-0">
            {isRealAvatar(myProfile.avatar_url) ? (
              <img src={myProfile.avatar_url} alt={t.tabProfile} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-red-100" />
            ) : (
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarGradient(myProfile.avatar_url, myProfile.id)} flex items-center justify-center text-xl font-bold text-white`}>
                {myProfile.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-gray-900 truncate">{myProfile.display_name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {myProfile.nationality} · {myProfile.native_language} → {myProfile.learning_language}
            </p>
          </div>
          <button onClick={() => setTab("profile")} className="btn-secondary px-4 py-2 text-sm w-auto flex-shrink-0">
            {t.editProfile}
          </button>
        </div>
      )}

      <StatsBanner onlineCount={onlineIds.size} total={stats.total} today={stats.today} />

      {recommendedProfiles.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-extrabold text-gray-900">{t.aiRecommended}</span>
            <span className="text-xs bg-gradient-to-r from-red-600 to-rose-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">{t.recommendedBadge}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                myProfile={myProfile}
                isOnline={onlineIds.has(profile.id)}
                isFavorite={favoriteIds.has(profile.id)}
                onToggleFavorite={handleToggleFavorite}
                onReport={handleReport}
              />
            ))}
          </div>
        </div>
      )}

      <ProfileFilters
        profiles={profiles}
        languages={LANGUAGES}
        nationalityFilter={nationalityFilter}
        languageFilter={languageFilter}
        levelFilter={levelFilter}
        onNationality={setNationalityFilter}
        onLanguage={setLanguageFilter}
        onLevel={setLevelFilter}
      />

      <div>
        <p className="text-base font-extrabold text-gray-900 mb-4">
          {t.allPartners}{" "}
          <span className="text-rose-500">({filteredProfiles.length}{locale === "ko" ? t.people : ""})</span>
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profilesLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ProfileSkeleton key={i} />)
          ) : loadError ? (
            <EmptyState
              icon="📡"
              title={t.networkError}
              desc={t.networkErrorDesc}
              action={() => setLoadRetryKey((k) => k + 1)}
              actionLabel={t.retry}
            />
          ) : filteredProfiles.length === 0 ? (
            nationalityFilter || languageFilter || levelFilter || searchQuery.trim() ? (
              <EmptyState
                icon="🔍"
                title={t.noFilterPartners}
                desc={t.noFilterPartnersDesc}
                action={() => { setSearchQuery(""); setNationalityFilter(""); setLanguageFilter(""); setLevelFilter(""); }}
                actionLabel={t.resetFilters}
              />
            ) : (
              <EmptyState
                icon="🌏"
                title={t.noPartners}
                desc={t.noPartnersDesc}
                action={() => setTab("profile")}
                actionLabel={t.editProfile}
              />
            )
          ) : (
            filteredProfiles.slice(0, visibleCount).map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                myProfile={myProfile}
                isOnline={onlineIds.has(profile.id)}
                isFavorite={favoriteIds.has(profile.id)}
                onToggleFavorite={handleToggleFavorite}
                onReport={handleReport}
              />
            ))
          )}
        </div>
        {filteredProfiles.length > visibleCount && (
          <div className="text-center mt-6">
            <button onClick={() => setVisibleCount((c) => c + 12)} className="btn-secondary px-8 py-3 text-sm w-auto">
              {t.loadMore} ({filteredProfiles.length - visibleCount}{t.moreSuffix})
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSwipeContent = () => (
    <div className="flex flex-col items-center min-h-[65vh]">
      <div className="w-full max-w-sm mb-6 text-center">
        <h2 className="text-xl font-extrabold text-gray-900">{t.tabSwipe}</h2>
        <p className="text-sm text-gray-400 mt-1">{t.swipeDesc}</p>
      </div>
      <div className="relative w-full flex-1 flex items-center justify-center">
        {profilesLoading ? (
          <div className="animate-pulse w-full max-w-sm aspect-[3/4] bg-gray-200 rounded-3xl" />
        ) : filteredProfiles.length > 0 ? (
          filteredProfiles.slice(0, 5).reverse().map((profile) => {
            const match = getMatchScore(myProfile, profile);
            return (
              <SwipeCard
                key={profile.id}
                profile={profile}
                score={match.score}
                reasons={match.reasons}
                onSwipeLeft={() => handleSwipe(profile.id, "left")}
                onSwipeRight={() => handleSwipe(profile.id, "right")}
              />
            );
          })
        ) : (
          <EmptyState
            icon="🌏"
            title={t.noMoreSwipe}
            desc={t.noMoreSwipeDesc}
            action={() => setLoadRetryKey((k) => k + 1)}
            actionLabel={t.retry}
          />
        )}
      </div>
    </div>
  );

  const renderFavoritesContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">{t.favorites}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t.favoritesDesc}</p>
        </div>
        {favorites.length > 0 && (
          <button type="button" onClick={() => setTab("home")} className="text-sm text-red-600 font-semibold hover:text-red-700 transition-colors">
            {t.morePartners}
          </button>
        )}
      </div>
      {favoritesLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <ProfileSkeleton key={i} />)}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="⭐"
          title={t.noFavorites}
          desc={t.favoritesDesc}
          action={() => setTab("home")}
          actionLabel={t.findPartnerBtn}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              myProfile={myProfile}
              isOnline={onlineIds.has(profile.id)}
              isFavorite={favoriteIds.has(profile.id)}
              onToggleFavorite={handleToggleFavorite}
              onReport={handleReport}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderChatListContent = () => (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-extrabold text-gray-900">{t.tabChat}</h2>
      </div>
      {convoLoading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 animate-pulse flex items-center gap-4 min-h-[80px]">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
              <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
            </div>
          </div>
        ))
      ) : loadError ? (
        <EmptyState
          icon="📡"
          title={t.chatNetworkError}
          desc={t.networkErrorDesc}
          action={() => setLoadRetryKey((k) => k + 1)}
          actionLabel={t.retry}
        />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="💬"
          title={t.noChatTitle}
          desc={t.noChatDesc}
          action={() => setTab("home")}
          actionLabel={t.browsePartners}
        />
      ) : (
        conversations.map((conv) => (
          <ConversationItem
            key={conv.partnerId}
            conv={conv}
            userId={user.id}
            isOnline={onlineIds.has(conv.partnerId)}
          />
        ))
      )}
    </div>
  );

  const renderProfileContent = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-900">{t.profileEdit}</h2>
        <button type="button" onClick={() => setTab("home")} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" transform="scale(-1,1) translate(-24,0)" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t.backHome}
        </button>
      </div>

      <form onSubmit={saveProfile} className="space-y-5">
        <ProfileCompletionCard completion={profileCompletion} />

        <div className="card flex flex-col items-center gap-4 py-8">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="preview" className="w-28 h-28 rounded-3xl object-cover ring-4 ring-red-100 shadow-lg" />
            ) : isRealAvatar(profileForm.avatar_url) ? (
              <img src={profileForm.avatar_url} alt={t.tabProfile} className="w-28 h-28 rounded-3xl object-cover ring-4 ring-red-100 shadow-lg" />
            ) : (
              <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${getAvatarGradient(profileForm.avatar_url, user?.id)} flex items-center justify-center text-5xl font-black text-white shadow-lg`}>
                {profileForm.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center cursor-pointer shadow-lg border-2 border-white">
              <span className="text-white text-xl leading-none font-bold select-none">+</span>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="text-xs text-gray-400">{t.avatarLimit}</p>
          <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: 288 }}>
            {AVATAR_GRADIENTS.map((gradient, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleGradientSelect(idx)}
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0 transition-all duration-150 ${
                  profileForm.avatar_url === `gradient:${idx}` && !avatarPreview
                    ? "ring-2 ring-offset-2 ring-red-500 scale-110 shadow-md"
                    : "opacity-70 hover:opacity-100 hover:scale-110"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.nickname}</label>
              <input type="text" className="input-field" value={profileForm.display_name} maxLength={50}
                onChange={(e) => handleProfileChange("display_name", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.nationality}</label>
              <select className="input-field" value={profileForm.nationality} onChange={(e) => handleProfileChange("nationality", e.target.value)}>
                <option value="">{t.select}</option>
                {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.nativeLanguage}</label>
              <select className="input-field" value={profileForm.native_language} onChange={(e) => handleProfileChange("native_language", e.target.value)}>
                <option value="">{t.select}</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.learningLanguage}</label>
              <select className="input-field" value={profileForm.learning_language} onChange={(e) => handleProfileChange("learning_language", e.target.value)}>
                <option value="">{t.select}</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.languageLevel}</label>
            <div className="flex gap-2">
              {["초급", "중급", "고급"].map((level) => (
                <button type="button" key={level} onClick={() => handleProfileChange("language_level", level)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    profileForm.language_level === level
                      ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {levelLabel(level)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-bold text-gray-700">{t.isPublic}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.noPartnersDesc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profileForm.is_public}
              onClick={() => handleProfileChange("is_public", !profileForm.is_public)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                profileForm.is_public ? "bg-red-600" : "bg-gray-200"
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                profileForm.is_public ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">대화 목적</label>
            <div className="grid grid-cols-2 gap-2">
              {CONVERSATION_GOALS.map((goal) => (
                <button
                  type="button"
                  key={goal.value}
                  onClick={() => handleProfileChange("conversation_goal", goal.value)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                    profileForm.conversation_goal === goal.value
                      ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">선호 대화 방식</label>
            <div className="grid grid-cols-2 gap-2">
              {COMMUNICATION_STYLES.map((style) => (
                <button
                  type="button"
                  key={style.value}
                  onClick={() => handleProfileChange("communication_style", style.value)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                    profileForm.communication_style === style.value
                      ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-gray-700">첫 대화 질문</label>
              <span className={`text-xs ${profileForm.opening_question.length > 120 ? "text-red-500" : "text-gray-400"}`}>
                {profileForm.opening_question.length}/140
              </span>
            </div>
            <input
              type="text"
              className="input-field"
              value={profileForm.opening_question}
              maxLength={140}
              onChange={(e) => handleProfileChange("opening_question", e.target.value)}
              placeholder="예: 한국에서 꼭 가보고 싶은 곳은 어디예요?"
            />
          </div>
        </div>

        <div className="card">
          <p className="text-sm font-bold text-gray-700 mb-3">{t.pushNotifications}</p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700">{t.pushMessages}</p>
              <p className="text-xs text-gray-400 mt-0.5">{
                pushPermission === "denied" ? t.pushDenied : t.pushMessagesDesc
              }</p>
            </div>
            {pushPermission !== "denied" && (
              <button
                type="button"
                role="switch"
                aria-checked={pushSubscribed}
                disabled={pushLoading}
                onClick={pushSubscribed ? unsubscribePush : subscribePush}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                  pushSubscribed ? "bg-red-600" : "bg-gray-200"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  pushSubscribed ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <label className="block text-sm font-bold text-gray-700 mb-3">{t.interests}</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button type="button" key={interest} onClick={() => toggleInterest(interest)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 ${
                  profileForm.interests.includes(interest)
                    ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-bold text-gray-700">{t.bio}</label>
            <span className={`text-xs ${profileForm.bio.length > 450 ? "text-red-500" : "text-gray-400"}`}>
              {profileForm.bio.length}/500
            </span>
          </div>
          <textarea rows={4} className="input-field resize-none" value={profileForm.bio} maxLength={500}
            onChange={(e) => handleProfileChange("bio", e.target.value)} placeholder={t.bioPlaceholder} />
        </div>

        {profileError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
            {profileError}
          </div>
        )}

        <button type="submit" disabled={profileLoading || avatarUploading} className="btn-primary py-3.5 text-base">
          {avatarUploading ? t.avatarUploading : profileLoading ? t.saving : t.profileSaveBtn}
        </button>
      </form>

      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-400">
        <button onClick={() => navigate("/terms")} className="hover:text-gray-600 underline">{t.termsLink}</button>
        <span>·</span>
        <button onClick={() => navigate("/privacy")} className="hover:text-gray-600 underline">{t.privacyLink}</button>
      </div>

      <div className="pt-2 text-center">
        <button type="button" onClick={() => setShowDeleteModal(true)} className="text-xs text-gray-300 hover:text-red-400 underline transition-colors">
          {t.deleteAccountBtn}
        </button>
      </div>
    </div>
  );

  const NAV_TABS = [
    { key: "home", label: t.tabHome },
    { key: "swipe", label: t.tabSwipeShort },
    { key: "chatlist", label: t.tabChat, badge: totalUnread },
    { key: "favorites", label: t.tabFavorites },
    { key: "profile", label: t.tabProfileShort },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Helmet><title>KoriBridge - {t.homeTitle}</title></Helmet>

      <div className="bg-gradient-to-r from-red-600 to-rose-500 px-5 pt-4 pb-3 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-red-100/80 font-medium leading-none mb-0.5">
              {t.welcome} {user.email?.split("@")[0] || ""}{locale === "ko" ? "님" : ""}
            </p>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{t.homeTitle}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageSelector dark />
            <button type="button" onClick={toggleDarkMode}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-base transition-colors">
              {darkMode ? "🌙" : "☀️"}
            </button>
            <button type="button" onClick={signOut}
              className="h-9 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-xs text-white font-bold transition-colors">
              {t.logout}
            </button>
          </div>
        </div>

        {tab === "home" && (
          <div className="mt-3 relative">
            <input
              type="text"
              className="w-full pl-4 pr-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/55 text-sm focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-white/30 transition-all"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/30 text-white text-xs flex items-center justify-center hover:bg-white/40 transition-colors">
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-5 max-w-6xl mx-auto">
        {tab === "home" && renderHomeContent()}
        {tab === "swipe" && renderSwipeContent()}
        {tab === "favorites" && renderFavoritesContent()}
        {tab === "chatlist" && renderChatListContent()}
        {tab === "profile" && renderProfileContent()}
      </div>

      <div ref={bottomNavRef} className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white/97 backdrop-blur-sm shadow-[0_-4px_24px_rgba(15,23,42,0.08)]">
        <nav className="mx-auto flex max-w-6xl items-center justify-around px-2">
          {NAV_TABS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className="relative flex flex-col items-center gap-0.5 min-w-[56px] py-2.5 px-3 rounded-2xl transition-all duration-150"
              >
                <span className={`transition-colors duration-150 ${active ? "text-red-600" : "text-gray-400"}`}>
                  {NAV_ICONS[item.key]}
                </span>
                <span className={`text-[10px] font-semibold transition-colors duration-150 leading-none ${active ? "text-red-600" : "text-gray-400"}`}>
                  {item.label}
                </span>
                {active && <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-red-500" />}
                {item.badge > 0 && (
                  <span className="absolute top-1.5 right-2 w-4 h-4 rounded-full bg-red-600 text-[9px] text-white flex items-center justify-center font-bold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-0.5">{reportModal.displayName}</h3>
            <p className="text-sm text-gray-500 mb-4">{t.reportOrBlock}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.reportReason}</label>
                <textarea rows={3} className="input-field resize-none text-sm"
                  value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                  placeholder={t.reportReasonPlaceholder} />
              </div>
              <button type="button" onClick={submitReport} disabled={reportLoading || !reportReason.trim()}
                className="w-full rounded-2xl bg-amber-500 text-white py-3 text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors">
                {reportLoading ? t.reporting : t.reportBtn}
              </button>
              <button type="button"
                onClick={() => setBlockConfirm({ targetId: reportModal.profileId, displayName: reportModal.displayName })}
                className="w-full rounded-2xl bg-red-600 text-white py-3 text-sm font-bold hover:bg-red-700 transition-colors">
                {t.blockBtn}
              </button>
              <button type="button" onClick={() => { setReportModal(null); setReportReason(""); }}
                className="w-full rounded-2xl bg-gray-100 text-gray-700 py-3 text-sm font-semibold hover:bg-gray-200 transition-colors">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {blockConfirm && (
        <ConfirmModal
          message={`${blockConfirm.displayName}${locale === "ko" ? " " : ""}${t.blockConfirmMsg}`}
          confirmLabel={t.blockBtn}
          cancelLabel={t.cancel}
          danger
          onConfirm={blockUser}
          onCancel={() => setBlockConfirm(null)}
        />
      )}

      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}
