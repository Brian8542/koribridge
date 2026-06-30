import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";
import { useLocale } from "../hooks/useLocale";
import { login, signUp as gaSignUp } from "../utils/analytics";
import { sendWelcomeEmail } from "../utils/welcomeEmail";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="flex-shrink-0">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

export default function AuthPage() {
  const [mode, setMode]                     = useState("login");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe]         = useState(true);
  const [error, setError]                   = useState("");
  const [message, setMessage]               = useState("");
  const [loading, setLoading]               = useState(false);
  const [signupDone, setSignupDone]         = useState(false);

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
    setMode(newMode); setError(""); setMessage(""); setSignupDone(false);
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
    if (err) setError(t.errEmailAuth);
    else login("google");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    window.localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

    if (mode === "reset") {
      if (!email) return setError(t.email + " " + t.errName?.replace("이름을", "주소를"));
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
      else { gaSignUp("email"); sendWelcomeEmail({ userId: data?.user?.id, email, locale }); setSignupDone(true); }
      return;
    }

    if (password.length < 6) return setError(t.errPasswordShort);
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) setError(t.errLoginFail);
    else { login("email"); navigate("/home"); }
  };

  /* ── Sign-up done screen ── */
  if (signupDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] px-5">
        <Helmet><title>KoriBridge - {t.emailVerifyTitle}</title></Helmet>
        <div className="bg-white rounded-apple-lg shadow-card-md p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#34c759] flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight">{t.emailVerifyTitle}</h2>
          <p className="mt-3 text-[15px] text-[#86868b] leading-relaxed">
            <span className="font-semibold text-[#1d1d1f]">{email}</span>{t.emailVerifySent}<br />
            {t.emailVerifyClick}
          </p>
          <p className="mt-2 text-[13px] text-[#aeaeb2]">{t.emailVerifySpam}</p>
          <button onClick={() => switchMode("login")} className="mt-7 btn-primary py-3">
            {t.goToLogin}
          </button>
          <button
            onClick={async () => {
              await supabase.auth.resend({ type: "signup", email });
              showToast(t.resendEmail, "success");
            }}
            className="mt-3 text-[13px] text-[#86868b] hover:text-[#0071e3] transition-colors block w-full"
          >
            {t.resendEmail}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Helmet>
        <title>KoriBridge - {mode === "login" ? t.signIn : mode === "signup" ? t.signUp : t.resetPassword}</title>
      </Helmet>

      {/* ── Left panel (desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[460px] flex-shrink-0 bg-[#f5f5f7] p-10 border-r border-[#d2d2d7]/50">
        <div>
          <div className="flex items-center gap-2.5 mb-14">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[11px] font-black">K</span>
            </div>
            <span className="font-semibold text-[14px] tracking-[-0.01em] text-[#1d1d1f]">KoriBridge</span>
          </div>

          <h2 className="font-bold tracking-[-0.04em] leading-[1.08] text-[#1d1d1f] mb-4"
            style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)" }}>
            {locale === "ko" ? (
              <>한국과 세계를<br />진심으로 잇다.</>
            ) : (
              <>Connect Korea<br />to the World.</>
            )}
          </h2>

          <p className="text-[15px] text-[#86868b] leading-relaxed mb-10">
            {locale === "ko"
              ? "이메일 인증 기반의 한국어 교류 플랫폼. 허위 프로필 없이, 신뢰부터 시작합니다."
              : "A trust-first Korean language exchange platform. Real people, real conversations."}
          </p>

          <div className="space-y-5">
            {[
              {
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
                titleKey: "f1Title", descKey: "f1Desc",
              },
              {
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
                titleKey: "chatBtn", descKey: "f2Desc",
              },
              {
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
                titleKey: "f6Title", descKey: "f6Desc",
              },
            ].map((f) => (
              <div key={f.titleKey} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#86868b] flex-shrink-0 shadow-xs">
                  {f.icon}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1d1d1f]">{t[f.titleKey]}</p>
                  <p className="text-[13px] text-[#86868b] mt-0.5 leading-snug">{t[f.descKey]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-apple px-4 py-3.5 shadow-xs border border-[#d2d2d7]/50">
          <div className="w-2 h-2 rounded-full bg-[#34c759] flex-shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-[#1d1d1f]">
              {locale === "ko" ? "이메일 인증으로 신뢰를 보장합니다" : "Trust verified by email"}
            </p>
            <p className="text-[12px] text-[#86868b]">
              {locale === "ko" ? "인증된 멤버만 파트너 목록에 표시됩니다" : "Only verified members appear in the partner list"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-black">K</span>
          </div>
          <span className="font-semibold text-[14px] tracking-[-0.01em] text-[#1d1d1f]">KoriBridge</span>
        </div>

        <div className="w-full max-w-[340px]">
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleLocale}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] transition text-[#6e6e73]"
            >
              {locale === "ko" ? "EN" : "한"}
            </button>
          </div>

          <div className="mb-7">
            {mode === "reset" && (
              <button onClick={() => switchMode("login")} className="flex items-center gap-1.5 text-[13px] text-[#86868b] hover:text-[#0071e3] transition-colors mb-5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {t.resetBack}
              </button>
            )}
            <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em]">
              {mode === "login" ? t.authLoginTitle : mode === "signup" ? t.authSignupTitle : t.authResetTitle}
            </h1>
            <p className="text-[15px] text-[#86868b] mt-1.5">
              {mode === "login" ? t.authLoginDesc : mode === "signup" ? t.authSignupDesc : t.authResetDesc}
            </p>
          </div>

          {mode !== "reset" && (
            <div className="flex bg-[#f5f5f7] rounded-full p-1 mb-6">
              {["login", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 text-[13px] font-semibold rounded-full transition-all duration-200 ${
                    mode === m
                      ? "bg-white text-[#1d1d1f] shadow-xs"
                      : "text-[#86868b] hover:text-[#1d1d1f]"
                  }`}
                >
                  {m === "login" ? t.signIn : t.signUp}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "reset" && (
              <p className="text-[14px] text-[#86868b]">{t.resetDesc}</p>
            )}

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">{t.email}</label>
              <input
                type="email" className="input-field"
                placeholder={t.emailPlaceholder}
                value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>

            {mode !== "reset" && (
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">{t.password}</label>
                <input
                  type="password" className="input-field"
                  placeholder={t.passwordPlaceholder}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">{t.confirmPassword}</label>
                <input
                  type="password" className="input-field"
                  placeholder={t.confirmPasswordPlaceholder}
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  required autoComplete="new-password"
                />
              </div>
            )}

            {error && (
              <div className="bg-[#fff2f2] text-[#c0182b] text-[13px] px-4 py-3 rounded-apple">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-[#f0fff4] text-[#1a7f37] text-[13px] px-4 py-3 rounded-apple">
                {message}
              </div>
            )}

            <button type="submit" className="btn-primary py-3.5 text-[15px]" disabled={loading}>
              {loading ? t.loading
                : mode === "login" ? t.signIn
                : mode === "signup" ? t.signUp
                : t.sendReset}
            </button>

            {mode === "login" && (
              <>
                <label className="flex items-center gap-2 text-[13px] text-[#86868b] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]/20"
                  />
                  {t.rememberMe}
                </label>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-[13px] text-[#86868b] hover:text-[#0071e3] transition-colors"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
              </>
            )}

            {mode !== "reset" && (
              <>
                <div className="relative flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-[#d2d2d7]/60" />
                  <span className="text-[12px] text-[#86868b]">{locale === "ko" ? "또는" : "or"}</span>
                  <div className="flex-1 h-px bg-[#d2d2d7]/60" />
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full text-[#1d1d1f] font-medium text-[14px] transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <GoogleIcon />
                  {t.googleSignIn}
                </button>
              </>
            )}

            <div className="flex items-center justify-center gap-3 pt-1 text-[12px] text-[#86868b]">
              <a href="/terms" className="hover:text-[#0071e3] transition-colors">{t.terms}</a>
              <span className="text-[#d2d2d7]">·</span>
              <a href="/privacy" className="hover:text-[#0071e3] transition-colors">{t.privacy}</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
