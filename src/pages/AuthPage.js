import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "email profile",
        redirectTo: `${window.location.origin}/home`,
      },
    });
    if (error) setError("Google 로그인에 실패했습니다. 다시 시도해 주세요.");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">이메일을 확인해 주세요</h2>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">{email}</span> 로<br />
            가입 확인 링크를 보냈습니다.<br />
            링크를 클릭하면 로그인할 수 있습니다.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            메일이 안 보이면 스팸함도 확인해 주세요.
          </p>
          <button
            onClick={() => switchMode("login")}
            className="mt-6 btn-primary w-full py-3"
          >
            로그인 화면으로
          </button>
          <button
            onClick={async () => {
              await supabase.auth.resend({ type: "signup", email });
              showToast("재발송했습니다.", "success");
            }}
            className="mt-3 text-sm text-gray-400 hover:text-gray-600 underline"
          >
            메일 다시 받기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 히어로 헤더 */}
      <div className="relative bg-gradient-to-br from-red-600 via-rose-500 to-pink-400 pt-16 pb-14 px-6 text-white text-center overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white text-2xl font-extrabold">K</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">KoriBridge</h1>
          <p className="text-white/80 text-sm mt-1.5 font-medium">세계를 잇는 언어의 다리</p>
        </div>
      </div>

      {/* 탭 */}
      {mode !== "reset" && (
        <div className="flex bg-white border-b border-gray-100 shadow-sm">
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${
                mode === m
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>
      )}

      {/* 비밀번호 재설정 헤더 */}
      {mode === "reset" && (
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 shadow-sm">
          <button onClick={() => switchMode("login")} className="text-sm text-gray-500 hover:text-gray-800 transition">
            ← 돌아가기
          </button>
          <span className="text-sm font-bold text-gray-700">비밀번호 재설정</span>
        </div>
      )}

      {/* 폼 */}
      <div className="flex-1 px-5 py-7">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          {mode === "reset" && (
            <p className="text-sm text-gray-500 mb-2">
              가입한 이메일을 입력하면 재설정 링크를 보내드립니다.
            </p>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">이메일</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호 확인</label>
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
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
              {message}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
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
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                로그인 유지
              </label>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode("reset")}
                  className="text-sm text-gray-400 hover:text-red-600 underline transition"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            </>
          )}

          {mode !== "reset" && (
            <>
              <div className="relative flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">또는</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:border-red-300 hover:bg-red-50 transition-all duration-150 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
              >
                <svg width="20" height="20" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Google로 계속하기
              </button>
            </>
          )}

          <div className="flex items-center justify-center gap-3 pt-2 text-xs text-gray-400">
            <a href="/terms" className="hover:text-gray-600 underline">이용약관</a>
            <span>·</span>
            <a href="/privacy" className="hover:text-gray-600 underline">개인정보처리방침</a>
          </div>
        </form>
      </div>
    </div>
  );
}
