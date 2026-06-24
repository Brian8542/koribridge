import React, { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { useLocale } from "../hooks/useLocale";
import { formatRelativeTime } from "../utils/formatters";

export default function AdminPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLocale();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState({ users: 0, todayUsers: 0, messages: 0, pendingReports: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState("pending");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (!user) { setAuthLoading(false); return; }
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => {
        setIsAdmin(data?.is_admin === true);
        setAuthLoading(false);
      });
  }, [user]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);

    const [
      { count: usersCount },
      { count: todayUsers },
      { count: messages },
      { count: pendingReports },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString()),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    setStats({ users: usersCount || 0, todayUsers: todayUsers || 0, messages: messages || 0, pendingReports: pendingReports || 0 });
    setStatsLoading(false);
  }, []);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    const { data: reportsData } = await supabase
      .from("reports")
      .select("id, reporter_id, reported_id, reason, detail, created_at, status, resolved_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!reportsData?.length) { setReports([]); setReportsLoading(false); return; }

    const profileIds = [...new Set([...reportsData.map(r => r.reporter_id), ...reportsData.map(r => r.reported_id)])];
    const { data: profilesData } = await supabase
      .from("profiles").select("id, display_name, avatar_url, nationality").in("id", profileIds);
    const profileMap = new Map((profilesData || []).map(p => [p.id, p]));

    setReports(reportsData.map(r => ({
      ...r,
      reporter: profileMap.get(r.reporter_id) || { display_name: "—" },
      reported: profileMap.get(r.reported_id) || { display_name: "—" },
    })));
    setReportsLoading(false);
  }, []);

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

  const resolveReport = async (reportId) => {
    const { error } = await supabase.from("reports").update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    }).eq("id", reportId);
    if (error) { showToast(t.adminResolveFailed, "error"); return; }
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: "resolved", resolved_at: new Date().toISOString() } : r));
    setStats(prev => ({ ...prev, pendingReports: Math.max(0, prev.pendingReports - 1) }));
    showToast(t.adminResolveDone, "success");
  };

  const blockReportedUser = async (reportedId, displayName) => {
    const { error } = await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: reportedId });
    if (error && error.code !== "23505") { showToast(t.adminBlockFailed, "error"); return; }
    showToast(`${displayName}${t.adminBlockedUser}`, "success");
  };

  const toggleUserPublic = async (userId, currentVal) => {
    const { error } = await supabase.from("profiles").update({ is_public: !currentVal }).eq("id", userId);
    if (error) { showToast(t.adminChangeFailed, "error"); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_public: !currentVal } : u));
    showToast(!currentVal ? t.adminPublicChanged : t.adminPrivateChanged, "success");
  };

  const toggleUserAdmin = async (userId, currentVal) => {
    const { error } = await supabase.from("profiles").update({ is_admin: !currentVal }).eq("id", userId);
    if (error) { showToast(t.adminChangeFailed, "error"); return; }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentVal } : u));
    showToast(!currentVal ? t.adminGrantAdmin : t.adminRevokeAdmin, "success");
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-neutral-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm text-neutral-400 font-medium">{t.adminCheckingAuth}</p>
      </div>
    </div>
  );

  if (!user || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg px-6">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-card border border-neutral-150">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-primary-500 font-extrabold text-lg">{t.adminNoAccess}</p>
        <p className="text-sm text-neutral-500 mt-2">{t.adminNoAccessDesc}</p>
        <button onClick={() => nav("/home")} className="mt-6 btn-primary px-6 py-3 text-sm w-full">{t.adminGoHome}</button>
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
    <div className="min-h-screen bg-surface-bg">
      <Helmet><title>KoriBridge - {t.adminTitle}</title></Helmet>
      <div className="bg-white border-b border-neutral-150 shadow-nav px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => nav("/home")} className="text-neutral-500 hover:text-neutral-900 transition text-sm font-semibold">{t.adminHomeBtn}</button>
        <h1 className="font-extrabold text-base text-neutral-900 flex-1">{t.adminTitle}</h1>
        <span className="text-xs bg-primary-50 text-primary-600 border border-primary-100 px-2.5 py-1 rounded-full font-bold">ADMIN</span>
      </div>

      <div className="bg-white border-b border-neutral-150 px-4 py-3">
        <div className="flex gap-1.5 max-w-5xl mx-auto bg-surface-muted rounded-xl p-1">
          {[
            { key: "overview", label: t.adminTabOverview },
            { key: "reports", label: `${t.adminTabReports}${stats.pendingReports > 0 ? ` ${stats.pendingReports}` : ""}` },
            { key: "users", label: t.adminTabUsers },
          ].map(tabItem => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                tab === tabItem.key
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-5xl mx-auto">

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
                  { label: t.adminStatUsers, value: stats.users.toLocaleString(), color: "text-neutral-900", bg: "bg-white" },
                  { label: t.adminStatToday, value: `+${stats.todayUsers}`, color: "text-primary-500", bg: "bg-white" },
                  { label: t.adminStatMessages, value: stats.messages.toLocaleString(), color: "text-neutral-900", bg: "bg-white" },
                  {
                    label: t.adminStatPending,
                    value: stats.pendingReports.toLocaleString(),
                    color: stats.pendingReports > 0 ? "text-amber-600" : "text-emerald-600",
                    bg: "bg-white",
                  },
                ].map(card => (
                  <div key={card.label} className={`${card.bg} rounded-2xl border border-neutral-150 shadow-xs p-5`}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">{card.label}</p>
                    <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="card p-6">
              <h2 className="text-sm font-bold text-neutral-700 mb-3">{t.adminQuickNav}</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setTab("reports")} className="btn-secondary px-4 py-2 text-sm w-auto">
                  {t.adminViewReports}
                </button>
                <button onClick={() => setTab("users")} className="btn-secondary px-4 py-2 text-sm w-auto">
                  {t.adminViewUsers}
                </button>
                <button onClick={() => { loadStats(); showToast(t.adminRefreshDone, "info"); }} className="btn-secondary px-4 py-2 text-sm w-auto">
                  {t.adminRefreshStats}
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-base font-bold text-neutral-900">{t.adminReportsTitle}</h2>
              <div className="flex gap-2">
                {[
                  { key: "pending", label: t.adminPending },
                  { key: "resolved", label: t.adminResolved },
                  { key: "all", label: t.adminAll },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setReportFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      reportFilter === f.key ? "bg-primary-500 text-white" : "bg-surface-muted text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <button onClick={loadReports} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-muted text-neutral-600 hover:bg-neutral-100">
                  {t.refresh}
                </button>
              </div>
            </div>

            {reportsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-28 animate-pulse" />)
            ) : filteredReports.length === 0 ? (
              <div className="card text-center py-16">
                <p className="text-2xl mb-3">✅</p>
                <p className="text-neutral-500 font-medium">
                  {reportFilter === "pending" ? t.adminNoReports : t.adminNoReportsAlt}
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
                          {report.status === "pending" ? t.adminPending : t.adminResolved}
                        </span>
                        <span className="text-xs text-neutral-400">{formatRelativeTime(report.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <button
                          onClick={() => nav(`/profile/${report.reporter_id}`)}
                          className="font-semibold text-neutral-700 hover:text-primary-500 hover:underline"
                        >
                          {report.reporter?.display_name}
                        </button>
                        <span className="text-neutral-400">{t.adminReportedArrow}</span>
                        <button
                          onClick={() => nav(`/profile/${report.reported_id}`)}
                          className="font-semibold text-neutral-900 hover:text-primary-500 hover:underline"
                        >
                          {report.reported?.display_name}
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-neutral-600 bg-surface-bg rounded-xl px-3 py-2 leading-relaxed">
                        {report.reason}
                      </p>
                      {report.detail && (
                        <p className="mt-1.5 text-xs text-neutral-500 bg-surface-bg rounded-xl px-3 py-2 leading-relaxed whitespace-pre-wrap">
                          {report.detail}
                        </p>
                      )}
                    </div>
                    {report.status === "pending" && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => resolveReport(report.id)}
                          className="px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                        >
                          {t.adminMarkResolved}
                        </button>
                        <button
                          onClick={() => blockReportedUser(report.reported_id, report.reported?.display_name)}
                          className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                        >
                          {t.adminBlockUser}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-base font-bold text-neutral-900">{t.adminUsersTitle} ({filteredUsers.length})</h2>
              <button onClick={loadUsers} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-muted text-neutral-600 hover:bg-neutral-100">
                {t.refresh}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                className="input-field text-sm pl-4 h-11"
                placeholder={t.adminUserSearch}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            {usersLoading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)
            ) : filteredUsers.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-neutral-500">{t.adminNoUsers}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map(u => (
                  <div key={u.id} className="card p-4 flex items-center gap-4">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-500 flex-shrink-0">
                        {u.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-neutral-900 text-sm truncate">{u.display_name}</p>
                        {u.is_admin && (
                          <span className="text-[10px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">{u.nationality} · {formatRelativeTime(u.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleUserPublic(u.id, u.is_public)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          u.is_public ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-surface-muted text-neutral-500 hover:bg-neutral-100"
                        }`}
                      >
                        {u.is_public ? t.adminPublic : t.adminPrivate}
                      </button>
                      {u.id !== user.id && (
                        <button
                          onClick={() => toggleUserAdmin(u.id, u.is_admin)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            u.is_admin ? "bg-primary-100 text-primary-600 hover:bg-primary-200" : "bg-surface-muted text-neutral-500 hover:bg-neutral-100"
                          }`}
                        >
                          {u.is_admin ? t.adminAdmin : t.adminNormal}
                        </button>
                      )}
                      <button
                        onClick={() => nav(`/profile/${u.id}`)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-muted text-neutral-600 hover:bg-neutral-100"
                      >
                        {t.adminViewProfile}
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
