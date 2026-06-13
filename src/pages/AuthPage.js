import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

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
      options: { scopes: "email profile" },
    });
    if (error) setError("Google 로그인에 실패했습니다. 다시 시도해 주세요.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    window.localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

    // 비밀번호 재설정
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

    // 회원가입
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

    // 로그인
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

  // 회원가입 완료 화면
  if (signupDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">
            ✉️
          </div>
          <h2 className="text-xl font-bold text-gray-900">이메일을 확인해 주세요</h2>
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
              alert("재발송했습니다.");
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
      {/* 헤더 */}
      <div className="bg-red-600 pt-16 pb-10 px-6 text-white text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3 text-2xl font-extrabold">
          K
        </div>
        <h1 className="text-2xl font-bold tracking-tight">KoriBridge</h1>
        <p className="text-red-100 text-sm mt-1">한국어·문화 교류 파트너 찾기</p>
      </div>

      {/* 탭 (reset 모드일 때는 숨김) */}
      {mode !== "reset" && (
        <div className="flex bg-white border-b border-gray-200">
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === m ? "text-red-600 border-b-2 border-red-600" : "text-gray-400"
              }`}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>
      )}

      {/* 비밀번호 재설정 헤더 */}
      {mode === "reset" && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <button onClick={() => switchMode("login")} className="text-sm text-gray-500 hover:text-gray-800">
            ← 돌아가기
          </button>
          <span className="text-sm font-semibold text-gray-700">비밀번호 재설정</span>
        </div>
      )}

      {/* 폼 */}
      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          {mode === "reset" && (
            <p className="text-sm text-gray-500 mb-2">
              가입한 이메일을 입력하면 재설정 링크를 보내드립니다.
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
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

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
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
                  className="text-sm text-gray-400 hover:text-red-600 underline"
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
                <span className="text-xs text-gray-400">또는</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Google로 계속하기
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
