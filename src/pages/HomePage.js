import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const LANGUAGES = [
  "한국어",
  "영어",
  "베트남어",
  "태국어",
  "필리핀어(타갈로그)",
  "인도네시아어",
  "말레이어",
  "카자흐어",
  "우즈베크어",
  "중국어",
  "일본어",
  "기타",
];

const getLanguageLevel = (profile) => {
  const text = (profile.bio || "").toLowerCase();
  if (text.includes("고급") || text.includes("advanced")) return "고급";
  if (text.includes("중급") || text.includes("intermediate")) return "중급";
  return "초급";
};

const formatTime = (value) => {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [tab, setTab] = useState("home");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [convoLoading, setConvoLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState({
    display_name: "",
    nationality: "",
    native_language: "",
    learning_language: "",
    bio: "",
    avatar_url: "",
    interests: [],
  });

  useEffect(() => {
    if (!user) return;
    const loadProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, nationality, native_language, learning_language, avatar_url, bio, interests")
        .neq("id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setProfiles(data || []);
      }
      setProfilesLoading(false);
    };

    const loadConversations = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!error) {
        const byPartner = new Map();
        data?.forEach((message) => {
          const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
          const current = byPartner.get(partnerId) || {
            partnerId,
            lastMessage: message,
            unreadCount: 0,
          };
          if (new Date(message.created_at) > new Date(current.lastMessage.created_at)) {
            current.lastMessage = message;
          }
          if (message.receiver_id === user.id) {
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

          const partnerMap = new Map(partnerProfiles?.map((profile) => [profile.id, profile]));
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

    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, nationality, native_language, learning_language, bio, avatar_url, interests")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfileForm({
          display_name: data.display_name || "",
          nationality: data.nationality || "",
          native_language: data.native_language || "",
          learning_language: data.learning_language || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          interests: data.interests || [],
        });
      }
    };

    loadProfiles();
    loadConversations();
    loadProfile();
  }, [user]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      if (nationalityFilter && profile.nationality !== nationalityFilter) return false;
      if (languageFilter && profile.learning_language !== languageFilter) return false;
      return true;
    });
  }, [profiles, nationalityFilter, languageFilter]);

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setProfileForm((prev) => {
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has ? prev.interests.filter((item) => item !== interest) : [...prev.interests, interest],
      };
    });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileLoading(true);

    if (!profileForm.display_name.trim()) {
      setProfileError("이름을 입력해 주세요.");
      setProfileLoading(false);
      return;
    }

    if (!profileForm.nationality) {
      setProfileError("국적을 선택해 주세요.");
      setProfileLoading(false);
      return;
    }

    if (!profileForm.native_language) {
      setProfileError("모국어를 선택해 주세요.");
      setProfileLoading(false);
      return;
    }

    if (!profileForm.learning_language) {
      setProfileError("배우고 싶은 언어를 선택해 주세요.");
      setProfileLoading(false);
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: profileForm.display_name.trim(),
      nationality: profileForm.nationality,
      native_language: profileForm.native_language,
      learning_language: profileForm.learning_language,
      bio: profileForm.bio.trim(),
      avatar_url: profileForm.avatar_url.trim(),
      interests: profileForm.interests,
    });

    setProfileLoading(false);
    if (error) {
      setProfileError("프로필 저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } else {
      setTab("home");
      setProfilesLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, nationality, native_language, learning_language, avatar_url, bio, interests")
        .neq("id", user.id)
        .order("created_at", { ascending: false });
      if (data) setProfiles(data || []);
      setProfilesLoading(false);
    }
  };

  const renderHomeContent = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_220px] items-end">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">파트너 필터</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-gray-600">국적</label>
              <select
                className="input-field mt-2"
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
              >
                <option value="">전체</option>
                {[...new Set(profiles.map((profile) => profile.nationality))].map((nation) => (
                  <option key={nation} value={nation}>{nation}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">배우고 싶은 언어</label>
              <select
                className="input-field mt-2"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
              >
                <option value="">전체</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-red-50 to-white p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-sm text-gray-500">파트너 매칭</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">더 빠르게 연결해 보세요</h2>
            <p className="mt-2 text-sm text-gray-500">
              국적과 언어를 선택해 관심 있는 파트너를 빠르게 만나보세요.
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>실시간 온라인 상태 표시</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {profilesLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card animate-pulse h-60" />
          ))
        ) : filteredProfiles.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-600">필터에 맞는 파트너가 없습니다.</p>
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <div key={profile.id} className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="relative">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.display_name} className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-2xl text-red-600 border border-gray-200">
                      {profile.display_name?.charAt(0) || "🙂"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{profile.display_name}</p>
                      <p className="text-sm text-gray-500">{profile.nationality}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] bg-red-50 text-red-700 px-3 py-1 rounded-full">
                      {getLanguageLevel(profile)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>
                      <strong className="text-gray-900">모국어:</strong> {profile.native_language}
                    </p>
                    <p>
                      <strong className="text-gray-900">학습언어:</strong> {profile.learning_language}
                    </p>
                  </div>
                  {profile.bio && <p className="mt-4 text-sm text-gray-600 line-clamp-3">{profile.bio}</p>}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${profile.id}`)}
                  className="btn-secondary w-full sm:w-auto px-5 py-3"
                >
                  프로필보기
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/chat/${profile.id}`)}
                  className="btn-primary w-full sm:w-auto px-5 py-3"
                >
                  채팅하기
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderChatListContent = () => (
    <div className="space-y-6">
      {convoLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card animate-pulse h-28" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-600">지금까지 나눈 채팅이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.partnerId}
              className="card p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {conversation.partner.avatar_url ? (
                    <img
                      src={conversation.partner.avatar_url}
                      alt={conversation.partner.display_name}
                      className="w-14 h-14 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl text-red-600 border border-gray-200">
                      {conversation.partner.display_name?.charAt(0) || "🙂"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{conversation.partner.display_name}</p>
                      <p className="text-sm text-gray-500">{conversation.partner.nationality}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatTime(conversation.lastMessage.created_at)}</p>
                      {conversation.unreadCount > 0 && (
                        <span className="mt-1 inline-flex items-center justify-center rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{conversation.lastMessage.content}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/chat/${conversation.partnerId}`)}
                className="mt-4 btn-primary w-full px-5 py-3"
              >
                대화 이어가기
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfileContent = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">내 프로필</p>
            <h2 className="text-2xl font-bold text-gray-900">프로필 수정</h2>
          </div>
          <button
            type="button"
            onClick={() => setTab("home")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            돌아가기
          </button>
        </div>

        <form onSubmit={saveProfile} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">닉네임</label>
              <input
                type="text"
                className="input-field"
                value={profileForm.display_name}
                onChange={(e) => handleProfileChange("display_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">프로필 사진 URL</label>
              <input
                type="text"
                className="input-field"
                placeholder="https://"
                value={profileForm.avatar_url}
                onChange={(e) => handleProfileChange("avatar_url", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">국적</label>
              <select
                className="input-field"
                value={profileForm.nationality}
                onChange={(e) => handleProfileChange("nationality", e.target.value)}
              >
                <option value="">선택해 주세요</option>
                {[...new Set(profiles.map((profile) => profile.nationality).concat(profileForm.nationality))]
                  .filter(Boolean)
                  .map((nation) => (
                    <option key={nation} value={nation}>{nation}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">모국어</label>
              <select
                className="input-field"
                value={profileForm.native_language}
                onChange={(e) => handleProfileChange("native_language", e.target.value)}
              >
                <option value="">선택해 주세요</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">배우고 싶은 언어</label>
              <select
                className="input-field"
                value={profileForm.learning_language}
                onChange={(e) => handleProfileChange("learning_language", e.target.value)}
              >
                <option value="">선택해 주세요</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">언어 수준</label>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {getLanguageLevel(profileForm)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">관심사</label>
            <div className="flex flex-wrap gap-2">
              {["K-pop", "한국 음식", "여행", "드라마", "언어 교환"].map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    profileForm.interests.includes(interest)
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">자기소개</label>
            <textarea
              rows={4}
              className="input-field resize-none"
              value={profileForm.bio}
              onChange={(e) => handleProfileChange("bio", e.target.value)}
            />
          </div>

          {profileError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {profileError}
            </div>
          )}

          <button type="submit" disabled={profileLoading} className="btn-primary w-full py-3">
            {profileLoading ? "저장 중..." : "프로필 저장"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">환영합니다, {user.email?.split("@")[0] || "사용자"}님</p>
            <h1 className="text-3xl font-bold text-gray-900">KoriBridge</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setTab("profile")}
              className="btn-secondary px-5 py-3"
            >
              내 프로필
            </button>
            <button
              type="button"
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {[
              { key: "home", label: "홈" },
              { key: "chatlist", label: "채팅 목록" },
              { key: "profile", label: "내 프로필" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  tab === item.key
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">
            모바일에 최적화된 UI로 빠르게 파트너를 찾으세요.
          </div>
        </div>

        {tab === "home" && renderHomeContent()}
        {tab === "chatlist" && renderChatListContent()}
        {tab === "profile" && renderProfileContent()}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-1px_15px_rgba(15,23,42,0.08)] sm:px-10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          {[
            { key: "home", label: "홈" },
            { key: "chatlist", label: "채팅" },
            { key: "profile", label: "프로필" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex-1 rounded-3xl px-3 py-3 text-sm font-semibold transition ${
                tab === item.key
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
