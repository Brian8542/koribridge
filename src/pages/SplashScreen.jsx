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
      { threshold: 0.08 }
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
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
});

const MARQUEE_FLAGS = [
  "🇰🇷","🇺🇸","🇯🇵","🇨🇳","🇻🇳","🇧🇷","🇮🇳","🇫🇷","🇩🇪","🇬🇧",
  "🇲🇽","🇦🇺","🇨🇦","🇮🇩","🇹🇭","🇵🇭","🇪🇸","🇮🇹","🇷🇺","🇹🇷",
  "🇦🇷","🇵🇱","🇸🇦","🇳🇱","🇸🇪","🇳🇬","🇵🇰","🇪🇬","🇺🇦","🇿🇦",
];

const PARTNER_PHOTOS = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
];

export default function SplashScreen() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, t, levelLabel } = useLocale();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
      country: locale === "ko" ? "🇻🇳 베트남" : "🇻🇳 Vietnam",
      level: levelLabel("초급"),
      levelColor: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      interests: locale === "ko" ? ["K-pop", "드라마"] : ["K-pop", "Drama"],
      online: true,
    },
    {
      photo: PARTNER_PHOTOS[1], name: "James Park",
      country: locale === "ko" ? "🇺🇸 미국" : "🇺🇸 USA",
      level: levelLabel("중급"),
      levelColor: "bg-blue-50 text-blue-600 border border-blue-100",
      interests: locale === "ko" ? ["음식", "여행"] : ["Food", "Travel"],
      online: true,
    },
    {
      photo: PARTNER_PHOTOS[2], name: "Yuki Tanaka",
      country: locale === "ko" ? "🇯🇵 일본" : "🇯🇵 Japan",
      level: levelLabel("고급"),
      levelColor: "bg-rose-50 text-rose-600 border border-rose-100",
      interests: locale === "ko" ? ["문학", "영화"] : ["Literature", "Film"],
      online: false,
    },
    {
      photo: PARTNER_PHOTOS[3], name: "Maria Silva",
      country: locale === "ko" ? "🇧🇷 브라질" : "🇧🇷 Brazil",
      level: levelLabel("초급"),
      levelColor: "bg-emerald-50 text-emerald-600 border border-emerald-100",
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

  const NAV_LINKS = [t.findPartner, t.community, t.learningTools];

  return (
    <div className="bg-white text-[#1d1d1f] min-h-screen overflow-x-hidden">
      <Helmet>
        <title>
          KoriBridge -{" "}
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
        <meta name="twitter:title" content="KoriBridge - 한국어·문화 교류 파트너 플랫폼" />
        <meta name="twitter:description" content="전 세계 127개국 파트너와 실시간으로 한국어를 연습하고 문화를 교류하세요." />
        <meta name="twitter:url" content="https://koribridge.vercel.app" />
      </Helmet>

      {/* ─── NAV ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100"
            : "bg-white"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-sm text-white shadow-md">
              K
            </div>
            <span className="font-extrabold text-[15px] tracking-tight text-[#1d1d1f]">
              KoriBridge
            </span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm text-[#6e6e73]">
            {NAV_LINKS.map((label) => (
              <button key={label} className="hover:text-[#1d1d1f] transition-colors duration-200">
                {label}
              </button>
            ))}
            <button
              onClick={goToPricing}
              className="hover:text-[#1d1d1f] transition-colors duration-200"
            >
              {locale === "ko" ? "요금제" : "Pricing"}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <LanguageSelector />
            <button
              onClick={goToAuth}
              className="hidden sm:block px-4 py-2 text-sm font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors duration-200"
            >
              {t.login}
            </button>
            <button
              onClick={goToAuth}
              className="px-4 py-2 text-sm font-bold bg-[#1d1d1f] text-white rounded-full hover:bg-[#3a3a3c] transition-all duration-200 active:scale-95"
            >
              {t.startFree}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden ml-1 w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="border-t border-gray-100 px-5 py-4 space-y-1 bg-white">
            {NAV_LINKS.map((item) => (
              <button
                key={item}
                onClick={closeMobile}
                className="w-full text-left py-2.5 text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => { closeMobile(); goToPricing(); }}
              className="w-full text-left py-2.5 text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
            >
              {locale === "ko" ? "요금제" : "Pricing"}
            </button>
            <div className="pt-2">
              <button
                onClick={() => { closeMobile(); goToAuth(); }}
                className="w-full text-left py-2.5 text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
              >
                {t.login}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-28 pb-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — text */}
            <div>
              <div
                className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-bold px-3.5 py-1.5 rounded-full mb-8"
                style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                {t.splashOnlineBadge}{" "}
                <strong className="text-[#1d1d1f]">
                  1,247{locale === "ko" ? "명" : ""}
                </strong>
                {t.splashOnlineMid}
              </div>

              <h1
                className="font-black tracking-[-0.03em] leading-[1.06] text-[#1d1d1f]"
                style={{
                  fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
                  animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.18s both",
                }}
              >
                {t.heroLine1}
                <br />
                <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                  {t.heroLine2}
                </span>
                <br />
                {t.heroLine3}
              </h1>

              <p
                className="mt-6 text-lg text-[#6e6e73] leading-relaxed max-w-md"
                style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.28s both" }}
              >
                {t.heroSub}
              </p>

              <div
                className="mt-8 flex flex-col sm:flex-row gap-3"
                style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.38s both" }}
              >
                <button
                  onClick={goToAuth}
                  className="group px-7 py-3.5 bg-[#1d1d1f] text-white font-bold rounded-full hover:bg-[#3a3a3c] transition-all duration-200 active:scale-[0.98] text-[15px] flex items-center justify-center gap-2"
                >
                  {t.ctaPrimary}
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </button>
                <button
                  onClick={goToAuth}
                  className="px-7 py-3.5 border border-[#d2d2d7] text-[#1d1d1f] font-semibold rounded-full hover:bg-[#f5f5f7] transition-all duration-200 text-[15px]"
                >
                  {t.ctaSecondary}
                </button>
              </div>

              <div
                className="mt-10 flex flex-wrap items-center gap-4"
                style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.46s both" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["🇻🇳","🇺🇸","🇯🇵","🇧🇷","🇮🇳"].map((flag, i) => (
                      <span
                        key={i}
                        className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-base"
                        style={{ zIndex: 5 - i }}
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1d1d1f]">{t.heroStat1}</p>
                    <p className="text-xs text-[#6e6e73]">{t.heroStat1Sub}</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-[#d2d2d7] hidden sm:block" />
                <div>
                  <p className="text-sm font-bold text-[#1d1d1f]">{t.heroStat2}</p>
                  <p className="text-xs text-[#6e6e73]">{t.heroStat2Sub}</p>
                </div>
              </div>
            </div>

            {/* Right — photo */}
            <div
              className="relative hidden md:block"
              style={{ animation: "fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}
            >
              <div style={{ transform: "rotate(2deg)" }}>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80"
                  alt="Korean language exchange"
                  className="w-full h-[480px] object-cover rounded-3xl shadow-2xl shadow-gray-200"
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-red-500/8 to-transparent pointer-events-none" />
              </div>
              {/* floating badges */}
              <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  AI
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1d1d1f]">
                    {locale === "ko" ? "매칭 완료!" : "Match found!"}
                  </p>
                  <p className="text-[10px] text-[#6e6e73]">
                    {locale === "ko" ? "92% 호환 파트너" : "92% compatible"}
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-100">
                <p className="text-xs font-bold text-[#1d1d1f]">
                  🌍 127{locale === "ko" ? "개국" : " countries"}
                </p>
                <p className="text-[10px] text-[#6e6e73]">
                  {locale === "ko" ? "전 세계 파트너" : "Global partners"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <section className="py-10 bg-[#f5f5f7] overflow-hidden border-y border-gray-200">
        <div
          className="flex items-center"
          style={{ animation: "marquee 32s linear infinite", width: "max-content" }}
        >
          {[...MARQUEE_FLAGS, ...MARQUEE_FLAGS].map((flag, i) => (
            <span key={i} className="text-3xl flex-shrink-0 px-5 leading-none select-none">
              {flag}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-[#6e6e73] font-medium mt-4 tracking-widest uppercase">
          {locale === "ko" ? "127개국 학습자가 함께하는 플랫폼" : "Learners from 127 countries"}
        </p>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-20 bg-white border-b border-gray-100">
        <FadeInSection className="max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "48K+",               label: t.stat1Label },
              { num: "127" + t.stat2Suffix, label: t.stat2Label },
              { num: "4.9★",               label: t.stat3Label },
              { num: "92%",                label: t.stat4Label },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-4xl md:text-5xl font-black text-[#1d1d1f] tracking-[-0.03em]">
                  {s.num}
                </p>
                <p className="mt-2 text-sm text-[#6e6e73]">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ─── PARTNERS ─── */}
      <section className="py-24 px-5 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.18em] text-red-500 uppercase mb-3">
              {t.partnersSectionTag}
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] text-[#1d1d1f] leading-tight">
              {t.partnersSectionTitle}
            </h2>
            <p className="mt-4 text-[#6e6e73] text-base max-w-sm mx-auto">
              {t.partnersSectionSub}
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARTNERS.map((p, i) => (
              <FadeInSection key={p.name} delay={i * 80}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div
                      className={`absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        p.online ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          p.online ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                        }`}
                      />
                      {p.online ? t.splashOnline : t.splashOffline}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="font-bold text-[#1d1d1f] text-sm">{p.name}</p>
                    <p className="text-xs text-[#6e6e73] mt-0.5">{p.country}</p>
                    <span className={`mt-2 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-semibold w-fit ${p.levelColor}`}>
                      {p.level}
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.interests.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6e6e73]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={goToAuth}
                      className="mt-auto pt-4 w-full py-2.5 text-xs font-bold bg-[#1d1d1f] text-white rounded-xl hover:bg-[#3a3a3c] transition-all duration-200 active:scale-95"
                    >
                      {t.chatBtn}
                    </button>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection className="mt-8 text-center" delay={320}>
            <button
              onClick={goToAuth}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#1d1d1f] border border-[#d2d2d7] px-6 py-2.5 rounded-full hover:bg-[#1d1d1f] hover:text-white hover:border-[#1d1d1f] transition-all duration-200"
            >
              {t.allPartnersBtn}
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </button>
          </FadeInSection>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-20">
            <p className="text-xs font-bold tracking-[0.18em] text-red-500 uppercase mb-3">
              {t.featuresSectionTag}
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] text-[#1d1d1f] leading-tight">
              {t.featuresSectionTitle}
            </h2>
            <p className="mt-4 text-[#6e6e73] text-base max-w-md mx-auto leading-relaxed">
              {t.featuresSectionSub}
            </p>
          </FadeInSection>

          <div className="space-y-24">
            {FEATURES.map((f, i) => (
              <FadeInSection
                key={f.tag}
                className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-10 lg:gap-20 items-center`}
              >
                <div className="flex-1 w-full">
                  <img
                    src={f.img}
                    alt={f.tag}
                    className="w-full h-72 object-cover rounded-3xl shadow-lg shadow-gray-200"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold tracking-[0.18em] text-red-500 uppercase mb-3">
                    {f.tag}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-black tracking-[-0.02em] text-[#1d1d1f] leading-tight whitespace-pre-line">
                    {f.title}
                  </h3>
                  <p className="mt-5 text-[#6e6e73] text-base leading-relaxed">{f.desc}</p>
                  <button
                    onClick={goToAuth}
                    className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 transition-colors group"
                  >
                    {locale === "ko" ? "자세히 보기" : "Learn more"}
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                  </button>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="py-24 px-5 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.18em] text-red-500 uppercase mb-3">
              {t.reviewsSectionTag}
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] text-[#1d1d1f] leading-tight">
              {t.reviewsSectionTitle}
            </h2>
            <p className="mt-4 text-[#6e6e73] text-base max-w-sm mx-auto">
              {t.reviewsSectionSub}
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((item, i) => (
              <FadeInSection key={item.name} delay={i * 80}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: item.rating }).map((_, ri) => (
                      <span key={ri} className="text-amber-400 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-[#6e6e73] leading-relaxed flex-1">"{item.text}"</p>
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d1f] leading-none">{item.name}</p>
                      <p className="text-xs text-[#6e6e73] mt-0.5">{item.country}</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 px-5 bg-black">
        <FadeInSection className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-5">
            {t.ctaTag}
          </p>
          <h2 className="text-5xl md:text-6xl font-black tracking-[-0.02em] text-white leading-[1.05] mb-5">
            {t.ctaTitle1}
            <br />
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              {t.ctaTitle2}
            </span>
          </h2>
          <p className="text-gray-400 text-base mb-10 max-w-md mx-auto leading-relaxed">
            {t.ctaDesc}
          </p>
          <button
            onClick={goToAuth}
            className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-[#1d1d1f] font-bold rounded-full hover:bg-gray-100 transition-all duration-200 active:scale-[0.98] text-base"
          >
            {t.ctaMainBtn}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
          <p className="mt-6 text-xs text-gray-600">
            {t.ctaSubText}{" "}
            <span className="text-gray-400 font-semibold">{t.ctaSubBold}</span>
            {t.ctaSubEnd}
          </p>
        </FadeInSection>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#f5f5f7] border-t border-gray-200 pt-16 pb-10 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-xs font-black text-white">
                  K
                </div>
                <span className="font-bold text-sm text-[#1d1d1f]">KoriBridge</span>
              </div>
              <p className="text-xs text-[#6e6e73] leading-relaxed">{t.footerDesc}</p>
            </div>

            {[
              { title: t.footerCol1, links: t.footerLinks1 },
              { title: t.footerCol2, links: t.footerLinks2 },
              { title: t.footerCol3, links: t.footerLinks3 },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-4">
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
                          className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors duration-200"
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

          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#6e6e73]">{t.footerCopy}</p>
            <p className="text-xs text-[#aeaeb2]">{t.footerMade}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
