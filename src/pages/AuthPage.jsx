import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { useLocale } from "../hooks/useLocale";
import { login, signUp as gaSignUp } from "../utils/analytics";
import { sendWelcomeEmail } from "../utils/welcomeEmail";

const LEFT_FEATURES = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    titleKey: "f1Title", descKey: "f1Desc",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    titleKey: "chatBtn", descKey: "f2Desc",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    titleKey: "f5Title", descKey: "f5Desc",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    titleKey: "f6Title", descKey: "f6Desc",
  },
];

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="flex-shrink-0">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

export default function AuthPage() {
  const [mode, setMode] = useState("login");
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
  const { t, locale, toggleLocale } = useLocale();

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
    if (err) {
      setError(t.errEmailAuth);
    } else {
      login("google");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    window.localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

    if (mode === "reset") {
      if (!email) return setError(t.email + " " + t.errName.replace("이름을", "주소를"));
      setLoading(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      setLoading(false);
      if (err) setError(t.errResetFail);
      else setMessage(`${email}${t.resetSentMsg}`);
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) return setError(t.errPasswordMismatch);
      if (password.length < 6) return setError(t.errPasswordShort);
      setLoading(true);
      const { data, error: err } = await signUp(email, password);
      setLoading(false);
      if (err) setError(err.message);
      else {
        gaSignUp("email");
        sendWelcomeEmail({ userId: data?.user?.id, email, locale });
        setSignupDone(true);
      }
      return;
    }

    if (password.length < 6) return setError(t.errPasswordShort);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) setError(t.errLoginFail);
    else { login("email"); navigate("/home"); }
  };

  if (signupDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bg px-6">
        <Helmet><title>KoriBridge - {t.emailVerifyTitle}</title></Helmet>
        <div className="bg-white border border-neutral-150 rounded-2xl shadow-card-md p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-card">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-neutral-900">{t.emailVerifyTitle}</h2>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            <span className="font-semibold text-neutral-800">{email}</span>{t.emailVerifySent}<br />
            {t.emailVerifyClick}
          </p>
          <p className="mt-3 text-xs text-neutral-400">{t.emailVerifySpam}</p>
          <button onClick={() => switchMode("login")} className="mt-6 btn-primary py-3">
            {t.goToLogin}
          </button>
          <button
            onClick={async () => {
              await supabase.auth.resend({ type: "signup", email });
              showToast(t.resendEmail, "success");
            }}
            className="mt-3 text-sm text-neutral-400 hover:text-neutral-600 underline transition-colors block w-full"
          >
            {t.resendEmail}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-bg">
      <Helmet>
        <title>KoriBridge - {mode === "login" ? t.signIn : mode === "signup" ? t.signUp : t.resetPassword}</title>
      </Helmet>

      {/* ── 왼쪽 패널 (데스크탑) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] xl:w-[480px] flex-shrink-0 bg-neutral-900 p-10">
        <div>
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 9.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight text-white">KoriBridge</span>
          </div>

          <h2 className="font-extrabold tracking-[-0.025em] leading-tight text-white mb-3" style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.1rem)" }}>
            {locale === "ko" ? (
              <>한국어, 세계와<br /><span className="text-primary-400">연결하다</span></>
            ) : (
              <>Korean, Connect<br /><span className="text-primary-400">the World</span></>
            )}
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed mb-10">
            {locale === "ko"
              ? "이메일 인증 기반의 한국어 교류 플랫폼. 허위 프로필 없이, 신뢰부터 시작합니다."
              : "A trust-first Korean language exchange platform. Real people, real conversations."}
          </p>

          <div className="space-y-4">
            {LEFT_FEATURES.map((f) => (
              <div key={f.titleKey} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-neutral-400 flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{t[f.titleKey]}</p>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-tight">{t[f.descKey]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {locale === "ko" ? "이메일 인증으로 신뢰를 보장합니다" : "Trust verified by email"}
            </p>
            <p className="text-xs text-neutral-500 leading-tight">
              {locale === "ko" ? "인증된 멤버만 파트너 목록에 표시됩니다" : "Only verified members appear in the partner list"}
            </p>
          </div>
        </div>
      </div>

      {/* ── 오른쪽 패널 (폼) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 min-h-screen">
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">K</span>
          </div>
          <span className="font-bold text-[15px] tracking-tight text-neutral-900">KoriBridge</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleLocale}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-muted border border-neutral-200 hover:bg-neutral-100 transition text-neutral-600"
            >
              {locale === "ko" ? "EN" : "한"}
            </button>
          </div>

          <div className="mb-7">
            {mode === "reset" && (
              <button onClick={() => switchMode("login")} className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {t.resetBack}
              </button>
            )}
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {mode === "login" ? t.authLoginTitle : mode === "signup" ? t.authSignupTitle : t.authResetTitle}
            </h1>
            <p className="text-sm text-neutral-400 mt-1.5">
              {mode === "login" ? t.authLoginDesc : mode === "signup" ? t.authSignupDesc : t.authResetDesc}
            </p>
          </div>

          {mode !== "reset" && (
            <div className="flex bg-surface-muted border border-neutral-200 rounded-xl p-1 mb-6">
              {["login", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                    mode === m
                      ? "bg-white text-neutral-900 shadow-xs border border-neutral-150"
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  {m === "login" ? t.signIn : t.signUp}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "reset" && (
              <p className="text-sm text-neutral-500">{t.resetDesc}</p>
            )}

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.email}</label>
              <input
                type="email"
                className="input-field"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.password}</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">{t.confirmPassword}</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder={t.confirmPasswordPlaceholder}
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
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
                {message}
              </div>
            )}

            <button type="submit" className="btn-primary py-3.5" disabled={loading}>
              {loading
                ? t.loading
                : mode === "login"
                ? t.signIn
                : mode === "signup"
                ? t.signUp
                : t.sendReset}
            </button>

            {mode === "login" && (
              <>
                <label className="flex items-center gap-2 text-sm text-neutral-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500/20"
                  />
                  {t.rememberMe}
                </label>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-sm text-neutral-400 hover:text-primary-500 transition-colors"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
              </>
            )}

            {mode !== "reset" && (
              <>
                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-neutral-150" />
                  <span className="text-xs text-neutral-400 font-medium">{locale === "ko" ? "또는" : "or"}</span>
                  <div className="flex-1 h-px bg-neutral-150" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-3.5 px-4 bg-white border border-neutral-200 rounded-xl text-neutral-700 font-semibold text-sm hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 flex items-center justify-center gap-3 shadow-xs"
                >
                  <GoogleIcon />
                  {t.googleSignIn}
                </button>
              </>
            )}

            <div className="flex items-center justify-center gap-3 pt-1 text-xs text-neutral-400">
              <a href="/terms" className="hover:text-neutral-600 underline transition-colors">{t.terms}</a>
              <span className="text-neutral-200">·</span>
              <a href="/privacy" className="hover:text-neutral-600 underline transition-colors">{t.privacy}</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
