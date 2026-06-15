import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import DeleteAccountModal from "../components/DeleteAccountModal";
import ProfileCard from "../components/ProfileCard";
import ProfileSkeleton from "../components/ProfileSkeleton";
import ProfileFilters from "../components/ProfileFilters";
import ConversationItem from "../components/ConversationItem";
import StatsBanner from "../components/StatsBanner";
import ConfirmModal from "../components/ConfirmModal";
import { getMatchScore } from "../utils/matching";

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어", "일본어", "기타",
];

const NATIONALITIES = [
  "한국", "미국", "영국", "캐나다", "호주", "베트남", "태국", "필리핀",
  "인도네시아", "말레이시아", "카자흐스탄", "우즈베키스탄", "중국", "일본", "기타",
];

const INTERESTS = ["K-pop", "한국 음식", "여행", "드라마", "언어 교환", "게임", "영화", "스포츠"];

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const onlineIds = useOnlineUsers(user?.id);
  const { darkMode, toggleDarkMode } = useTheme();

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
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [reportModal, setReportModal] = useState(null); // { profileId, displayName }
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState(null); // { targetId, displayName }
  const [loadError, setLoadError] = useState(false);
  const [loadRetryKey, setLoadRetryKey] = useState(0);

  const notifGranted = useRef(false);
  const bottomNavRef = useRef(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        notifGranted.current = perm === "granted";
      });
    } else if (Notification.permission === "granted") {
      notifGranted.current = true;
    }
  }, []);

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
          .select("id, display_name, nationality, native_language, learning_language, language_level, avatar_url, bio, interests")
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
        .select("id, display_name, nationality, native_language, learning_language, language_level, avatar_url, bio, interests")
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
          if (new Date(message.created_at) > new Date(current.lastMessage.created_at)) {
            current.lastMessage = message;
          }
          if (message.receiver_id === user.id && !message.read_at) current.unreadCount += 1;
          byPartner.set(partnerId, current);
        });

        const partnerIds = Array.from(byPartner.keys());
        if (partnerIds.length > 0) {
          const { data: partnerProfiles } = await supabase
            .from("profiles")
            .select("id, display_name, nationality, native_language, learning_language, language_level, avatar_url, bio, interests")
            .in("id", partnerIds);
          const partnerMap = new Map(partnerProfiles?.map((p) => [p.id, p]));
          const sorted = Array.from(byPartner.values())
            .map((item) => ({
              ...item,
              partner: partnerMap.get(item.partnerId) || { id: item.partnerId, display_name: "알 수 없는 사용자" },
            }))
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
  }, [user, loadRetryKey]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("home-messages")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        const msg = payload.new;
        if (notifGranted.current && document.visibilityState !== "visible") {
          new Notification("KoriBridge 새 메시지", { body: msg.content, icon: "/favicon.ico" });
        }
        setConversations((prev) => {
          const partnerId = msg.sender_id;
          const existing = prev.find((c) => c.partnerId === partnerId);
          if (existing) {
            return prev.map((c) =>
              c.partnerId === partnerId ? { ...c, lastMessage: msg, unreadCount: c.unreadCount + 1 } : c
            );
          }
          return prev;
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

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
        if (
          !p.display_name?.toLowerCase().includes(q) &&
          !p.nationality?.toLowerCase().includes(q) &&
          !p.native_language?.toLowerCase().includes(q) &&
          !p.learning_language?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [profiles, nationalityFilter, languageFilter, levelFilter, blockedIds, searchQuery]);

  // 필터 변경 시 visibleCount 초기화
  useEffect(() => {
    setVisibleCount(12);
  }, [nationalityFilter, languageFilter, levelFilter, searchQuery]);

  // 모바일 키보드가 올라올 때 하단 네비게이션을 키보드 위로 올림
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      if (bottomNavRef.current) {
        bottomNavRef.current.style.bottom = `${offset}px`;
      }
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  const handleProfileChange = (field, value) => setProfileForm((prev) => ({ ...prev, [field]: value }));

  const toggleInterest = (interest) => {
    setProfileForm((prev) => {
      const has = prev.interests.includes(interest);
      return { ...prev, interests: has ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest] };
    });
  };

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setProfileError("JPG, PNG, WebP 파일만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) { setProfileError("사진 크기는 2MB 이하여야 합니다."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileError("");
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
    if (!profileForm.display_name.trim()) return setProfileError("이름을 입력해 주세요.");
    if (profileForm.display_name.trim().length > 50) return setProfileError("닉네임은 50자 이하여야 합니다.");
    if (!profileForm.nationality) return setProfileError("국적을 선택해 주세요.");
    if (!profileForm.native_language) return setProfileError("모국어를 선택해 주세요.");
    if (!profileForm.learning_language) return setProfileError("배우고 싶은 언어를 선택해 주세요.");
    if (profileForm.bio.length > 500) return setProfileError("자기소개는 500자 이하여야 합니다.");
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
      });
      if (error) throw error;
      setTab("home");
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, nationality, native_language, learning_language, avatar_url, bio, interests")
        .neq("id", user.id)
        .order("created_at", { ascending: false });
      if (data) setProfiles(data);
    } catch {
      setProfileError("저장 중 오류가 발생했습니다.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleToggleFavorite = useCallback(async (profile) => {
    if (!user?.id) return;
    const isFav = favoriteIds.has(profile.id);
    if (isFav) {
      const { error } = await supabase.from("favorites").delete().match({ user_id: user.id, partner_id: profile.id });
      if (error) { showToast("즐겨찾기 해제에 실패했습니다.", "error"); return; }
      setFavoriteIds((prev) => { const next = new Set(prev); next.delete(profile.id); return next; });
      setFavorites((prev) => prev.filter((item) => item.id !== profile.id));
    } else {
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, partner_id: profile.id });
      if (error) { showToast("즐겨찾기 추가에 실패했습니다.", "error"); return; }
      setFavoriteIds((prev) => new Set(prev).add(profile.id));
      setFavorites((prev) => [...prev, profile]);
    }
  }, [user?.id, favoriteIds, showToast]);

  const handleReport = useCallback((profileId, displayName) => {
    setReportModal({ profileId, displayName });
  }, []);

  const blockUser = async () => {
    if (!blockConfirm) return;
    const { targetId, displayName } = blockConfirm;
    const { error } = await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: targetId });
    if (error && error.code !== "23505") {
      showToast("차단에 실패했습니다.", "error");
      setBlockConfirm(null);
      return;
    }
    setBlockedIds((prev) => [...prev, targetId]);
    setBlockConfirm(null);
    setReportModal(null);
    showToast(`${displayName} 님을 차단했습니다.`, "success");
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
    if (error) { showToast("신고 접수에 실패했습니다.", "error"); return; }
    setReportModal(null);
    setReportReason("");
    showToast("신고가 접수되었습니다.", "success");
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const renderHomeContent = () => (
    <div className="space-y-8">
      {myProfile && (
        <div className="card p-5 flex items-center justify-between bg-gradient-to-r from-red-50 to-rose-50 border-red-100/60">
          <div className="flex items-center gap-4">
            {myProfile.avatar_url ? (
              <img src={myProfile.avatar_url} alt="내 프로필" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-red-100" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-xl font-bold text-white shadow-sm">
                {myProfile.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="font-extrabold text-gray-900">{myProfile.display_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {myProfile.nationality} · {myProfile.native_language} → {myProfile.learning_language}
              </p>
            </div>
          </div>
          <button onClick={() => setTab("profile")} className="btn-secondary px-4 py-2 text-sm w-auto">
            프로필 수정
          </button>
        </div>
      )}

      <StatsBanner onlineCount={onlineIds.size} total={stats.total} today={stats.today} />

      {recommendedProfiles.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-extrabold text-gray-900">AI 추천 파트너</span>
            <span className="text-xs bg-gradient-to-r from-red-600 to-rose-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">✨ 추천</span>
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
        <p className="text-base font-extrabold text-gray-900 mb-4">전체 파트너 <span className="text-rose-500">({filteredProfiles.length}명)</span></p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profilesLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ProfileSkeleton key={i} />)
          ) : loadError ? (
            <div className="card text-center py-20 col-span-full">
              <p className="text-4xl mb-4">📡</p>
              <p className="text-gray-900 font-semibold">데이터를 불러오지 못했습니다</p>
              <p className="text-sm text-gray-500 mt-1">네트워크 연결을 확인해 주세요.</p>
              <button
                onClick={() => setLoadRetryKey((k) => k + 1)}
                className="mt-5 btn-primary px-6 py-2.5 text-sm"
              >
                다시 시도
              </button>
            </div>
          ) : filteredProfiles.length === 0 ? (
            nationalityFilter || languageFilter || levelFilter || searchQuery.trim() ? (
              <div className="card text-center py-20 col-span-full border-dashed border-2">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-700 font-semibold">조건에 맞는 파트너가 없어요</p>
                <p className="text-xs text-gray-400 mt-1">필터를 변경하거나 검색어를 다르게 입력해보세요.</p>
                <button
                  onClick={() => { setSearchQuery(""); setNationalityFilter(""); setLanguageFilter(""); setLevelFilter(""); }}
                  className="mt-6 inline-flex items-center gap-1.5 text-red-600 text-sm font-bold hover:underline"
                >
                  필터 초기화하기
                </button>
              </div>
            ) : (
              <div className="card text-center py-20 col-span-full">
                <div className="text-5xl mb-4">🌏</div>
                <p className="text-gray-900 font-semibold text-lg">아직 등록된 파트너가 없어요</p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  프로필을 공개로 설정하면<br />더 많은 파트너를 만날 수 있어요.
                </p>
                <button
                  onClick={() => setTab("profile")}
                  className="mt-5 btn-primary px-6 py-2.5 text-sm"
                >
                  내 프로필 수정하기
                </button>
              </div>
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
            <button
              onClick={() => setVisibleCount(c => c + 12)}
              className="btn-secondary px-8 py-3 text-sm w-auto"
            >
              더 보기 ({filteredProfiles.length - visibleCount}명 더)
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderFavoritesContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">즐겨찾기</h2>
          <p className="text-sm text-gray-500">자주 연락하는 파트너를 모아보세요.</p>
        </div>
        {favorites.length > 0 && (
          <button type="button" onClick={() => setTab("home")} className="text-sm text-red-600 hover:text-red-700">
            더 많은 파트너 보기
          </button>
        )}
      </div>
      {favoritesLoading ? (
        Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="card animate-pulse h-44" />)
      ) : favorites.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">즐겨찾기에 추가한 파트너가 없습니다.</p>
          <button onClick={() => setTab("home")} className="mt-4 btn-primary px-6 py-2.5 text-sm">파트너 찾기</button>
        </div>
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
    <div className="space-y-4">
      {convoLoading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        ))
      ) : loadError ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">📡</p>
          <p className="text-gray-900 font-semibold">채팅 목록을 불러오지 못했습니다</p>
          <p className="text-sm text-gray-500 mt-1">네트워크 연결을 확인해 주세요.</p>
          <button
            onClick={() => setLoadRetryKey((k) => k + 1)}
            className="mt-5 btn-primary px-6 py-2.5 text-sm"
          >
            다시 시도
          </button>
        </div>
      ) : conversations.length === 0 ? (
        <div className="card text-center py-16 px-6">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-900 font-semibold text-lg">아직 나눈 대화가 없어요</p>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            관심 있는 파트너의 프로필에서<br />"대화 시작하기"를 눌러 첫 메시지를 보내보세요!
          </p>
          <button onClick={() => setTab("home")} className="mt-5 btn-primary px-6 py-2.5 text-sm">파트너 찾아보기</button>
        </div>
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
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">프로필 수정</h2>
        <button type="button" onClick={() => setTab("home")} className="text-sm text-gray-500 hover:text-gray-700">돌아가기</button>
      </div>
      <form onSubmit={saveProfile} className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {avatarPreview || profileForm.avatar_url ? (
              <img src={avatarPreview || profileForm.avatar_url} alt="프로필" className="w-24 h-24 rounded-full object-cover border-2 border-red-100" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-4xl font-bold text-red-400 border-2 border-red-100">
                {profileForm.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center cursor-pointer shadow">
              <span className="text-white text-lg leading-none">+</span>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="text-xs text-gray-400">JPG/PNG/WebP, 최대 2MB</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">닉네임</label>
            <input type="text" className="input-field" value={profileForm.display_name} maxLength={50}
              onChange={(e) => handleProfileChange("display_name", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">국적</label>
            <select className="input-field" value={profileForm.nationality} onChange={(e) => handleProfileChange("nationality", e.target.value)}>
              <option value="">선택</option>
              {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">모국어</label>
            <select className="input-field" value={profileForm.native_language} onChange={(e) => handleProfileChange("native_language", e.target.value)}>
              <option value="">선택</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">배우고 싶은 언어</label>
            <select className="input-field" value={profileForm.learning_language} onChange={(e) => handleProfileChange("learning_language", e.target.value)}>
              <option value="">선택</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">언어 수준</label>
          <select className="input-field" value={profileForm.language_level} onChange={(e) => handleProfileChange("language_level", e.target.value)}>
            {["초급", "중급", "고급"].map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="is_public_toggle" className="block text-sm font-semibold text-gray-700">프로필 공개</label>
          <input
            type="checkbox"
            id="is_public_toggle"
            checked={profileForm.is_public}
            onChange={(e) => handleProfileChange("is_public", e.target.checked)}
            className="toggle toggle-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">관심사</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button type="button" key={interest} onClick={() => toggleInterest(interest)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  profileForm.interests.includes(interest) ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-gray-700">자기소개</label>
            <span className={`text-xs ${profileForm.bio.length > 450 ? "text-red-500" : "text-gray-400"}`}>
              {profileForm.bio.length}/500
            </span>
          </div>
          <textarea rows={4} className="input-field resize-none" value={profileForm.bio} maxLength={500}
            onChange={(e) => handleProfileChange("bio", e.target.value)} placeholder="초급/중급/고급 수준을 포함해 주세요" />
        </div>

        {profileError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</div>
        )}

        <button type="submit" disabled={profileLoading || avatarUploading} className="btn-primary w-full py-3">
          {avatarUploading ? "사진 업로드 중..." : profileLoading ? "저장 중..." : "프로필 저장"}
        </button>
      </form>

      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-400">
        <button onClick={() => navigate("/terms")} className="hover:text-gray-600 underline">이용약관</button>
        <span>·</span>
        <button onClick={() => navigate("/privacy")} className="hover:text-gray-600 underline">개인정보처리방침</button>
      </div>

      <div className="pt-2 text-center">
        <button type="button" onClick={() => setShowDeleteModal(true)} className="text-xs text-gray-300 hover:text-red-400 underline">
          회원 탈퇴
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Helmet><title>KoriBridge - 파트너 찾기</title></Helmet>
      <div className="bg-gradient-to-r from-red-600 to-rose-500 px-5 py-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-red-100/80 font-medium">환영합니다, {user.email?.split("@")[0] || "사용자"}님</p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">KoriBridge</h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleDarkMode} className="text-sm text-white/70 hover:text-white transition">
              {darkMode ? "🌙" : "☀️"}
            </button>
            <button type="button" onClick={signOut} className="text-sm text-white/70 hover:text-white transition font-medium">로그아웃</button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            className="w-full pl-4 pr-10 h-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 text-sm font-medium focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-white/30 transition-all"
            placeholder="닉네임, 국적, 언어로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/30 text-white text-xs flex items-center justify-center hover:bg-white/40 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          {[
            { key: "home", label: "홈" },
            { key: "chatlist", label: "채팅", badge: totalUnread },
            { key: "favorites", label: "즐겨찾기" },
            { key: "profile", label: "내 프로필" },
          ].map((item) => (
            <button key={item.key} type="button" onClick={() => setTab(item.key)}
              className={`relative rounded-xl px-4 py-2 text-sm font-bold transition-all duration-150 ${
                tab === item.key ? "bg-white text-red-600 shadow-md" : "bg-white/20 text-white hover:bg-white/30"
              }`}>
              {item.label}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-red-500 text-[9px] text-red-600 flex items-center justify-center font-bold">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {tab === "home" && renderHomeContent()}
        {tab === "favorites" && renderFavoritesContent()}
        {tab === "chatlist" && renderChatListContent()}
        {tab === "profile" && renderProfileContent()}
      </div>

      <div ref={bottomNavRef} className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur-sm px-4 py-2 shadow-[0_-4px_24px_rgba(15,23,42,0.10)]">
        <nav className="mx-auto flex max-w-6xl items-center justify-around">
          {[
            { key: "home", label: "홈", icon: "🏠" },
            { key: "chatlist", label: "채팅", icon: "💬", badge: totalUnread },
            { key: "favorites", label: "즐겨찾기", icon: "⭐" },
            { key: "profile", label: "프로필", icon: "👤" },
          ].map((item) => (
            <button key={item.key} type="button" onClick={() => setTab(item.key)}
              className={`relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                tab === item.key ? "text-red-600" : "text-gray-400 hover:text-gray-600"
              }`}>
              <span className={`text-xl transition-transform duration-150 ${tab === item.key ? "scale-110" : ""}`}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-0.5 right-2.5 w-4 h-4 rounded-full bg-red-600 text-[9px] text-white flex items-center justify-center font-bold">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{reportModal.displayName}</h3>
            <p className="text-sm text-gray-500 mb-4">신고 또는 차단할 수 있습니다.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">신고 사유</label>
                <textarea
                  rows={3}
                  className="input-field resize-none text-sm"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="신고 사유를 입력해 주세요"
                />
              </div>
              <button
                type="button"
                onClick={submitReport}
                disabled={reportLoading || !reportReason.trim()}
                className="w-full rounded-2xl bg-yellow-500 text-white py-2.5 text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50"
              >
                {reportLoading ? "신고 중..." : "신고하기"}
              </button>
              <button
                type="button"
                onClick={() => setBlockConfirm({ targetId: reportModal.profileId, displayName: reportModal.displayName })}
                className="w-full rounded-2xl bg-red-600 text-white py-2.5 text-sm font-semibold hover:bg-red-700"
              >
                차단하기
              </button>
              <button
                type="button"
                onClick={() => { setReportModal(null); setReportReason(""); }}
                className="w-full rounded-2xl bg-gray-100 text-gray-700 py-2.5 text-sm font-semibold hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {blockConfirm && (
        <ConfirmModal
          message={`${blockConfirm.displayName} 님을 차단하시겠습니까?`}
          confirmLabel="차단하기"
          cancelLabel="취소"
          danger
          onConfirm={blockUser}
          onCancel={() => setBlockConfirm(null)}
        />
      )}

      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}
