import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import DeleteAccountModal from "../components/DeleteAccountModal";
import AnnouncementBanner from "../components/AnnouncementBanner";

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어", "일본어", "기타",
];

const NATIONALITIES = [
  "한국", "미국", "영국", "캐나다", "호주", "베트남", "태국", "필리핀",
  "인도네시아", "말레이시아", "카자흐스탄", "우즈베키스탄", "중국", "일본", "기타",
];

const INTERESTS = ["K-pop", "한국 음식", "여행", "드라마", "언어 교환", "게임", "영화", "스포츠"];

const getLanguageLevel = (profile) => {
  const text = (profile.bio || "").toLowerCase();
  if (text.includes("고급") || text.includes("advanced")) return "고급";
  if (text.includes("중급") || text.includes("intermediate")) return "중급";
  return "초급";
};

const formatTime = (value) => {
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
};

// AI 파트너 추천 점수 계산
function getMatchScore(me, other) {
  let score = 0;
  let reasons = [];

  // 언어 교환 매칭 (상대가 내 모국어를 배우고, 내가 상대 모국어를 배움)
  if (me.learning_language === other.native_language) {
    score += 50;
    reasons.push(`${other.native_language} 원어민`);
  }
  if (me.native_language === other.learning_language) {
    score += 30;
    reasons.push(`나의 ${me.native_language}를 배우고 싶어함`);
  }

  // 공통 관심사
  const commonInterests = (me.interests || []).filter((i) => (other.interests || []).includes(i));
  if (commonInterests.length > 0) {
    score += commonInterests.length * 10;
    reasons.push(`공통 관심사: ${commonInterests.slice(0, 2).join(", ")}`);
  }

  return { score, reason: reasons[0] || "관심사가 비슷해요" };
}

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const onlineIds = useOnlineUsers(user?.id);

  const [myProfile, setMyProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [tab, setTab] = useState("home");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [convoLoading, setConvoLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  // 프로필 수정 폼
  const [profileForm, setProfileForm] = useState({
    display_name: "", nationality: "", native_language: "",
    learning_language: "", bio: "", avatar_url: "", interests: [],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // 신고/차단 모달
  const [reportModal, setReportModal] = useState(null); // { profileId, displayName }
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 알림 권한
  const notifGranted = useRef(false);

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
      // 내 프로필
      const { data: me } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (me) {
        setMyProfile(me);
        setProfileForm({
          display_name: me.display_name || "",
          nationality: me.nationality || "",
          native_language: me.native_language || "",
          learning_language: me.learning_language || "",
          bio: me.bio || "",
          avatar_url: me.avatar_url || "",
          interests: me.interests || [],
        });
      }

      // 차단 목록
      const { data: blocks } = await supabase
        .from("blocked_users")
        .select("blocked_id")
        .eq("blocker_id", user.id);
      const bIds = (blocks || []).map((b) => b.blocked_id);
      setBlockedIds(bIds);

      // 파트너 목록
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, nationality, native_language, learning_language, avatar_url, bio, interests")
        .neq("id", user.id)
        .order("created_at", { ascending: false });
      if (!profilesError) setProfiles(allProfiles || []);
      setProfilesLoading(false);

      // 대화 목록
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
          if (message.receiver_id === user.id && !message.read_at) {
            current.unreadCount += 1;
          }
          byPartner.set(partnerId, current);
        });

        const partnerIds = Array.from(byPartner.keys());
        if (partnerIds.length > 0) {
          const { data: partnerProfiles } = await supabase
            .from("profiles")
            .select("id, display_name, nationality, native_language, learning_language, avatar_url, bio, interests")
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
    };

    loadAll();
  }, [user]);

  // 실시간 메시지 수신 → 브라우저 알림
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("home-messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${user.id}`,
      }, (payload) => {
        const msg = payload.new;
        // 브라우저 알림
        if (notifGranted.current && document.visibilityState !== "visible") {
          new Notification("KoriBridge 새 메시지", {
            body: msg.content,
            icon: "/favicon.ico",
          });
        }
        // 대화 목록 업데이트
        setConversations((prev) => {
          const partnerId = msg.sender_id;
          const existing = prev.find((c) => c.partnerId === partnerId);
          if (existing) {
            return prev.map((c) =>
              c.partnerId === partnerId
                ? { ...c, lastMessage: msg, unreadCount: c.unreadCount + 1 }
                : c
            );
          }
          return prev;
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // AI 추천 파트너 (상위 3명)
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
  }, [profiles, nationalityFilter, languageFilter, blockedIds, searchQuery]);

  // 프로필 수정
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
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("사진 크기는 2MB 이하여야 합니다.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
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
    if (!profileForm.nationality) return setProfileError("국적을 선택해 주세요.");
    if (!profileForm.native_language) return setProfileError("모국어를 선택해 주세요.");
    if (!profileForm.learning_language) return setProfileError("배우고 싶은 언어를 선택해 주세요.");

    setProfileLoading(true);
    try {
      const avatar_url = await uploadAvatar();
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: profileForm.display_name.trim(),
        nationality: profileForm.nationality,
        native_language: profileForm.native_language,
        learning_language: profileForm.learning_language,
        bio: profileForm.bio.trim(),
        avatar_url: avatar_url || "",
        interests: profileForm.interests,
      });
      if (error) throw error;
      setTab("home");
      // 프로필 목록 갱신
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

  // 차단
  const blockUser = async (targetId, displayName) => {
    if (!window.confirm(`${displayName} 님을 차단하시겠습니까?`)) return;
    await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: targetId });
    setBlockedIds((prev) => [...prev, targetId]);
    setReportModal(null);
  };

  // 신고
  const submitReport = async () => {
    if (!reportModal || !reportReason.trim()) return;
    setReportLoading(true);
    await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: reportModal.profileId,
      reason: reportReason.trim(),
    });
    setReportLoading(false);
    setReportModal(null);
    setReportReason("");
    alert("신고가 접수되었습니다.");
  };

  // 프로필 카드 컴포넌트
  const ProfileCard = ({ profile, showActions = true }) => {
    const level = getLanguageLevel(profile);
    const isOnline = onlineIds.has(profile.id);
    const levelColor = { 고급: "bg-blue-50 text-blue-700", 중급: "bg-yellow-50 text-yellow-700", 초급: "bg-green-50 text-green-700" };
    return (
      <div className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-16 h-16 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-2xl text-red-600 border border-gray-200 font-bold">
                {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <span className={`absolute -bottom-0.5 right-0 h-4 w-4 rounded-full border-2 border-white ${isOnline ? "bg-emerald-400" : "bg-gray-300"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-lg font-bold text-gray-900 truncate">{profile.display_name}</p>
                <p className="text-sm text-gray-500">{profile.nationality}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColor[level]}`}>{level}</span>
                {showActions && (
                  <button
                    type="button"
                    onClick={() => setReportModal({ profileId: profile.id, displayName: profile.display_name })}
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
            </div>
            {profile.bio && <p className="mt-3 text-sm text-gray-500 line-clamp-2">{profile.bio}</p>}
            {profile.reason && (
              <p className="mt-2 text-xs text-red-600 font-medium">추천 이유: {profile.reason}</p>
            )}
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={() => navigate(`/profile/${profile.id}`)} className="btn-secondary flex-1 py-2.5 text-sm">
            프로필 보기
          </button>
          <button type="button" onClick={() => navigate(`/chat/${profile.id}`)} className="btn-primary flex-1 py-2.5 text-sm">
            채팅하기
          </button>
        </div>
      </div>
    );
  };

  const renderHomeContent = () => (
    <div className="space-y-8">
      <AnnouncementBanner />
      {/* AI 추천 파트너 */}
      {recommendedProfiles.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base font-bold text-gray-900">AI 추천 파트너</span>
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">NEW</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-sm font-semibold text-gray-700 mb-4">파트너 필터</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-gray-600">국적</label>
            <select className="input-field mt-1" value={nationalityFilter} onChange={(e) => setNationalityFilter(e.target.value)}>
              <option value="">전체</option>
              {[...new Set(profiles.map((p) => p.nationality))].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">배우고 싶은 언어</label>
            <select className="input-field mt-1" value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
              <option value="">전체</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 파트너 목록 */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-4">전체 파트너 ({filteredProfiles.length}명)</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profilesLoading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="card animate-pulse h-60" />)
          ) : filteredProfiles.length === 0 ? (
            <div className="card text-center py-16 col-span-full">
              <p className="text-gray-500">필터에 맞는 파트너가 없습니다.</p>
            </div>
          ) : (
            filteredProfiles.map((profile) => <ProfileCard key={profile.id} profile={profile} />)
          )}
        </div>
      </div>
    </div>
  );

  const renderChatListContent = () => (
    <div className="space-y-4">
      {convoLoading ? (
        Array.from({ length: 4 }).map((_, i) => <div key={i} className="card animate-pulse h-28" />)
      ) : conversations.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">아직 나눈 대화가 없습니다.</p>
          <button onClick={() => setTab("home")} className="mt-4 btn-primary px-6 py-2.5 text-sm">파트너 찾기</button>
        </div>
      ) : (
        conversations.map((conv) => (
          <div key={conv.partnerId} className="card p-5 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {conv.partner.avatar_url ? (
                  <img src={conv.partner.avatar_url} alt={conv.partner.display_name} className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-600 border border-gray-200">
                    {conv.partner.display_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="absolute -bottom-0.5 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{conv.partner.display_name}</p>
                    <p className="text-xs text-gray-500">{conv.partner.nationality}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatTime(conv.lastMessage.created_at)}</p>
                    {conv.unreadCount > 0 && (
                      <span className="mt-1 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white min-w-[20px]">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {conv.lastMessage.sender_id === user.id && (
                    <span className={`text-xs ${conv.lastMessage.read_at ? "text-blue-500" : "text-gray-300"}`}>
                      {conv.lastMessage.read_at ? "✓✓" : "✓"}
                    </span>
                  )}
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/chat/${conv.partnerId}`)}
              className="mt-4 btn-primary w-full py-2.5 text-sm"
            >
              대화 이어가기
            </button>
          </div>
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
        {/* 사진 업로드 */}
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
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="text-xs text-gray-400">JPG/PNG, 최대 2MB</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">닉네임</label>
            <input type="text" className="input-field" value={profileForm.display_name} onChange={(e) => handleProfileChange("display_name", e.target.value)} />
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">관심사</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button type="button" key={interest} onClick={() => toggleInterest(interest)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${profileForm.interests.includes(interest) ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">자기소개</label>
          <textarea rows={4} className="input-field resize-none" value={profileForm.bio} onChange={(e) => handleProfileChange("bio", e.target.value)} placeholder="초급/중급/고급 수준을 포함해 주세요" />
        </div>

        {profileError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</div>
        )}

        <button type="submit" disabled={profileLoading || avatarUploading} className="btn-primary w-full py-3">
          {avatarUploading ? "사진 업로드 중..." : profileLoading ? "저장 중..." : "프로필 저장"}
        </button>
      </form>

      {/* 약관 링크 */}
      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-400">
        <button onClick={() => navigate("/terms")} className="hover:text-gray-600 underline">이용약관</button>
        <span>·</span>
        <button onClick={() => navigate("/privacy")} className="hover:text-gray-600 underline">개인정보처리방침</button>
      </div>

      {/* 회원 탈퇴 */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="text-xs text-gray-300 hover:text-red-400 underline"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">환영합니다, {user.email?.split("@")[0] || "사용자"}님</p>
            <h1 className="text-2xl font-extrabold text-gray-900">KoriBridge</h1>
          </div>
          <button type="button" onClick={signOut} className="text-sm text-gray-400 hover:text-gray-600">로그아웃</button>
        </div>
        {/* 검색창 */}
        <input
          type="text"
          className="input-field text-sm"
          placeholder="닉네임, 국적, 언어로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* 탭 */}
        <div className="flex gap-2 mt-3">
          {[{ key: "home", label: "홈" }, { key: "chatlist", label: "채팅", badge: totalUnread }, { key: "profile", label: "내 프로필" }].map((item) => (
            <button key={item.key} type="button" onClick={() => setTab(item.key)}
              className={`relative rounded-2xl px-4 py-2 text-sm font-semibold transition ${tab === item.key ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              {item.label}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 border-2 border-white text-[9px] text-white flex items-center justify-center font-bold">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {tab === "home" && renderHomeContent()}
        {tab === "chatlist" && renderChatListContent()}
        {tab === "profile" && renderProfileContent()}
      </div>

      {/* 하단 네비게이션 */}
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-1px_15px_rgba(15,23,42,0.08)]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          {[{ key: "home", label: "홈", icon: "🏠" }, { key: "chatlist", label: "채팅", icon: "💬", badge: totalUnread }, { key: "profile", label: "프로필", icon: "👤" }].map((item) => (
            <button key={item.key} type="button" onClick={() => setTab(item.key)}
              className={`relative flex-1 flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition ${tab === item.key ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
              {item.badge > 0 && (
                <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-white border border-red-600 text-[9px] text-red-600 flex items-center justify-center font-bold">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 신고/차단 모달 */}
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
                onClick={() => blockUser(reportModal.profileId, reportModal.displayName)}
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

      {/* 회원 탈퇴 모달 */}
      {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  );
}
