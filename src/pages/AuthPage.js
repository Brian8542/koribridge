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
  { icon: "🎯", titleKey: "f1Title", descKey: "f1Desc" },
  { icon: "💬", titleKey: "chatBtn", descKey: "f2Desc" },
  { icon: "🌸", titleKey: "f5Title", descKey: "f5Desc" },
  { icon: "🏆", titleKey: "f6Title", descKey: "f6Desc" },
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
      if (err) {
        setError(t.errResetFail);
      } else {
        setMessage(`${email}${t.resetSentMsg}`);
      }
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) return setError(t.errPasswordMismatch);
      if (password.length < 6) return setError(t.errPasswordShort);
      setLoading(true);
      const { data, error: err } = await signUp(email, password);
      setLoading(false);
      if (err) {
        setError(err.message);
      } else {
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
    if (err) {
      setError(t.errLoginFail);
    } else {
      login("email");
      navigate("/home");
    }
  };

  if (signupDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-6">
        <Helmet><title>KoriBridge - {t.emailVerifyTitle}</title></Helmet>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/40">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">{t.emailVerifyTitle}</h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            <span className="font-semibold text-zinc-200">{email}</span>{t.emailVerifySent}<br />
            {t.emailVerifyClick}
          </p>
          <p className="mt-4 text-xs text-zinc-600">{t.emailVerifySpam}</p>
          <button onClick={() => switchMode("login")} className="mt-6 btn-primary py-3">
            {t.goToLogin}
          </button>
          <button
            onClick={async () => {
              await supabase.auth.resend({ type: "signup", email });
              showToast(t.resendEmail, "success");
            }}
            className="mt-3 text-sm text-zinc-600 hover:text-zinc-400 underline transition-colors"
          >
            {t.resendEmail}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      <Helmet>
        <title>KoriBridge - {mode === "login" ? t.signIn : mode === "signup" ? t.signUp : t.resetPassword}</title>
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
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-base shadow-lg shadow-red-900/50">K</div>
            <span className="font-extrabold text-lg tracking-tight text-white">KoriBridge</span>
          </div>

          <h2 className="font-black tracking-[-0.025em] leading-tight text-white mb-4" style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}>
            {locale === "ko" ? <>한국어, 세계와<br /><span className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">연결하다</span></> : <>Korean, Connect<br /><span className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">the World</span></>}
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed mb-10">
            {locale === "ko" ? <>전 세계 127개국 48,000명이 선택한<br />한국어 교류 플랫폼</> : <>The Korean exchange platform chosen<br />by 48,000 learners in 127 countries</>}
          </p>

          <div className="space-y-5">
            {LEFT_FEATURES.map((f) => (
              <div key={f.titleKey} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-zinc-800 transition-colors duration-200">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t[f.titleKey]}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{t[f.descKey]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-zinc-800/60 border border-zinc-700/50 rounded-2xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">{locale === "ko" ? "지금 1,247명 대화 중" : "1,247 people chatting now"}</p>
            <p className="text-xs text-zinc-500">{locale === "ko" ? "127개국 파트너가 당신을 기다립니다" : "Partners from 127 countries await you"}</p>
          </div>
        </div>
      </div>

      {/* ── 오른쪽 패널 (폼) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 min-h-screen">
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-sm shadow-lg shadow-red-900/50">K</div>
          <span className="font-extrabold text-[15px] tracking-tight text-white">KoriBridge</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleLocale}
              className="text-sm font-bold px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition text-zinc-300"
            >
              {locale === "ko" ? "EN" : "한"}
            </button>
          </div>

          <div className="mb-7">
            {mode === "reset" ? (
              <button onClick={() => switchMode("login")} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-5">
                ← {t.resetBack}
              </button>
            ) : null}
            <h1 className="text-2xl font-black text-white tracking-tight">
              {mode === "login" ? t.authLoginTitle : mode === "signup" ? t.authSignupTitle : t.authResetTitle}
            </h1>
            <p className="text-sm text-zinc-500 mt-1.5">
              {mode === "login" ? t.authLoginDesc : mode === "signup" ? t.authSignupDesc : t.authResetDesc}
            </p>
          </div>

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
                  {m === "login" ? t.signIn : t.signUp}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "reset" && (
              <p className="text-sm text-zinc-500">{t.resetDesc}</p>
            )}

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">{t.email}</label>
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
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">{t.password}</label>
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
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">{t.confirmPassword}</label>
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
                ? t.deleting
                : mode === "login"
                ? t.signIn
                : mode === "signup"
                ? t.signUp
                : t.sendReset}
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
                  {t.rememberMe}
                </label>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-sm text-zinc-600 hover:text-red-400 underline transition-colors"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
              </>
            )}

            {mode !== "reset" && (
              <>
                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-xs text-zinc-600 font-medium">{locale === "ko" ? "또는" : "or"}</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-3.5 px-4 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-300 font-bold hover:border-zinc-600 hover:bg-zinc-800 hover:text-white transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <GoogleIcon />
                  {t.googleSignIn}
                </button>
              </>
            )}

            <div className="flex items-center justify-center gap-3 pt-1 text-xs text-zinc-600">
              <a href="/terms" className="hover:text-zinc-400 underline transition-colors">{t.terms}</a>
              <span>·</span>
              <a href="/privacy" className="hover:text-zinc-400 underline transition-colors">{t.privacy}</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
