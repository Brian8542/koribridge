import React, { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { formatRelativeTime } from "../utils/formatters";

export default function AdminPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  // 개요 통계
  const [stats, setStats] = useState({ users: 0, todayUsers: 0, messages: 0, pendingReports: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // 신고 관리
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState("pending"); // "all" | "pending" | "resolved"

  // 사용자 관리
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  // 관리자 권한 확인
  useEffect(() => {
    if (!user) { setAuthLoading(false); return; }
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => {
        setIsAdmin(data?.is_admin === true);
        setAuthLoading(false);
      });
  }, [user]);

  // 통계 로드
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);

    const [
      { count: users },
      { count: todayUsers },
      { count: messages },
      { count: pendingReports },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString()),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    setStats({ users: users || 0, todayUsers: todayUsers || 0, messages: messages || 0, pendingReports: pendingReports || 0 });
    setStatsLoading(false);
  }, []);

  // 신고 목록 로드
  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    const { data: reportsData } = await supabase
      .from("reports")
      .select("id, reporter_id, reported_id, reason, created_at, status, resolved_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!reportsData?.length) { setReports([]); setReportsLoading(false); return; }

    const profileIds = [...new Set([...reportsData.map(r => r.reporter_id), ...reportsData.map(r => r.reported_id)])];
    const { data: profilesData } = await supabase
      .from("profiles").select("id, display_name, avatar_url, nationality").in("id", profileIds);
    const profileMap = new Map((profilesData || []).map(p => [p.id, p]));

    setReports(reportsData.map(r => ({
      ...r,
      reporter: profileMap.get(r.reporter_id) || { display_name: "알 수 없음" },
      reported: profileMap.get(r.reported_id) || { display_name: "알 수 없음" },
    })));
    setReportsLoading(false);
  }, []);

  // 사용자 목록 로드
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, nationality, avatar_url, is_public, is_admin, created_at")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setUsersLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadStats();
    if (tab === "reports") loadReports();
    if (tab === "users") loadUsers();
  }, [isAdmin, tab, loadStats, loadReports, loadUsers]);

  // 신고 처리완료
  const resolveReport = async (reportId) => {
    const { error } = await supabase.from("reports").update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    }).eq("id", reportId);
    if (error) { showToast("처리에 실패했습니다.", "error"); return; }
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: "resolved", resolved_at: new Date().toISOString() } : r));
    setStats(prev => ({ ...prev, pendingReports: Math.max(0, prev.pendingReports - 1) }));
    showToast("신고가 처리되었습니다.", "success");
  };

  // 피신고자 차단 (관리자가 직접)
  const blockReportedUser = async (reportedId, displayName) => {
    const { error } = await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: reportedId });
    if (error && error.code !== "23505") { showToast("차단에 실패했습니다.", "error"); return; }
    showToast(`${displayName} 님을 차단했습니다.`, "success");
  };

  // 사용자 공개 여부 토글
  const toggleUserPublic = async (userId, currentVal) => {
    const { error } = await supabase.from("profiles").update({ is_public: !currentVal }).eq("id", userId);
    if (error) { showToast("변경에 실패했습니다.", "error"); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_public: !currentVal } : u));
    showToast(!currentVal ? "공개로 변경했습니다." : "비공개로 변경했습니다.", "success");
  };

  // 관리자 권한 토글
  const toggleUserAdmin = async (userId, currentVal) => {
    const { error } = await supabase.from("profiles").update({ is_admin: !currentVal }).eq("id", userId);
    if (error) { showToast("변경에 실패했습니다.", "error"); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentVal } : u));
    showToast(!currentVal ? "관리자 권한을 부여했습니다." : "관리자 권한을 회수했습니다.", "success");
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">권한 확인 중...</p>
      </div>
    </div>
  );

  if (!user || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 px-6">
      <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <p className="text-red-600 font-extrabold text-lg">접근 권한이 없습니다.</p>
        <p className="text-sm text-gray-500 mt-2">관리자 계정으로 로그인해 주세요.</p>
        <button onClick={() => nav("/home")} className="mt-6 btn-primary px-6 py-3 text-sm w-full">홈으로</button>
      </div>
    </div>
  );

  const filteredReports = reports.filter(r => {
    if (reportFilter === "pending") return r.status === "pending";
    if (reportFilter === "resolved") return r.status === "resolved";
    return true;
  });

  const filteredUsers = users.filter(u =>
    !userSearch.trim() ||
    u.display_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.nationality?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>KoriBridge - 관리자 대시보드</title></Helmet>
      <div className="bg-gradient-to-r from-red-600 to-rose-500 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button onClick={() => nav("/home")} className="text-white/80 hover:text-white text-sm font-semibold transition">← 홈</button>
        <h1 className="font-extrabold text-lg text-white flex-1">관리자 대시보드</h1>
        <span className="text-xs bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full font-bold">ADMIN</span>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-1.5 max-w-5xl mx-auto bg-gray-100 rounded-2xl p-1">
          {[
            { key: "overview", label: "개요" },
            { key: "reports", label: `신고${stats.pendingReports > 0 ? ` ${stats.pendingReports}` : ""}` },
            { key: "users", label: "사용자" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                tab === t.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-5xl mx-auto">

        {/* ── 개요 탭 ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card h-24 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "전체 회원",
                    value: stats.users.toLocaleString(),
                    gradient: "from-blue-500 to-indigo-500",
                    icon: "👥",
                  },
                  {
                    label: "오늘 가입",
                    value: `+${stats.todayUsers}`,
                    gradient: "from-red-600 to-rose-500",
                    icon: "✨",
                  },
                  {
                    label: "전체 메시지",
                    value: stats.messages.toLocaleString(),
                    gradient: "from-violet-500 to-purple-500",
                    icon: "💬",
                  },
                  {
                    label: "미처리 신고",
                    value: stats.pendingReports.toLocaleString(),
                    gradient: stats.pendingReports > 0 ? "from-orange-500 to-amber-500" : "from-emerald-500 to-teal-500",
                    icon: stats.pendingReports > 0 ? "⚠️" : "✅",
                  },
                ].map(card => (
                  <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-5 shadow-md text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-white/70 font-bold uppercase tracking-wider">{card.label}</p>
                      <span className="text-lg">{card.icon}</span>
                    </div>
                    <p className="text-3xl font-black">{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="card p-6">
              <h2 className="text-sm font-bold text-gray-700 mb-3">빠른 이동</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setTab("reports")} className="btn-secondary px-4 py-2 text-sm w-auto">
                  신고 목록 보기
                </button>
                <button onClick={() => setTab("users")} className="btn-secondary px-4 py-2 text-sm w-auto">
                  사용자 목록 보기
                </button>
                <button onClick={() => { loadStats(); showToast("새로고침했습니다.", "info"); }} className="btn-secondary px-4 py-2 text-sm w-auto">
                  통계 새로고침
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 신고 관리 탭 ── */}
        {tab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-base font-bold text-gray-900">신고 목록</h2>
              <div className="flex gap-2">
                {[
                  { key: "pending", label: "미처리" },
                  { key: "resolved", label: "처리완료" },
                  { key: "all", label: "전체" },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setReportFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      reportFilter === f.key ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <button onClick={loadReports} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200">
                  새로고침
                </button>
              </div>
            </div>

            {reportsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-28 animate-pulse" />)
            ) : filteredReports.length === 0 ? (
              <div className="card text-center py-16">
                <p className="text-2xl mb-3">✅</p>
                <p className="text-gray-500 font-medium">
                  {reportFilter === "pending" ? "처리할 신고가 없습니다." : "신고 내역이 없습니다."}
                </p>
              </div>
            ) : (
              filteredReports.map(report => (
                <div key={report.id} className={`card p-5 ${report.status === "resolved" ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          report.status === "pending" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                        }`}>
                          {report.status === "pending" ? "미처리" : "처리완료"}
                        </span>
                        <span className="text-xs text-gray-400">{formatRelativeTime(report.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <button
                          onClick={() => nav(`/profile/${report.reporter_id}`)}
                          className="font-semibold text-gray-700 hover:text-red-600 hover:underline"
                        >
                          {report.reporter?.display_name}
                        </button>
                        <span className="text-gray-400">→ 신고</span>
                        <button
                          onClick={() => nav(`/profile/${report.reported_id}`)}
                          className="font-semibold text-gray-900 hover:text-red-600 hover:underline"
                        >
                          {report.reported?.display_name}
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
                        {report.reason}
                      </p>
                    </div>
                    {report.status === "pending" && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => resolveReport(report.id)}
                          className="px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                        >
                          처리완료
                        </button>
                        <button
                          onClick={() => blockReportedUser(report.reported_id, report.reported?.display_name)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                        >
                          유저 차단
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 사용자 관리 탭 ── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-base font-bold text-gray-900">사용자 목록 ({filteredUsers.length}명)</h2>
              <button onClick={loadUsers} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200">
                새로고침
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                className="input-field text-sm pl-4 h-11"
                placeholder="닉네임, 국적으로 검색..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            {usersLoading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)
            ) : filteredUsers.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map(u => (
                  <div key={u.id} className="card p-4 flex items-center gap-4">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 flex-shrink-0">
                        {u.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">{u.display_name}</p>
                        {u.is_admin && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{u.nationality} · {formatRelativeTime(u.created_at).replace(" 활동", " 가입")}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleUserPublic(u.id, u.is_public)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          u.is_public ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        title="공개/비공개 전환"
                      >
                        {u.is_public ? "공개" : "비공개"}
                      </button>
                      {u.id !== user.id && (
                        <button
                          onClick={() => toggleUserAdmin(u.id, u.is_admin)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            u.is_admin ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          title="관리자 권한 전환"
                        >
                          {u.is_admin ? "관리자" : "일반"}
                        </button>
                      )}
                      <button
                        onClick={() => nav(`/profile/${u.id}`)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
