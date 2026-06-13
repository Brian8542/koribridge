import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useOnlineUsers } from "../hooks/useOnlineUsers";

const getLanguageLevel = (profile) => {
  const text = (profile.bio || "").toLowerCase();
  if (text.includes("고급") || text.includes("advanced")) return "고급";
  if (text.includes("중급") || text.includes("intermediate")) return "중급";
  return "초급";
};

export default function ProfileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const onlineIds = useOnlineUsers(user?.id);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("프로필을 불러오는 중 오류가 발생했습니다.");
      } else {
        setProfile(data);
      }

      // 차단 여부 확인
      if (user?.id) {
        const { data: block } = await supabase
          .from("blocked_users")
          .select("id")
          .eq("blocker_id", user.id)
          .eq("blocked_id", id)
          .maybeSingle();
        setIsBlocked(!!block);
      }

      setLoading(false);
    };
    load();
  }, [id, user]);

  const handleBlock = async () => {
    if (!window.confirm(`${profile.display_name} 님을 차단하시겠습니까?`)) return;
    if (isBlocked) {
      await supabase.from("blocked_users")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", id);
      setIsBlocked(false);
    } else {
      await supabase.from("blocked_users")
        .insert({ blocker_id: user.id, blocked_id: id });
      setIsBlocked(true);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setReportLoading(true);
    await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: id,
      reason: reportReason.trim(),
    });
    setReportLoading(false);
    setReportDone(true);
    setReportReason("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">프로필 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold">{error || "프로필을 찾을 수 없습니다."}</p>
          <button onClick={() => navigate(-1)} className="mt-6 btn-secondary">뒤로 가기</button>
        </div>
      </div>
    );
  }

  const level = getLanguageLevel(profile);
  const isOnline = onlineIds.has(profile.id);
  const levelColor = {
    고급: "bg-blue-50 text-blue-700",
    중급: "bg-yellow-50 text-yellow-700",
    초급: "bg-green-50 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">← 뒤로</button>
        <h1 className="font-bold text-lg text-gray-900">프로필 상세</h1>
        <button
          onClick={() => setReportModal(true)}
          className="text-sm text-gray-400 hover:text-red-500"
        >
          신고
        </button>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {/* 아바타 + 이름 */}
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-3xl font-bold text-red-600 border-2 border-gray-100">
                  {profile.display_name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <span className={`absolute -bottom-0.5 right-0 h-4 w-4 rounded-full border-2 border-white ${isOnline ? "bg-emerald-400" : "bg-gray-300"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-2xl font-bold text-gray-900">{profile.display_name}</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColor[level]}`}>{level}</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{profile.nationality}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isOnline ? "지금 온라인" : "오프라인"}
              </p>
            </div>
          </div>

          {/* 언어 정보 */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3">
              <p className="text-xs text-gray-400 mb-1">모국어</p>
              <p className="text-sm font-semibold text-gray-800">{profile.native_language}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-3">
              <p className="text-xs text-gray-400 mb-1">배우고 싶은 언어</p>
              <p className="text-sm font-semibold text-red-700">{profile.learning_language}</p>
            </div>
          </div>

          {/* 관심사 */}
          {profile.interests?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-gray-400 mb-2">관심사</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span key={interest} className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium">
                    #{interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 자기소개 */}
          {profile.bio && (
            <div className="mt-5">
              <p className="text-xs text-gray-400 mb-2">자기소개</p>
              <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <button
          onClick={() => navigate(`/chat/${profile.id}`)}
          className="btn-primary w-full py-3"
        >
          채팅하기
        </button>

        <button
          onClick={handleBlock}
          className={`w-full py-3 rounded-2xl text-sm font-semibold transition ${
            isBlocked
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          {isBlocked ? "차단 해제" : "차단하기"}
        </button>
      </div>

      {/* 신고 모달 */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
            {reportDone ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-3">✅</div>
                <p className="font-bold text-gray-900">신고가 접수됐습니다.</p>
                <p className="text-sm text-gray-500 mt-1">검토 후 조치하겠습니다.</p>
                <button
                  onClick={() => { setReportModal(false); setReportDone(false); }}
                  className="mt-5 btn-primary w-full py-2.5"
                >
                  확인
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{profile.display_name} 신고</h3>
                <p className="text-sm text-gray-500 mb-4">신고 사유를 입력해 주세요.</p>
                <textarea
                  rows={4}
                  className="input-field resize-none text-sm w-full"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="예: 부적절한 언어 사용, 스팸 등"
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => { setReportModal(false); setReportReason(""); }}
                    className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={reportLoading || !reportReason.trim()}
                    className="flex-1 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {reportLoading ? "신고 중..." : "신고하기"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
