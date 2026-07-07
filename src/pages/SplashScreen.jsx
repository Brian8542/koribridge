import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocale } from "../hooks/useLocale";
import { usePublicStats } from "../hooks/usePublicStats";
import LanguageSelector from "../components/LanguageSelector";

/* ─── Scroll-triggered fade-in ─── */
const FadeInSection = React.memo(({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.75s ease-out ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      willChange: visible ? "auto" : "opacity, transform",
    }}>
      {children}
    </div>
  );
});

/* ─── Phone frame ─── */
const PhoneMockup = React.memo(({ children, dark = false, className = "" }) => (
  <div className={`relative flex-shrink-0 ${className}`} style={{
    width: 260, height: 534,
    borderRadius: 44,
    background: dark ? "#211C18" : "#ffffff",
    border: `10px solid ${dark ? "#3E3934" : "#E5DED2"}`,
    boxShadow: "0 40px 88px rgba(0,0,0,0.20), 0 8px 24px rgba(0,0,0,0.10)",
    overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
      width: 84, height: 26, background: "#000", borderRadius: 13, zIndex: 10,
    }} />
    <div style={{ position: "absolute", inset: 0, top: 46, overflow: "hidden" }}>
      {children}
    </div>
  </div>
));

/* ─── Browse/swipe screen mockup ─── */
const BrowseScreen = React.memo(() => (
  <div className="h-full flex flex-col bg-[#F3EEE6]">
    <div className="px-4 pt-3 pb-2 bg-white border-b border-[#F3EEE6]">
      <p className="text-[11px] font-semibold text-[#1E1B18] tracking-tight">파트너 탐색</p>
    </div>
    <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
      {[
        { initials: "LN", grad: "bg-[#7D4E6E]", name: "Linh N.", flag: "베트남", level: "초급", levelColor: "text-emerald-700 bg-emerald-50", tags: ["K-pop","드라마"] },
        { initials: "DK", grad: "bg-[#B0764A]", name: "Daniyal K.", flag: "카자흐스탄", level: "중급", levelColor: "text-amber-700 bg-amber-50", tags: ["음식","여행"] },
        { initials: "MS", grad: "bg-[#E8604C]", name: "Maria S.", flag: "브라질", level: "초급", levelColor: "text-emerald-700 bg-emerald-50", tags: ["K-drama"] },
      ].map((p) => (
        <div key={p.name} className="bg-white rounded-[18px] p-3 flex items-center gap-2.5 shadow-xs">
          <div className={`w-9 h-9 rounded-[12px] ${p.grad} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
            {p.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-[#1E1B18]">{p.name}</span>
              <span className="text-[9px] text-[#8A837B]">{p.flag}</span>
              <span className={`ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${p.levelColor}`}>{p.level}</span>
            </div>
            <div className="flex gap-1 mt-1 flex-wrap">
              {p.tags.map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#F3EEE6] text-[#6E675F] rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="px-3 pb-3">
      <div className="bg-[#4A1D3F] rounded-full py-2 text-center text-[11px] font-semibold text-white">대화 시작하기</div>
    </div>
  </div>
));

/* ─── Chat screen mockup ─── */
const ChatScreen = React.memo(() => (
  <div className="h-full flex flex-col bg-white">
    <div className="px-4 py-2.5 border-b border-[#F3EEE6] flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-[#7D4E6E] flex items-center justify-center text-white text-[10px] font-bold">A</div>
      <div>
        <p className="text-[11px] font-semibold text-[#1E1B18]">Aisha K.</p>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5B8A72]" />
          <p className="text-[9px] text-[#8A837B]">온라인</p>
        </div>
      </div>
    </div>
    <div className="flex-1 p-3 space-y-2 overflow-hidden">
      <div className="flex justify-end">
        <div className="bg-[#4A1D3F] text-white text-[10px] leading-relaxed rounded-[14px] rounded-tr-[4px] px-2.5 py-1.5 max-w-[150px]">
          안녕하세요! 한국어 연습할 수 있을까요?
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-[#F3EEE6] text-[#1E1B18] text-[10px] leading-relaxed rounded-[14px] rounded-tl-[4px] px-2.5 py-1.5 max-w-[150px]">
          물론이죠! 저도 카자흐어 배우고 싶어요
        </div>
      </div>
      <div className="flex justify-end">
        <div className="bg-[#4A1D3F] rounded-[14px] rounded-tr-[4px] px-2.5 py-1.5 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
            <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-white ml-px" />
          </div>
          <div className="flex items-end gap-px h-3">
            {[2,4,3,5,3,4,2].map((h,i) => (
              <div key={i} className="w-0.5 bg-white/70 rounded-full" style={{ height: h * 2 }} />
            ))}
          </div>
          <span className="text-[9px] text-white/80">0:04</span>
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-[#F3EEE6] text-[#1E1B18] text-[10px] leading-relaxed rounded-[14px] rounded-tl-[4px] px-2.5 py-1.5 max-w-[150px]">
          발음이 정말 좋아요!
        </div>
      </div>
      <div className="flex justify-start">
        <div className="border border-[#4A1D3F]/30 bg-[#4A1D3F]/5 rounded-[14px] rounded-tl-[4px] px-2.5 py-1.5 max-w-[170px]">
          <p className="text-[9px] text-[#4A1D3F] font-semibold mb-0.5">교정 제안</p>
          <p className="text-[9px] text-[#1E1B18] line-through opacity-50">나는 학교에 갔다</p>
          <p className="text-[9px] text-[#1E1B18] font-medium">학교에 갔어요 ✓</p>
        </div>
      </div>
    </div>
    <div className="px-3 py-2 border-t border-[#F3EEE6] flex items-center gap-2">
      <div className="flex-1 bg-[#F3EEE6] rounded-full px-3 py-1.5 text-[10px] text-[#8A837B]">메시지 입력...</div>
      <div className="w-6 h-6 rounded-full bg-[#4A1D3F] flex items-center justify-center flex-shrink-0">
        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </div>
    </div>
  </div>
));

/* ─── Safety / verified profile screen ─── */
const SafetyScreen = React.memo(() => (
  <div className="h-full flex flex-col bg-[#F3EEE6] p-4">
    <div className="bg-white rounded-[22px] p-4 flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-16 h-16 rounded-[20px] bg-[#5B8A72] flex items-center justify-center text-white text-2xl font-bold">L</div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#4A1D3F] border-2 border-white flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[13px] font-bold text-[#1E1B18]">Linh Nguyen</p>
        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full">
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          이메일 인증 완료
        </span>
      </div>
      <div className="w-full space-y-2">
        {[
          {
            icon: <svg className="w-4 h-4 text-[#4A1D3F]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
            label: "신고 시스템", desc: "부적절한 사용자 즉시 신고",
          },
          {
            icon: <svg className="w-4 h-4 text-[#4A1D3F]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636" /></svg>,
            label: "차단 기능", desc: "원하지 않는 연락 차단",
          },
          {
            icon: <svg className="w-4 h-4 text-[#4A1D3F]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
            label: "이메일 인증", desc: "허위 프로필 원천 차단",
          },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5 bg-[#F3EEE6] rounded-[12px] px-3 py-2">
            <span className="flex-shrink-0">{item.icon}</span>
            <div>
              <p className="text-[10px] font-semibold text-[#1E1B18]">{item.label}</p>
              <p className="text-[9px] text-[#8A837B]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

const MARQUEE_COUNTRIES = [
  "Korea", "Vietnam", "Kazakhstan", "Uzbekistan", "Philippines", "Indonesia",
  "Malaysia", "Thailand", "China", "Japan", "Brazil", "India", "USA",
  "France", "Germany", "UK", "Mexico", "Netherlands", "Ukraine", "Mongolia",
];

export default function SplashScreen() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { locale, t, levelLabel } = useLocale();
  const { stats, loading: statsLoading, hasEnoughData } = usePublicStats();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goToAuth    = useCallback(() => navigate("/auth"),    [navigate]);
  const goToTerms   = useCallback(() => navigate("/terms"),   [navigate]);
  const goToPrivacy = useCallback(() => navigate("/privacy"), [navigate]);
  const goPricing   = useCallback(() => navigate("/pricing"), [navigate]);

  const totalUsers      = stats?.total_users || 0;
  const verifiedCount   = stats?.verified_count || 0;
  const levelDist       = stats?.level_dist || { 초급: 0, 중급: 0, 고급: 0 };
  const nationalityDist = stats?.nationality_dist || [];

  const REVIEWS = [
    { name: "Sofia K.",   country: t.r1Country, rating: 5, text: t.r1Text },
    { name: "Takeshi M.", country: t.r2Country, rating: 5, text: t.r2Text },
    { name: "Aisha R.",   country: t.r3Country, rating: 5, text: t.r3Text },
  ];

  return (
    <div className="bg-[#FAF7F2] text-[#1E1B18] min-h-screen overflow-x-hidden">
      <Helmet>
        <title>KoriBridge — {locale === "ko" ? "한국과 세계를 잇다" : "Connect Korea to the World"}</title>
        <meta name="description" content={locale === "ko"
          ? "이메일 인증 기반의 국제 언어 교류 플랫폼. 신뢰 먼저, 만남은 그 다음."
          : "A trust-first international language exchange platform."} />
      </Helmet>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-[#E5DED2]/50"
          : "bg-transparent"
      }`}>
        <div className="max-w-[980px] mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <button onClick={goToAuth} className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-7 h-7 rounded-full bg-[#4A1D3F] flex items-center justify-center flex-shrink-0">
              <span className="text-[#FAF7F2] text-[11px] font-display">K</span>
            </div>
            <span className="font-semibold text-[14px] tracking-[-0.01em] text-[#1E1B18] group-hover:text-[#4A1D3F] transition-colors">KoriBridge</span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={goPricing} className="text-[13px] text-[#8A837B] hover:text-[#1E1B18] transition-colors">{locale === "ko" ? "프리미엄" : "Premium"}</button>
            <button onClick={goToTerms} className="text-[13px] text-[#8A837B] hover:text-[#1E1B18] transition-colors">{t.terms}</button>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <LanguageSelector />
            <button onClick={goToAuth} className="hidden sm:block text-[13px] text-[#8A837B] hover:text-[#1E1B18] transition-colors">{t.login}</button>
            <button
              onClick={goToAuth}
              className="px-4 py-1.5 bg-[#4A1D3F] text-white text-[13px] font-medium rounded-full hover:bg-[#3B1732] transition-all duration-200 active:scale-[0.97]"
            >
              {locale === "ko" ? "시작하기" : "Get started"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-12 px-5 bg-[#FAF7F2] text-center">
        <div className="max-w-[980px] mx-auto">
          <div
            className="inline-flex items-center gap-1.5 text-[#4A1D3F] text-[13px] font-medium mb-6"
            style={{ animation: "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B8A72] flex-shrink-0" />
            {locale === "ko" ? "완전 무료 · 이메일 인증 · 광고 없음" : "Completely free · Email verified · No ads"}
          </div>

          <h1
            className="font-display leading-[1.14] text-[#1E1B18] text-balance"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              animation: "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.10s both",
            }}
          >
            {locale === "ko" ? (
              <>한국과 세계를<br />진심으로 잇다.</>
            ) : (
              <>Connect Korea<br />to the World.</>
            )}
          </h1>

          <p
            className="mt-6 text-[19px] text-[#8A837B] leading-relaxed max-w-[560px] mx-auto text-balance"
            style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.18s both" }}
          >
            {locale === "ko"
              ? "허위 프로필 없이, 이메일 인증만으로 시작합니다.\n언어 실력과 관심사가 맞는 파트너를 만나보세요."
              : "No fake profiles — just email verification.\nMeet partners matched by language level and interests."}
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.26s both" }}
          >
            <button
              onClick={goToAuth}
              className="px-7 py-3 bg-[#4A1D3F] text-white text-[17px] font-medium rounded-full hover:bg-[#3B1732] transition-all duration-200 active:scale-[0.97]"
            >
              {locale === "ko" ? "지금 무료로 시작하기" : "Start for Free"}
            </button>
            <button
              onClick={goToAuth}
              className="text-[17px] text-[#4A1D3F] hover:underline transition-colors flex items-center gap-1"
            >
              {locale === "ko" ? "파트너 둘러보기" : "Browse Partners"}
              <span className="text-[20px] leading-none">›</span>
            </button>
          </div>
        </div>

        {/* Hero phone mockup */}
        <div
          className="mt-16 flex justify-center"
          style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.34s both" }}
        >
          <PhoneMockup>
            <BrowseScreen />
          </PhoneMockup>
        </div>
      </section>

      {/* ── FLAG MARQUEE ── */}
      <section className="py-4 bg-[#F3EEE6] overflow-hidden border-y border-[#E5DED2]/30">
        <div
          className="flex items-center"
          style={{ animation: "marquee 30s linear infinite", width: "max-content" }}
        >
          {[...MARQUEE_COUNTRIES, ...MARQUEE_COUNTRIES].map((c, i) => (
            <span key={i} className="font-display text-[17px] text-[#8A837B] flex-shrink-0 px-6 leading-none select-none">{c}</span>
          ))}
        </div>
        <p className="text-center text-[12px] text-[#8A837B] tracking-[0.10em] uppercase mt-3">
          {locale === "ko" ? "127개국 멤버들과 함께하세요" : "Members from 127 countries"}
        </p>
      </section>

      {/* ── FEATURE 1: 파트너 매칭 (f5f5f7 bg) ── */}
      <section className="py-24 md:py-36 px-5 bg-[#F3EEE6]">
        <div className="max-w-[980px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeInSection>
              <p className="section-label mb-4">
                {locale === "ko" ? "파트너 매칭" : "Partner Matching"}
              </p>
              <h2 className="font-display leading-[1.16] text-[#1E1B18]"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                {locale === "ko"
                  ? <>딱 맞는 파트너를<br />바로 찾습니다.</>
                  : <>Find the perfect<br />partner instantly.</>}
              </h2>
              <p className="mt-5 text-[17px] text-[#8A837B] leading-relaxed">
                {locale === "ko"
                  ? "국적, 모국어, 학습 언어, 관심사를 기반으로 AI가 가장 잘 맞는 파트너를 추천합니다."
                  : "AI recommends the best-matched partners based on nationality, native language, learning goal, and interests."}
              </p>
              <button
                onClick={goToAuth}
                className="mt-7 inline-flex items-center gap-1 text-[17px] text-[#4A1D3F] hover:underline transition-colors"
              >
                {locale === "ko" ? "파트너 탐색하기" : "Explore partners"}
                <span className="text-[20px] leading-none">›</span>
              </button>
            </FadeInSection>

            <FadeInSection delay={120} className="flex justify-center md:justify-end">
              <PhoneMockup>
                <BrowseScreen />
              </PhoneMockup>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── FEATURE 2: 실시간 채팅 (white bg) ── */}
      <section className="py-24 md:py-36 px-5 bg-[#FAF7F2]">
        <div className="max-w-[980px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeInSection delay={120} className="flex justify-center md:justify-start order-2 md:order-1">
              <PhoneMockup>
                <ChatScreen />
              </PhoneMockup>
            </FadeInSection>

            <FadeInSection className="order-1 md:order-2">
              <p className="section-label mb-4">
                {locale === "ko" ? "실시간 채팅" : "Real-Time Chat"}
              </p>
              <h2 className="font-display leading-[1.16] text-[#1E1B18]"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                {locale === "ko"
                  ? <>대화하고, 듣고,<br />바로 성장하세요.</>
                  : <>Chat, listen,<br />and grow together.</>}
              </h2>
              <p className="mt-5 text-[17px] text-[#8A837B] leading-relaxed">
                {locale === "ko"
                  ? "텍스트 채팅부터 음성 메모, 이미지 공유까지. 파트너가 내 문장을 직접 교정해 주고 번역도 제공합니다."
                  : "From text and voice memos to image sharing. Your partner corrects your sentences directly and provides translations."}
              </p>
              <div className="mt-7 space-y-3">
                {[
                  { label: locale === "ko" ? "텍스트 & 이미지 채팅" : "Text & image chat" },
                  { label: locale === "ko" ? "음성 메모 — 발음 연습" : "Voice memo — pronunciation practice" },
                  { label: locale === "ko" ? "교정 제안 & 즉시 번역" : "Correction suggestions & instant translation" },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#4A1D3F]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-[#4A1D3F]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-[15px] text-[#1E1B18]">{f.label}</span>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── FEATURE 3: 안전 & 인증 (f5f5f7 bg) ── */}
      <section className="py-24 md:py-36 px-5 bg-[#F3EEE6]">
        <div className="max-w-[980px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeInSection>
              <p className="section-label mb-4">
                {locale === "ko" ? "안전 & 신뢰" : "Safety & Trust"}
              </p>
              <h2 className="font-display leading-[1.16] text-[#1E1B18]"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                {locale === "ko"
                  ? <>신뢰할 수 있는<br />사람들만 모입니다.</>
                  : <>Only people you<br />can truly trust.</>}
              </h2>
              <p className="mt-5 text-[17px] text-[#8A837B] leading-relaxed">
                {locale === "ko"
                  ? "이메일 인증으로 허위 프로필을 원천 차단합니다. 부적절한 행동은 즉시 신고·차단할 수 있습니다."
                  : "Email verification blocks fake profiles at the source. Report and block inappropriate users instantly."}
              </p>
              <button
                onClick={goToAuth}
                className="mt-7 inline-flex items-center gap-1 text-[17px] text-[#4A1D3F] hover:underline transition-colors"
              >
                {locale === "ko" ? "지금 인증하기" : "Get verified now"}
                <span className="text-[20px] leading-none">›</span>
              </button>
            </FadeInSection>

            <FadeInSection delay={120} className="flex justify-center md:justify-end">
              <PhoneMockup>
                <SafetyScreen />
              </PhoneMockup>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (white bg, center-aligned) ── */}
      <section className="py-24 md:py-32 px-5 bg-[#FAF7F2]">
        <div className="max-w-[980px] mx-auto text-center">
          <FadeInSection>
            <p className="section-label mb-4">{locale === "ko" ? "시작 방법" : "How It Works"}</p>
            <h2 className="font-display leading-[1.16] text-[#1E1B18]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              {t.howTitle}
            </h2>
          </FadeInSection>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", title: t.howStep1Title, desc: t.howStep1Desc,
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
              },
              { num: "02", title: t.howStep2Title, desc: t.howStep2Desc,
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
              },
              { num: "03", title: t.howStep3Title, desc: t.howStep3Desc,
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
              },
            ].map((step, i) => (
              <FadeInSection key={step.num} delay={i * 100}>
                <div className="text-center p-6 bg-[#F3EEE6] rounded-apple-lg h-full">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1E1B18] mx-auto mb-5 shadow-card">
                    {step.icon}
                  </div>
                  <p className="text-[11px] font-semibold text-[#8A837B] uppercase tracking-widest mb-3">STEP {step.num}</p>
                  <h3 className="text-[17px] font-semibold text-[#1E1B18] mb-2">{step.title}</h3>
                  <p className="text-[14px] text-[#8A837B] leading-relaxed">{step.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS (f5f5f7 bg) ── */}
      <section className="py-24 md:py-32 px-5 bg-[#F3EEE6]">
        <div className="max-w-[980px] mx-auto text-center">
          <FadeInSection>
            <p className="section-label mb-4">{t.statsSectionTag}</p>
            <h2 className="font-display leading-[1.16] text-[#1E1B18]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              {t.statsSectionTitle}
            </h2>
          </FadeInSection>

          {statsLoading ? (
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-[#E5DED2] border-t-[#8A837B] rounded-full animate-spin" />
              <span className="text-[15px] text-[#8A837B]">{t.loading}</span>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: totalUsers > 0 ? totalUsers.toLocaleString() : "—", label: locale === "ko" ? "전체 멤버" : "Members" },
                { value: verifiedCount > 0 ? verifiedCount.toLocaleString() : "—", label: locale === "ko" ? "인증 멤버" : "Verified" },
                { value: nationalityDist.length > 0 ? `${nationalityDist.length}+` : "127+", label: locale === "ko" ? "참여 국가" : "Countries" },
                { value: stats?.joined_this_month > 0 ? `+${stats.joined_this_month}` : "—", label: locale === "ko" ? "이번 달 신규" : "New this month" },
              ].map(stat => (
                <FadeInSection key={stat.label}>
                  <div className="bg-white rounded-apple-lg p-6">
                    <p className="text-[36px] font-bold tracking-[-0.03em] text-[#1E1B18]">{stat.value}</p>
                    <p className="text-[14px] text-[#8A837B] mt-1">{stat.label}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── REVIEWS (white bg) ── */}
      <section className="py-24 md:py-32 px-5 bg-[#FAF7F2]">
        <div className="max-w-[980px] mx-auto">
          <FadeInSection className="text-center mb-16">
            <p className="section-label mb-4">{t.reviewsSectionTag}</p>
            <h2 className="font-display leading-[1.16] text-[#1E1B18]"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              {t.reviewsSectionTitle}
            </h2>
          </FadeInSection>

          {/* Apple-style big pull quote */}
          <FadeInSection className="mb-16 text-center">
            <blockquote className="font-display text-[#1E1B18] max-w-[640px] mx-auto"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", lineHeight: 1.25 }}>
              {locale === "ko"
                ? "\"KoriBridge가 없었으면 불가능했을 거예요. 3개월 만에 한국어로 자유롭게 대화할 수 있게 됐어요.\""
                : "\"Without KoriBridge it wouldn't have been possible. In 3 months I can talk freely in Korean.\""}
            </blockquote>
            <p className="mt-5 text-[15px] text-[#8A837B]">Sofia K. · {locale === "ko" ? "카자흐스탄" : "Kazakhstan"}</p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS.map((item, i) => (
              <FadeInSection key={item.name} delay={i * 80}>
                <div className="bg-[#F3EEE6] rounded-apple-lg p-6 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: item.rating }).map((_, ri) => (
                      <svg key={ri} className="w-4 h-4 text-[#D99A3D] fill-current" viewBox="0 0 20 20">
                        <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[15px] text-[#1E1B18] leading-relaxed flex-1">"{item.text}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[#E5DED2]/50">
                    <div className="w-8 h-8 rounded-full bg-[#E5DED2] flex items-center justify-center text-xs font-bold text-[#6E675F] flex-shrink-0">
                      {item.name[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1E1B18]">{item.name}</p>
                      <p className="text-[12px] text-[#8A837B]">{item.country}</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (dark bg) ── */}
      <section className="py-28 md:py-36 px-5 bg-[#4A1D3F]">
        <FadeInSection className="max-w-[640px] mx-auto text-center">
          <h2 className="font-display leading-[1.14] text-[#FAF7F2]"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
            {locale === "ko"
              ? <>오늘, 첫 대화를<br />시작해보세요.</>
              : <>Start your first<br />conversation today.</>}
          </h2>
          <p className="mt-6 text-[17px] text-[#FAF7F2]/70 leading-relaxed max-w-sm mx-auto">
            {locale === "ko"
              ? "이메일 인증 후 바로 매칭이 시작됩니다. 완전 무료, 광고 없음."
              : "Matching starts the moment you verify. Completely free, no ads."}
          </p>
          <button
            onClick={goToAuth}
            className="mt-9 px-8 py-3.5 bg-[#FAF7F2] text-[#4A1D3F] text-[17px] font-semibold rounded-full hover:bg-white transition-all duration-200 active:scale-[0.98]"
          >
            {locale === "ko" ? "무료로 시작하기" : "Start for Free"}
          </button>
          <p className="mt-4 text-[13px] text-[#FAF7F2]/50">
            {locale === "ko" ? "신용카드 불필요 · 광고 없음 · 언제든 탈퇴 가능" : "No credit card · No ads · Leave anytime"}
          </p>
        </FadeInSection>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#F3EEE6] border-t border-[#E5DED2]/50 px-5 pt-12 pb-10">
        <div className="max-w-[980px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#4A1D3F] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#FAF7F2] text-[10px] font-display">K</span>
                </div>
                <span className="font-semibold text-[13px] text-[#1E1B18]">KoriBridge</span>
              </div>
              <p className="text-[12px] text-[#8A837B] leading-relaxed">{t.footerDesc}</p>
            </div>

            {[
              { title: t.footerCol1, links: t.footerLinks1 },
              { title: t.footerCol2, links: t.footerLinks2 },
              { title: t.footerCol3, links: t.footerLinks3 },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-semibold text-[#8A837B] uppercase tracking-wider mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link, li) => {
                    let action;
                    if (locale === "ko" ? link === "이용약관" : link === "Terms") action = goToTerms;
                    else if (locale === "ko" ? link === "개인정보" : link === "Privacy") action = goToPrivacy;
                    else if (locale === "ko" ? link === "프리미엄" : link === "Premium") action = goPricing;
                    return (
                      <li key={li}>
                        <button onClick={action} className="text-[12px] text-[#8A837B] hover:text-[#1E1B18] transition-colors duration-150">
                          {link}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[#E5DED2]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-[#8A837B]">{t.footerCopy}</p>
            <p className="text-[12px] text-[#B3AB9F]">{t.footerMade}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
