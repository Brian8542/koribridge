import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import ConfirmModal from "../components/ConfirmModal";
import { getLanguageLevel } from "../utils/languageLevel";
import { getMatchPercentage } from "../utils/matching";
import { formatRelativeTime } from "../utils/formatters";

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

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error: fetchError } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (fetchError) {
        setError("프로필을 불러오는 중 오류가 발생했습니다.");
      } else {
        setProfile(data);
      }

      if (user?.id) {
        const { data: block } = await supabase
          .from("blocked_users").select("id")
          .eq("blocker_id", user.id).eq("blocked_id", id).maybeSingle();
        setIsBlocked(!!block);
      }

      setLoading(false);
    };
    load();
  }, [id, user]);

  const confirmBlock = async () => {
    setBlockConfirm(false);
    if (isBlocked) {
      const { error: err } = await supabase.from("blocked_users").delete().eq("blocker_id", user.id).eq("blocked_id", id);
      if (err) { setError("차단 해제에 실패했습니다."); return; }
      setIsBlocked(false);
    } else {
      const { error: err } = await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: id });
      if (err && err.code !== "23505") { setError("차단에 실패했습니다."); return; }
      setIsBlocked(true);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    setReportLoading(true);
    const { error: err } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_id: id,
      reason: reportReason.trim().slice(0, 1000),
    });
    setReportLoading(false);
    if (err) { setError("신고 접수에 실패했습니다."); return; }
    setReportDone(true);
    setReportReason("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">프로필 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="card p-8 max-w-md w-full text-center shadow-md">
          <p className="text-red-600 font-semibold">{error || "프로필을 찾을 수 없습니다."}</p>
          <button onClick={() => navigate(-1)} className="mt-6 btn-secondary">뒤로 가기</button>
        </div>
      </div>
    );
  }

  const level = getLanguageLevel(profile);
  const isOnline = onlineIds.has(profile.id);
  const matchPercentage = getMatchPercentage(myProfile, profile);
  const lastActive = formatRelativeTime(profile.updated_at || profile.created_at);
  const commonInterests = (myProfile?.interests || []).filter((i) => (profile.interests || []).includes(i));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Helmet><title>KoriBridge - {profile.display_name || "프로필"}</title></Helmet>

      {/* 히어로 */}
      <div className="relative bg-gradient-to-br from-red-600 via-rose-500 to-pink-400 px-6 pt-14 pb-20 overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white/80 hover:text-white text-sm font-semibold transition z-10"
        >
          ← 뒤로
        </button>
        <button
          onClick={() => setReportModal(true)}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-sm transition z-10"
        >
          신고
        </button>

        <div className="relative z-10">
          <div className="relative inline-block">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-28 h-28 rounded-3xl object-cover border-4 border-white/30 shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-3xl bg-white/20 border-4 border-white/30 flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
                {profile.display_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white shadow ${
                isOnline ? "bg-emerald-400" : "bg-gray-300"
              }`}
            />
          </div>

          <h1 className="text-2xl font-extrabold text-white mt-4">{profile.display_name}</h1>
          <p className="text-white/70 text-sm mt-0.5">{profile.nationality}</p>
          <p className={`text-sm mt-1 font-semibold ${isOnline ? "text-emerald-300" : "text-white/50"}`}>
            {isOnline ? "● 현재 온라인" : lastActive}
          </p>

          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${LEVEL_STYLE[level] || "bg-white/20 text-white"}`}>
              {level}
            </span>
            {matchPercentage > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-red-600 shadow-sm">
                매칭 {matchPercentage}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 카드 (히어로 위로 겹침) */}
      <div className="px-4 -mt-10 max-w-lg mx-auto space-y-4">

        {/* 언어 + 매칭 */}
        <div className="card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3.5">
              <p className="text-xs text-gray-400 mb-1 font-medium">모국어</p>
              <p className="text-sm font-bold text-gray-800">{profile.native_language}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-3.5">
              <p className="text-xs text-gray-400 mb-1 font-medium">배우고 싶은 언어</p>
              <p className="text-sm font-bold text-red-700">{profile.learning_language}</p>
            </div>
          </div>

          {matchPercentage > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-semibold">매칭 점수</span>
                <span className="text-red-600 font-extrabold">{matchPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 관심사 */}
        {profile.interests?.length > 0 && (
          <div className="card p-5">
            <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">관심사</p>
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
                  <span className="font-bold">{profile.display_name}</span> 님과
                  <span className="text-red-600 font-bold"> {commonInterests.length}개</span>의 공통 관심사!
                </p>
              </div>
            )}
          </div>
        )}

        {/* 자기소개 */}
        {profile.bio && (
          <div className="card p-5">
            <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">자기소개</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* CTA 버튼 */}
        <button
          onClick={() => navigate(`/chat/${profile.id}`)}
          className="btn-primary w-full py-4 text-base font-extrabold shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>💬</span>
          대화 시작하기
        </button>

        <button
          onClick={() => setBlockConfirm(true)}
          className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all ${
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white text-2xl font-bold">✓</span>
                </div>
                <p className="font-extrabold text-gray-900 mt-2">신고가 접수됐습니다.</p>
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
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">{profile.display_name} 신고</h3>
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
                    className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={reportLoading || !reportReason.trim()}
                    className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white text-sm font-bold disabled:opacity-50 hover:shadow-md transition-all"
                  >
                    {reportLoading ? "신고 중..." : "신고하기"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {blockConfirm && (
        <ConfirmModal
          message={isBlocked ? `${profile.display_name} 님의 차단을 해제하시겠습니까?` : `${profile.display_name} 님을 차단하시겠습니까?`}
          confirmLabel={isBlocked ? "차단 해제" : "차단하기"}
          cancelLabel="취소"
          danger={!isBlocked}
          onConfirm={confirmBlock}
          onCancel={() => setBlockConfirm(false)}
        />
      )}
    </div>
  );
}
