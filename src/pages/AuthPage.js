import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("rememberMe");
      if (saved !== null) {
        setRememberMe(saved === "true");
      }
    }
  }, []);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    if (typeof window !== "undefined") {
      supabase.auth.storage = rememberMe
        ? window.localStorage
        : window.sessionStorage;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "email profile",
      },
    });

    if (error) {
      setError("Google 로그인에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (typeof window !== "undefined") {
      window.localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error: err } = await signIn(email, password, rememberMe);
      if (err) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        navigate("/home");
      }
    } else {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err.message);
      } else {
        setMessage("가입 확인 이메일을 발송했습니다. 이메일을 확인해 주세요.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-red-600 pt-16 pb-10 px-6 text-white text-center">
        <div className="text-4xl mb-2">🌏</div>
        <h1 className="text-2xl font-bold tracking-tight">KoriBridge</h1>
        <p className="text-red-100 text-sm mt-1">한국어·문화 교류 파트너 찾기</p>
      </div>

      {/* 탭 */}
      <div className="flex bg-white border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            mode === "login"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-400"
          }`}
          onClick={() => { setMode("login"); setError(""); setMessage(""); }}
        >
          로그인
        </button>
        <button
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            mode === "signup"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-400"
          }`}
          onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
        >
          회원가입
        </button>
      </div>

      {/* 폼 */}
      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
          </button>

          {mode === "login" && (
            <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              로그인 유지
            </label>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full mt-3 py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-150 flex items-center justify-center gap-3"
          >
            <span className="text-xl">🟢</span>
            Google로 계속하기
          </button>
        </form>
      </div>
    </div>
  );
}
