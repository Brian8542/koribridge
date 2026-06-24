import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocale } from "../hooks/useLocale";
import LanguageSelector from "../components/LanguageSelector";

const FadeInSection = React.memo(({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.65s ease-out ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
});

const MARQUEE_FLAGS = [
  "🇰🇷","🇺🇸","🇻🇳","🇹🇭","🇵🇭","🇮🇩","🇲🇾","🇰🇿","🇺🇿","🇨🇳","🇯🇵","🇧🇷",
  "🇮🇳","🇫🇷","🇩🇪","🇬🇧","🇲🇽","🇦🇺","🇨🇦","🇪🇸","🇸🇦","🇳🇱","🇸🇪","🇹🇷",
];

const PARTNER_PHOTOS = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
];

const LogoMark = () => (
  <div className="flex items-center gap-2.5 flex-shrink-0">
    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 9.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white" />
      </svg>
    </div>
    <span className="font-bold text-[15px] tracking-[-0.01em] text-neutral-900">KoriBridge</span>
  </div>
);

export default function SplashScreen() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, t, levelLabel } = useLocale();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToAuth    = useCallback(() => navigate("/auth"),    [navigate]);
  const goToTerms   = useCallback(() => navigate("/terms"),   [navigate]);
  const goToPrivacy = useCallback(() => navigate("/privacy"), [navigate]);
  const goToPricing = useCallback(() => navigate("/pricing"), [navigate]);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const PARTNERS = [
    {
      photo: PARTNER_PHOTOS[0], name: "Linh Nguyen",
      country: locale === "ko" ? "베트남" : "Vietnam",
      flag: "🇻🇳",
      level: levelLabel("초급"),
      levelKey: "초급",
      interests: locale === "ko" ? ["K-pop", "드라마"] : ["K-pop", "Drama"],
      online: true,
    },
    {
      photo: PARTNER_PHOTOS[1], name: "James Park",
      country: locale === "ko" ? "미국" : "USA",
      flag: "🇺🇸",
      level: levelLabel("중급"),
      levelKey: "중급",
      interests: locale === "ko" ? ["음식", "여행"] : ["Food", "Travel"],
      online: true,
    },
    {
      photo: PARTNER_PHOTOS[2], name: "Yuki Tanaka",
      country: locale === "ko" ? "일본" : "Japan",
      flag: "🇯🇵",
      level: levelLabel("고급"),
      levelKey: "고급",
      interests: locale === "ko" ? ["문학", "영화"] : ["Literature", "Film"],
      online: false,
    },
    {
      photo: PARTNER_PHOTOS[3], name: "Maria Silva",
      country: locale === "ko" ? "브라질" : "Brazil",
      flag: "🇧🇷",
      level: levelLabel("초급"),
      levelKey: "초급",
      interests: ["K-drama", locale === "ko" ? "뷰티" : "Beauty"],
      online: true,
    },
  ];

  const REVIEWS = [
    { name: "Sofia K.",   country: t.r1Country, rating: 5, text: t.r1Text, photo: PARTNER_PHOTOS[2] },
    { name: "Takeshi M.", country: t.r2Country, rating: 5, text: t.r2Text, photo: PARTNER_PHOTOS[1] },
    { name: "Aisha R.",   country: t.r3Country, rating: 5, text: t.r3Text, photo: PARTNER_PHOTOS[0] },
  ];

  const FEATURES = [
    {
      tag: t.f1Title,
      title: locale === "ko" ? "AI가 완벽한\n파트너를 찾아드립니다" : "AI finds your\nperfect partner",
      desc: t.f1Desc,
      img: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",
    },
    {
      tag: t.f2Title,
      title: locale === "ko" ? "실시간 피드백으로\n빠른 실력 향상" : "Real-time feedback\nfor faster progress",
      desc: t.f2Desc,
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    },
    {
      tag: t.f5Title,
      title: locale === "ko" ? "문화를 알면\n언어가 살아납니다" : "Culture brings\nlanguage alive",
      desc: t.f5Desc,
      img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    },
  ];

  const LEVEL_STYLE = {
    고급: "bg-blue-50 text-blue-700 border-blue-100",
    중급: "bg-amber-50 text-amber-700 border-amber-100",
    초급: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  const NAV_LINKS = [t.findPartner, t.community, t.learningTools];

  return (
    <div className="bg-surface-bg text-neutral-900 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>
          KoriBridge —{" "}
          {locale === "ko"
            ? "한국어·문화 교류 파트너 플랫폼"
            : "Korean Language & Culture Exchange"}
        </title>
        <meta
          name="description"
          content={
            locale === "ko"
              ? "전 세계 127개국 파트너와 실시간으로 한국어를 연습하고 문화를 교류하세요. AI 스마트 매칭, 완전 무료."
              : "Practice Korean in real-time with partners from 127 countries. AI-powered matching, completely free."
          }
        />
        <meta property="og:title" content="KoriBridge - 한국어·문화 교류 파트너 플랫폼" />
        <meta property="og:description" content="전 세계 127개국 파트너와 실시간으로 한국어를 연습하고 문화를 교류하세요. AI 매칭, 완전 무료." />
        <meta property="og:url" content="https://koribridge.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://koribridge.vercel.app/logo512.png" />
      </Helmet>

      {/* ─── NAV ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-surface-bg/94 backdrop-blur-xl shadow-nav border-b border-neutral-150"
            : "bg-surface-bg"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-[60px] flex items-center justify-between gap-4">
          <LogoMark />

          <div className="hidden md:flex items-center gap-6 text-sm text-neutral-500">
            {NAV_LINKS.map((label) => (
              <button key={label} className="hover:text-neutral-900 transition-colors duration-150 font-medium">
                {label}
              </button>
            ))}
            <button
              onClick={goToPricing}
              className="hover:text-neutral-900 transition-colors duration-150 font-medium"
            >
              {locale === "ko" ? "요금제" : "Pricing"}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <LanguageSelector />
            <button
              onClick={goToAuth}
              className="hidden sm:block px-3 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              {t.login}
            </button>
            <button
              onClick={goToAuth}
              className="px-4 py-2 text-sm font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-all duration-150 active:scale-[0.97]"
            >
              {t.startFree}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden ml-1 w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Menu"
            >
              <span className={`block w-4.5 h-[1.5px] bg-neutral-600 rounded-full transition-all duration-250 ${mobileOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
              <span className={`block w-4.5 h-[1.5px] bg-neutral-600 rounded-full transition-all duration-250 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4.5 h-[1.5px] bg-neutral-600 rounded-full transition-all duration-250 ${mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-250 ${mobileOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="border-t border-neutral-150 px-5 py-3 space-y-0.5 bg-surface-bg">
            {NAV_LINKS.map((item) => (
              <button
                key={item}
                onClick={closeMobile}
                className="w-full text-left py-3 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => { closeMobile(); goToPricing(); }}
              className="w-full text-left py-3 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
            >
              {locale === "ko" ? "요금제" : "Pricing"}
            </button>
            <div className="pt-1 pb-1">
              <button
                onClick={() => { closeMobile(); goToAuth(); }}
                className="w-full text-left py-3 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                {t.login}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-28 pb-20 px-5 bg-surface-bg">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Left */}
            <div>
              <div
                className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-600 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7 shadow-xs"
                style={{ animation: "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                {t.splashOnlineBadge}{" "}
                <strong className="text-neutral-900 font-bold">
                  1,247{locale === "ko" ? "명" : ""}
                </strong>
                {t.splashOnlineMid}
              </div>

              <h1
                className="font-extrabold tracking-[-0.03em] leading-[1.06] text-neutral-900"
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                  animation: "fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.12s both",
                }}
              >
                {t.heroLine1}
                <br />
                <span className="text-primary-500">
                  {t.heroLine2}
                </span>
                <br />
                {t.heroLine3}
              </h1>

              <p
                className="mt-6 text-base text-neutral-500 leading-relaxed max-w-md"
                style={{ animation: "fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}
              >
                {t.heroSub}
              </p>

              <div
                className="mt-8 flex flex-col sm:flex-row gap-3"
                style={{ animation: "fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}
              >
                <button
                  onClick={goToAuth}
                  className="group px-6 py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all duration-150 active:scale-[0.97] text-sm flex items-center justify-center gap-2 shadow-red-sm"
                >
                  {t.ctaPrimary}
                  <svg className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={goToAuth}
                  className="px-6 py-3.5 border border-neutral-200 bg-white text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 text-sm"
                >
                  {t.ctaSecondary}
                </button>
              </div>

              <div
                className="mt-10 flex flex-wrap items-center gap-5"
                style={{ animation: "fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.38s both" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["🇻🇳","🇺🇸","🇯🇵","🇧🇷","🇮🇩"].map((flag, i) => (
                      <span
                        key={i}
                        className="w-7 h-7 rounded-full bg-surface-muted border-2 border-white flex items-center justify-center text-sm shadow-xs"
                        style={{ zIndex: 5 - i }}
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 leading-tight">{t.heroStat1}</p>
                    <p className="text-xs text-neutral-400">{t.heroStat1Sub}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-neutral-200 hidden sm:block" />
                <div>
                  <p className="text-sm font-bold text-neutral-900 leading-tight">{t.heroStat2}</p>
                  <p className="text-xs text-neutral-400">{t.heroStat2Sub}</p>
                </div>
              </div>
            </div>

            {/* Right — photo */}
            <div
              className="relative hidden md:block"
              style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80"
                alt="Korean language exchange"
                className="w-full h-[460px] object-cover rounded-2xl shadow-card-lg"
                style={{ transform: "rotate(1deg)" }}
              />
              <div className="absolute inset-0 rounded-2xl bg-neutral-900/5 pointer-events-none" style={{ transform: "rotate(1deg)" }} />

              {/* Floating badge — bottom left */}
              <div className="absolute -bottom-5 -left-4 bg-white rounded-2xl shadow-card-md px-4 py-3 flex items-center gap-3 border border-neutral-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 leading-tight">
                    {locale === "ko" ? "매칭 완료!" : "Match found!"}
                  </p>
                  <p className="text-xs text-neutral-400 leading-tight">
                    {locale === "ko" ? "호환도 92%" : "92% compatible"}
                  </p>
                </div>
              </div>

              {/* Floating badge — top right */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-card-md px-3.5 py-2.5 border border-neutral-100">
                <p className="text-xs font-bold text-neutral-900">
                  127{locale === "ko" ? "개국" : " countries"}
                </p>
                <p className="text-xs text-neutral-400">
                  {locale === "ko" ? "전 세계 파트너" : "Global partners"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FLAG MARQUEE ─── */}
      <section className="py-8 bg-white overflow-hidden border-y border-neutral-150">
        <div
          className="flex items-center"
          style={{ animation: "marquee 28s linear infinite", width: "max-content" }}
        >
          {[...MARQUEE_FLAGS, ...MARQUEE_FLAGS].map((flag, i) => (
            <span key={i} className="text-2xl flex-shrink-0 px-4 leading-none select-none opacity-80">
              {flag}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-neutral-400 font-medium mt-3 tracking-[0.15em] uppercase">
          {locale === "ko" ? "127개국 학습자가 함께하는 플랫폼" : "Learners from 127 countries"}
        </p>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-20 bg-surface-bg border-b border-neutral-150">
        <FadeInSection className="max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-neutral-150">
            {[
              { num: "48K+",               label: t.stat1Label },
              { num: "127" + t.stat2Suffix, label: t.stat2Label },
              { num: "4.9",                label: t.stat3Label },
              { num: "92%",                label: t.stat4Label },
            ].map((s, i) => (
              <div key={s.label} className={`text-center px-6 py-2 ${i < 2 ? "mb-6 md:mb-0" : ""}`}>
                <p className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-[-0.02em]">
                  {s.num}
                </p>
                <p className="mt-1.5 text-xs text-neutral-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ─── PARTNER CARDS ─── */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-14">
            <p className="section-label mb-3">{t.partnersSectionTag}</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight">
                {t.partnersSectionTitle}
              </h2>
              <p className="text-neutral-400 text-sm max-w-xs">
                {t.partnersSectionSub}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARTNERS.map((p, i) => (
              <FadeInSection key={p.name} delay={i * 60}>
                <div className="bg-white rounded-2xl overflow-hidden border border-neutral-150 shadow-card hover:shadow-card-md hover:-translate-y-1 transition-all duration-200 flex flex-col h-full">
                  <div className="relative h-44 overflow-hidden bg-neutral-100">
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 to-transparent" />
                    <div
                      className={`absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        p.online ? "text-emerald-700" : "text-neutral-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          p.online ? "bg-emerald-500" : "bg-neutral-300"
                        }`}
                      />
                      {p.online ? t.splashOnline : t.splashOffline}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{p.flag}</span>
                      <p className="font-bold text-neutral-900 text-sm">{p.name}</p>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">{p.country}</p>
                    <span className={`mt-2 badge border ${LEVEL_STYLE[p.levelKey] || ""}`}>
                      {p.level}
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.interests.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-surface-muted text-neutral-500 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={goToAuth}
                      className="mt-auto pt-3 w-full py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-all duration-150 active:scale-[0.97]"
                    >
                      {t.chatBtn}
                    </button>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection className="mt-8 text-center" delay={240}>
            <button
              onClick={goToAuth}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 border border-neutral-200 px-6 py-2.5 rounded-full bg-white hover:border-neutral-300 hover:text-neutral-900 transition-all duration-150 shadow-xs"
            >
              {t.allPartnersBtn}
              <svg className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </FadeInSection>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-5 bg-surface-bg">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-20">
            <p className="section-label mb-3">{t.featuresSectionTag}</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight">
                {t.featuresSectionTitle}
              </h2>
              <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
                {t.featuresSectionSub}
              </p>
            </div>
          </FadeInSection>

          <div className="space-y-20">
            {FEATURES.map((f, i) => (
              <FadeInSection
                key={f.tag}
                className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-10 lg:gap-16 items-center`}
              >
                <div className="flex-1 w-full">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      src={f.img}
                      alt={f.tag}
                      className="w-full h-64 md:h-72 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-neutral-900/10" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="section-label mb-3">{f.tag}</p>
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight whitespace-pre-line">
                    {f.title}
                  </h3>
                  <p className="mt-4 text-neutral-500 text-sm leading-relaxed">{f.desc}</p>
                  <button
                    onClick={goToAuth}
                    className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors group"
                  >
                    {locale === "ko" ? "자세히 보기" : "Learn more"}
                    <svg className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-14">
            <p className="section-label mb-3">{t.reviewsSectionTag}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight">
              {t.reviewsSectionTitle}
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((item, i) => (
              <FadeInSection key={item.name} delay={i * 60}>
                <div className="bg-white rounded-2xl p-6 border border-neutral-150 shadow-card hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: item.rating }).map((_, ri) => (
                      <svg key={ri} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed flex-1">"{item.text}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-neutral-100">
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 leading-none">{item.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{item.country}</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28 px-5 bg-neutral-900">
        <FadeInSection className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-neutral-400 uppercase mb-5">
            {t.ctaTag}
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-0.02em] text-white leading-[1.1] mb-5">
            {t.ctaTitle1}
            <br />
            <span className="text-primary-400">
              {t.ctaTitle2}
            </span>
          </h2>
          <p className="text-neutral-400 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
            {t.ctaDesc}
          </p>
          <button
            onClick={goToAuth}
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all duration-150 active:scale-[0.97] text-sm shadow-red-md"
          >
            {t.ctaMainBtn}
            <svg className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="mt-5 text-xs text-neutral-600">
            {t.ctaSubText}{" "}
            <span className="text-neutral-500 font-semibold">{t.ctaSubBold}</span>
            {t.ctaSubEnd}
          </p>
        </FadeInSection>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-neutral-900 border-t border-white/5 pt-14 pb-10 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">K</span>
                </div>
                <span className="font-semibold text-sm text-white">KoriBridge</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">{t.footerDesc}</p>
            </div>

            {[
              { title: t.footerCol1, links: t.footerLinks1 },
              { title: t.footerCol2, links: t.footerLinks2 },
              { title: t.footerCol3, links: t.footerLinks3 },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link, li) => {
                    let action;
                    if (locale === "ko" ? link === "이용약관" : link === "Terms") action = goToTerms;
                    else if (locale === "ko" ? link === "개인정보" : link === "Privacy") action = goToPrivacy;
                    else if (locale === "ko" ? link === "프리미엄" : link === "Premium") action = goToPricing;
                    return (
                      <li key={li}>
                        <button
                          onClick={action}
                          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors duration-150"
                        >
                          {link}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-neutral-600">{t.footerCopy}</p>
            <p className="text-xs text-neutral-700">{t.footerMade}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
