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
import { COMMUNICATION_STYLES, CONVERSATION_GOALS, INTERESTS, MAX_INTERESTS } from "../utils/profileOptions";
import { getProfileCompletion } from "../utils/profileCompletion";
import ProfileCompletionCard from "../components/ProfileCompletionCard";
import AnnouncementBanner from "../components/AnnouncementBanner";
import AdvancedFiltersModal from "../components/AdvancedFiltersModal";
import CommunityPage from "./CommunityPage";

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어", "일본어", "기타",
];

const NATIONALITIES = [
  "한국", "미국", "영국", "캐나다", "호주", "베트남", "태국", "필리핀",
  "인도네시아", "말레이시아", "카자흐스탄", "우즈베키스탄", "중국", "일본", "기타",
];

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
  community: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
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
  const [nativeLangFilter, setNativeLangFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState([]);
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
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
          .select("id, display_name, nationality, native_language, learning_language, language_level, avatar_url, bio, interests, is_verified, conversation_goal, communication_style, opening_question")
          .eq("is_public", true)
          .neq("id", user.id)
          .order("created_at", { ascending: false });

        if (!profilesError && allProfiles) {
          const { data: refRows } = await supabase
            .from("user_references")
            .select("target_id, rating");
          const refMap = {};
          (refRows || []).forEach((r) => {
            if (!refMap[r.target_id]) refMap[r.target_id] = { count: 0, total: 0 };
            refMap[r.target_id].count++;
            refMap[r.target_id].total += r.rating;
          });
          setProfiles(allProfiles.map((p) => {
            const s = refMap[p.id];
            return s
              ? { ...p, reference_count: s.count, avg_rating: s.total / s.count }
              : { ...p, reference_count: 0, avg_rating: 0 };
          }));
        } else {
          setProfiles(allProfiles || []);
        }
        setProfilesLoading(false);

        const { data: msgs, error: msgsError } = await supabase
          .from("messages")
          .select("id, sender_id, receiver_id, content, image_url, created_at, read_at")
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
            new Notification(t.newMsgNotif, { body: msg.image_url ? t.msgImagePlaceholder : msg.content, icon: "/favicon.ico" });
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

  const nationalities = useMemo(
    () => [...new Set(profiles.map((p) => p.nationality).filter(Boolean))].sort(),
    [profiles]
  );

  const filterActiveCount = useMemo(
    () =>
      [nationalityFilter, languageFilter, nativeLangFilter, levelFilter, verifiedOnlyFilter]
        .filter(Boolean).length + (interestFilter.length > 0 ? 1 : 0),
    [nationalityFilter, languageFilter, nativeLangFilter, levelFilter, verifiedOnlyFilter, interestFilter]
  );

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (blockedIds.includes(p.id)) return false;
      if (nationalityFilter && p.nationality !== nationalityFilter) return false;
      if (languageFilter && p.learning_language !== languageFilter) return false;
      if (levelFilter && p.language_level !== levelFilter) return false;
      if (nativeLangFilter && p.native_language !== nativeLangFilter) return false;
      if (interestFilter.length > 0 && !interestFilter.some((i) => p.interests?.includes(i))) return false;
      if (verifiedOnlyFilter && !p.is_verified) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!p.display_name?.toLowerCase().includes(q) && !p.nationality?.toLowerCase().includes(q) &&
          !p.native_language?.toLowerCase().includes(q) && !p.learning_language?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [profiles, nationalityFilter, languageFilter, levelFilter, nativeLangFilter, interestFilter, verifiedOnlyFilter, blockedIds, searchQuery]);

  const handleResetFilters = useCallback(() => {
    setNationalityFilter("");
    setLanguageFilter("");
    setNativeLangFilter("");
    setLevelFilter("");
    setInterestFilter([]);
    setVerifiedOnlyFilter(false);
    setSearchQuery("");
  }, []);

  useEffect(() => { setVisibleCount(12); }, [nationalityFilter, languageFilter, levelFilter, nativeLangFilter, interestFilter, verifiedOnlyFilter, searchQuery]);

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
      if (!has && prev.interests.length >= MAX_INTERESTS) return prev;
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
    if (profileForm.opening_question.length > 140) return setProfileError(t.errOpeningQuestionLen);
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
        is_verified: !!user?.email_confirmed_at,
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
    <div className="space-y-6">
      <AnnouncementBanner />

      {myProfile && (
        <div className="bg-white rounded-2xl border border-neutral-150 shadow-xs p-4 flex items-center gap-3.5">
          <div className="flex-shrink-0">
            {isRealAvatar(myProfile.avatar_url) ? (
              <img src={myProfile.avatar_url} alt={t.tabProfile} className="w-11 h-11 rounded-xl object-cover" />
            ) : (
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarGradient(myProfile.avatar_url, myProfile.id)} flex items-center justify-center text-lg font-bold text-white`}>
                {myProfile.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-neutral-900 text-sm truncate">{myProfile.display_name}</p>
            <p className="text-xs text-neutral-400 mt-0.5 truncate">
              {myProfile.nationality} · {myProfile.native_language} → {myProfile.learning_language}
            </p>
          </div>
          <button onClick={() => setTab("profile")} className="btn-secondary px-3 py-2 text-xs w-auto flex-shrink-0">
            {t.editProfile}
          </button>
        </div>
      )}

      <StatsBanner onlineCount={onlineIds.size} total={stats.total} today={stats.today} />

      {recommendedProfiles.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-neutral-900">{t.aiRecommended}</span>
            <span className="badge bg-[#e8f4ff] text-[#0071e3] border border-[#0071e3]/20 text-[11px]">{t.recommendedBadge}</span>
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
        activeCount={filterActiveCount}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        onReset={handleResetFilters}
        resultCount={filteredProfiles.length}
      />

      <div>
        <p className="text-sm font-bold text-neutral-900 mb-4">
          {t.allPartners}{" "}
          <span className="text-[#0071e3] font-semibold">({filteredProfiles.length}{locale === "ko" ? t.people : ""})</span>
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
            filterActiveCount > 0 || searchQuery.trim() ? (
              <EmptyState
                icon="🔍"
                title={t.noFilterPartners}
                desc={t.noFilterPartnersDesc}
                action={handleResetFilters}
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
            <button onClick={() => setVisibleCount((c) => c + 12)} className="btn-secondary px-8 py-2.5 text-sm w-auto">
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
        <h2 className="text-lg font-bold text-neutral-900">{t.tabSwipe}</h2>
        <p className="text-sm text-neutral-400 mt-1">{t.swipeDesc}</p>
      </div>
      <div className="relative w-full flex-1 flex items-center justify-center">
        {profilesLoading ? (
          <div className="w-full max-w-sm aspect-[3/4] skeleton rounded-3xl" />
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
          <h2 className="text-base font-bold text-neutral-900">{t.favorites}</h2>
          <p className="text-sm text-neutral-400 mt-0.5">{t.favoritesDesc}</p>
        </div>
        {favorites.length > 0 && (
          <button type="button" onClick={() => setTab("home")} className="text-[13px] text-[#0071e3] font-semibold hover:text-[#0077ed] transition-colors">
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
    <div className="space-y-2.5">
      <div className="mb-4">
        <h2 className="text-base font-bold text-neutral-900">{t.tabChat}</h2>
      </div>
      {convoLoading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-150 p-4 flex items-center gap-3.5 min-h-[72px]">
            <div className="w-12 h-12 skeleton rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 skeleton rounded-md w-1/3" />
              <div className="h-3 skeleton rounded-md w-2/3" />
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
        <h2 className="text-xl font-extrabold text-neutral-900">{t.profileEdit}</h2>
        <button type="button" onClick={() => setTab("home")} className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1">
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
              <img src={avatarPreview} alt="preview" className="w-28 h-28 rounded-3xl object-cover ring-4 ring-[#0071e3]/20 shadow-lg" />
            ) : isRealAvatar(profileForm.avatar_url) ? (
              <img src={profileForm.avatar_url} alt={t.tabProfile} className="w-28 h-28 rounded-3xl object-cover ring-4 ring-[#0071e3]/20 shadow-lg" />
            ) : (
              <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${getAvatarGradient(profileForm.avatar_url, user?.id)} flex items-center justify-center text-5xl font-black text-white shadow-lg`}>
                {profileForm.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#0071e3] hover:bg-[#0077ed] flex items-center justify-center cursor-pointer shadow-lg border-2 border-white transition-colors">
              <span className="text-white text-xl leading-none font-bold select-none">+</span>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="text-xs text-neutral-400">{t.avatarLimit}</p>
          <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: 288 }}>
            {AVATAR_GRADIENTS.map((gradient, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleGradientSelect(idx)}
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0 transition-all duration-150 ${
                  profileForm.avatar_url === `gradient:${idx}` && !avatarPreview
                    ? "ring-2 ring-offset-2 ring-[#0071e3] scale-110 shadow-md"
                    : "opacity-70 hover:opacity-100 hover:scale-110"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">{t.nickname}</label>
              <input type="text" className="input-field" value={profileForm.display_name} maxLength={50}
                onChange={(e) => handleProfileChange("display_name", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">{t.nationality}</label>
              <select className="input-field" value={profileForm.nationality} onChange={(e) => handleProfileChange("nationality", e.target.value)}>
                <option value="">{t.select}</option>
                {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">{t.nativeLanguage}</label>
              <select className="input-field" value={profileForm.native_language} onChange={(e) => handleProfileChange("native_language", e.target.value)}>
                <option value="">{t.select}</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1.5">{t.learningLanguage}</label>
              <select className="input-field" value={profileForm.learning_language} onChange={(e) => handleProfileChange("learning_language", e.target.value)}>
                <option value="">{t.select}</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-1.5">{t.languageLevel}</label>
            <div className="flex gap-2">
              {["초급", "중급", "고급"].map((level) => (
                <button type="button" key={level} onClick={() => handleProfileChange("language_level", level)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    profileForm.language_level === level
                      ? "bg-[#0071e3] text-white"
                      : "bg-surface-muted text-neutral-600 hover:bg-neutral-100"
                  }`}>
                  {levelLabel(level)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-bold text-neutral-700">{t.isPublic}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{t.noPartnersDesc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profileForm.is_public}
              onClick={() => handleProfileChange("is_public", !profileForm.is_public)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                profileForm.is_public ? "bg-[#0071e3]" : "bg-[#d2d2d7]"
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
            <label className="block text-sm font-bold text-neutral-700 mb-2">{t.conversationGoalLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              {CONVERSATION_GOALS.map((goal) => (
                <button
                  type="button"
                  key={goal.value}
                  onClick={() => handleProfileChange("conversation_goal", goal.value)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                    profileForm.conversation_goal === goal.value
                      ? "bg-[#0071e3] text-white"
                      : "bg-surface-muted text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">{t.communicationStyleLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              {COMMUNICATION_STYLES.map((style) => (
                <button
                  type="button"
                  key={style.value}
                  onClick={() => handleProfileChange("communication_style", style.value)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                    profileForm.communication_style === style.value
                      ? "bg-[#0071e3] text-white"
                      : "bg-surface-muted text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-neutral-700">{t.openingQuestionLabel}</label>
              <span className={`text-[12px] ${profileForm.opening_question.length > 120 ? "text-[#0071e3]" : "text-neutral-400"}`}>
                {profileForm.opening_question.length}/140
              </span>
            </div>
            <input
              type="text"
              className="input-field"
              value={profileForm.opening_question}
              maxLength={140}
              onChange={(e) => handleProfileChange("opening_question", e.target.value)}
              placeholder={t.openingQuestionPlaceholder}
            />
          </div>
        </div>

        <div className="card">
          <p className="text-sm font-bold text-neutral-700 mb-3">{t.pushNotifications}</p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-700">{t.pushMessages}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{
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
                  pushSubscribed ? "bg-[#0071e3]" : "bg-[#d2d2d7]"
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
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-neutral-700">{t.interests}</label>
            <span className={`text-[12px] font-semibold ${profileForm.interests.length >= MAX_INTERESTS ? "text-[#0071e3]" : "text-neutral-400"}`}>
              {profileForm.interests.length}/{MAX_INTERESTS}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button type="button" key={interest} onClick={() => toggleInterest(interest)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 ${
                  profileForm.interests.includes(interest)
                    ? "bg-[#0071e3] text-white"
                    : profileForm.interests.length >= MAX_INTERESTS
                      ? "bg-surface-muted text-neutral-300 cursor-not-allowed"
                      : "bg-surface-muted text-neutral-600 hover:bg-neutral-100"
                }`}>
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-bold text-neutral-700">{t.bio}</label>
            <span className={`text-[12px] ${profileForm.bio.length > 450 ? "text-[#0071e3]" : "text-neutral-400"}`}>
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

      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-neutral-400">
        <button onClick={() => navigate("/terms")} className="hover:text-neutral-600 underline">{t.termsLink}</button>
        <span>·</span>
        <button onClick={() => navigate("/privacy")} className="hover:text-neutral-600 underline">{t.privacyLink}</button>
      </div>

      <div className="pt-2 text-center">
        <button type="button" onClick={() => setShowDeleteModal(true)} className="text-xs text-neutral-300 hover:text-[#0071e3] underline transition-colors">
          {t.deleteAccountBtn}
        </button>
      </div>
    </div>
  );

  const NAV_TABS = [
    { key: "home", label: t.tabHome },
    { key: "swipe", label: t.tabSwipeShort },
    { key: "community", label: t.tabCommunity },
    { key: "chatlist", label: t.tabChat, badge: totalUnread },
    { key: "favorites", label: t.tabFavorites },
    { key: "profile", label: t.tabProfileShort },
  ];

  return (
    <div className="min-h-screen bg-surface-bg pb-24">
      <Helmet><title>KoriBridge - {t.homeTitle}</title></Helmet>

      {/* ── 상단 헤더 ── */}
      <div className="bg-white border-b border-neutral-150 shadow-nav px-5 pt-4 pb-3 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <h1 className="text-base font-bold text-neutral-900 tracking-tight">{t.homeTitle}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageSelector />
            <button type="button" onClick={toggleDarkMode}
              className="w-9 h-9 rounded-lg bg-surface-bg hover:bg-surface-muted flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors">
              {darkMode ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
              )}
            </button>
            <button type="button" onClick={signOut}
              className="h-9 px-3 rounded-lg bg-surface-bg hover:bg-surface-muted text-xs text-neutral-500 font-semibold hover:text-neutral-900 transition-colors border border-neutral-200">
              {t.logout}
            </button>
          </div>
        </div>

        {tab === "home" && (
          <div className="mt-3 relative max-w-6xl mx-auto">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
            <input
              type="text"
              className="w-full pl-10 pr-9 h-10 rounded-xl bg-surface-bg border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]/10 transition-all"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-200 text-neutral-500 text-xs flex items-center justify-center hover:bg-neutral-300 transition-colors">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
        {tab === "community" && (
          <CommunityPage currentUser={myProfile} blockedIds={blockedIds} />
        )}
      </div>

      {/* ── 하단 탭바 ── */}
      <div ref={bottomNavRef} className="fixed inset-x-0 bottom-0 bg-white border-t border-neutral-150 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        <nav className="mx-auto flex max-w-6xl items-stretch justify-around px-1 h-[60px]">
          {NAV_TABS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-150 ${active ? "text-[#0071e3]" : "text-[#86868b] hover:text-[#1d1d1f]"}`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#0071e3] rounded-b-full" />
                )}
                <span className="transition-colors duration-150">
                  {NAV_ICONS[item.key]}
                </span>
                <span className={`text-[10px] font-semibold leading-none transition-colors duration-150`}>
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="absolute top-2 right-[calc(50%-16px)] min-w-[16px] h-4 px-1 rounded-full bg-[#0071e3] text-[9px] text-white flex items-center justify-center font-bold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-900/40 backdrop-blur-sm px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-modal p-6 w-full max-w-sm border border-neutral-100">
            <h3 className="text-base font-bold text-neutral-900 mb-0.5">{reportModal.displayName}</h3>
            <p className="text-sm text-neutral-500 mb-4">{t.reportOrBlock}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.reportReason}</label>
                <textarea rows={3} className="input-field resize-none text-sm"
                  value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                  placeholder={t.reportReasonPlaceholder} />
              </div>
              <button type="button" onClick={submitReport} disabled={reportLoading || !reportReason.trim()}
                className="w-full rounded-xl bg-amber-500 text-white py-3 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors">
                {reportLoading ? t.reporting : t.reportBtn}
              </button>
              <button type="button"
                onClick={() => setBlockConfirm({ targetId: reportModal.profileId, displayName: reportModal.displayName })}
                className="w-full rounded-full bg-[#0071e3] text-white py-3 text-[13px] font-semibold hover:bg-[#0077ed] transition-colors">
                {t.blockBtn}
              </button>
              <button type="button" onClick={() => { setReportModal(null); setReportReason(""); }}
                className="w-full rounded-xl bg-surface-muted border border-neutral-200 text-neutral-600 py-3 text-sm font-semibold hover:bg-neutral-100 transition-colors">
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

      {isFilterModalOpen && (
        <AdvancedFiltersModal
          languages={LANGUAGES}
          nationalities={nationalities}
          filters={{
            nationalityFilter,
            languageFilter,
            nativeLangFilter,
            levelFilter,
            interestFilter,
            verifiedOnly: verifiedOnlyFilter,
          }}
          onApply={(f) => {
            setNationalityFilter(f.nationalityFilter);
            setLanguageFilter(f.languageFilter);
            setNativeLangFilter(f.nativeLangFilter);
            setLevelFilter(f.levelFilter);
            setInterestFilter(f.interestFilter);
            setVerifiedOnlyFilter(f.verifiedOnly);
          }}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}
    </div>
  );
}
