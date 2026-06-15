import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

const LEFT_FEATURES = [
  { icon: "🎯", title: "스마트 매칭", desc: "AI가 최적 파트너를 자동 연결" },
  { icon: "💬", title: "실시간 채팅", desc: "언제 어디서나 실시간 대화" },
  { icon: "🌸", title: "문화 교류", desc: "K-pop, 드라마, 음식까지 함께" },
  { icon: "🏆", title: "게임화 학습", desc: "매일 성장하는 나를 확인" },
];

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("rememberMe");
      if (saved !== null) setRememberMe(saved === "true");
    }
  }, []);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setMessage("");
    setSignupDone(false);
  };

  const handleGoogleSignIn = async () => {
    window.localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "email profile",
        redirectTo: `${window.location.origin}/home`,
      },
    });
    if (err) setError("Google 로그인에 실패했습니다. 다시 시도해 주세요.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    window.localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

    if (mode === "reset") {
      if (!email) return setError("이메일을 입력해 주세요.");
      setLoading(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      setLoading(false);
      if (err) {
        setError("재설정 메일 발송에 실패했습니다. 다시 시도해 주세요.");
      } else {
        setMessage(`${email} 로 비밀번호 재설정 링크를 보냈습니다. 메일함을 확인해 주세요.`);
      }
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) return setError("비밀번호가 일치하지 않습니다.");
      if (password.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
      setLoading(true);
      const { error: err } = await signUp(email, password);
      setLoading(false);
      if (err) {
        setError(err.message);
      } else {
        setSignupDone(true);
      }
      return;
    }

    if (password.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } else {
      navigate("/home");
    }
  };

  if (signupDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-6">
        <Helmet><title>KoriBridge - 이메일 확인</title></Helmet>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/40">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">이메일을 확인해 주세요</h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            <span className="font-semibold text-zinc-200">{email}</span> 로<br />
            가입 확인 링크를 보냈습니다.<br />
            링크를 클릭하면 로그인할 수 있습니다.
          </p>
          <p className="mt-4 text-xs text-zinc-600">메일이 안 보이면 스팸함도 확인해 주세요.</p>
          <button onClick={() => switchMode("login")} className="mt-6 btn-primary py-3">
            로그인 화면으로
          </button>
          <button
            onClick={async () => {
              await supabase.auth.resend({ type: "signup", email });
              showToast("재발송했습니다.", "success");
            }}
            className="mt-3 text-sm text-zinc-600 hover:text-zinc-400 underline transition-colors"
          >
            메일 다시 받기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      <Helmet>
        <title>KoriBridge - {mode === "login" ? "로그인" : mode === "signup" ? "회원가입" : "비밀번호 재설정"}</title>
      </Helmet>

      {/* ── 왼쪽 패널 (데스크탑 전용) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] xl:w-[500px] flex-shrink-0 bg-zinc-900/40 border-r border-zinc-800/60 p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-red-900/20 via-rose-900/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-red-900/10 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />

        <div className="relative z-10">
          {/* 로고 */}
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-base shadow-lg shadow-red-900/50">K</div>
            <span className="font-extrabold text-lg tracking-tight text-white">KoriBridge</span>
          </div>

          <h2 className="font-black tracking-[-0.025em] leading-tight text-white mb-4" style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}>
            한국어, 세계와
            <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              연결하다
            </span>
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed mb-10">
            전 세계 127개국 48,000명이 선택한
            <br />한국어 교류 플랫폼
          </p>

          <div className="space-y-5">
            {LEFT_FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-zinc-800 transition-colors duration-200">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 온라인 배지 */}
        <div className="relative z-10 flex items-center gap-3 bg-zinc-800/60 border border-zinc-700/50 rounded-2xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">지금 1,247명 대화 중</p>
            <p className="text-xs text-zinc-500">127개국 파트너가 당신을 기다립니다</p>
          </div>
        </div>
      </div>

      {/* ── 오른쪽 패널 (폼) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 min-h-screen">
        {/* 모바일 로고 */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-sm shadow-lg shadow-red-900/50">K</div>
          <span className="font-extrabold text-[15px] tracking-tight text-white">KoriBridge</span>
        </div>

        <div className="w-full max-w-sm">
          {/* 헤더 */}
          <div className="mb-7">
            {mode === "reset" ? (
              <button onClick={() => switchMode("login")} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-5">
                ← 돌아가기
              </button>
            ) : null}
            <h1 className="text-2xl font-black text-white tracking-tight">
              {mode === "login" ? "다시 만나요" : mode === "signup" ? "함께 시작해요" : "비밀번호 재설정"}
            </h1>
            <p className="text-sm text-zinc-500 mt-1.5">
              {mode === "login"
                ? "계정에 로그인하세요"
                : mode === "signup"
                ? "무료로 시작하세요"
                : "이메일로 재설정 링크를 보내드립니다"}
            </p>
          </div>

          {/* 모드 탭 */}
          {mode !== "reset" && (
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6">
              {["login", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                    mode === m ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {m === "login" ? "로그인" : "회원가입"}
                </button>
              ))}
            </div>
          )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "reset" && (
              <p className="text-sm text-zinc-500">가입한 이메일을 입력하면 재설정 링크를 보내드립니다.</p>
            )}

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">이메일</label>
              <input
                type="email"
                className="input-field"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">비밀번호</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="6자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">비밀번호 확인</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="비밀번호 재입력"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
                {message}
              </div>
            )}

            <button type="submit" className="btn-primary py-3.5" disabled={loading}>
              {loading
                ? "처리 중..."
                : mode === "login"
                ? "로그인"
                : mode === "signup"
                ? "가입하기"
                : "재설정 메일 받기"}
            </button>

            {mode === "login" && (
              <>
                <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-900/40"
                  />
                  로그인 유지
                </label>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-sm text-zinc-600 hover:text-red-400 underline transition-colors"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              </>
            )}

            {mode !== "reset" && (
              <>
                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-xs text-zinc-600 font-medium">또는</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-3.5 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-300 font-bold hover:border-zinc-600 hover:bg-zinc-800 hover:text-white transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <GoogleIcon />
                  Google로 계속하기
                </button>
              </>
            )}

            <div className="flex items-center justify-center gap-3 pt-1 text-xs text-zinc-600">
              <a href="/terms" className="hover:text-zinc-400 underline transition-colors">이용약관</a>
              <span>·</span>
              <a href="/privacy" className="hover:text-zinc-400 underline transition-colors">개인정보처리방침</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
