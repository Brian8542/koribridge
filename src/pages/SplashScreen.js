import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocale } from "../hooks/useLocale";
import LanguageSelector from "../components/LanguageSelector";

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const IconTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z" />
  </svg>
);

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
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease-out ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
});

const StatCounter = React.memo(({ end, suffix, label, decimal = 0 }) => {
  const [count, setCount] = useState(0);
  const triggered = useRef(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !triggered.current) {
        triggered.current = true;
        obs.disconnect();
        const duration = 1600;
        const startTime = performance.now();
        const animate = (now) => {
          const p = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(parseFloat((ease * end).toFixed(decimal)));
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, decimal]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-black mb-2">
        <span className="bg-gradient-to-b from-white to-red-200 bg-clip-text text-transparent">
          {decimal > 0 ? count.toFixed(decimal) : Math.round(count)}{suffix}
        </span>
      </p>
      <p className="text-sm text-red-200/70 font-medium">{label}</p>
    </div>
  );
});

const FeatureCard = React.memo(({ icon, title, desc }) => (
  <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 cursor-default h-full">
    <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-red-500/10 flex items-center justify-center text-2xl mb-5 transition-all duration-300 group-hover:scale-110">
      {icon}
    </div>
    <h3 className="font-bold text-white text-base mb-2 group-hover:text-red-300 transition-colors duration-300">{title}</h3>
    <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
  </div>
));

const PartnerCard = React.memo(({ partner, onChat, chatLabel, onlineLabel, offlineLabel }) => (
  <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 h-full flex flex-col">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${partner.gradient} flex items-center justify-center text-xl font-black text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
        {partner.initial}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${partner.online ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
        <span className={`text-[10px] font-medium ${partner.online ? "text-emerald-400" : "text-zinc-600"}`}>
          {partner.online ? onlineLabel : offlineLabel}
        </span>
      </div>
    </div>
    <p className="font-bold text-white text-sm">{partner.name}</p>
    <p className="text-xs text-zinc-500 mt-0.5">{partner.country}</p>
    <div className="mt-2">
      <span className={`inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${partner.levelColor}`}>
        {partner.level}
      </span>
    </div>
    <div className="mt-3 flex flex-wrap gap-1.5">
      {partner.interests.map((tag) => (
        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">{tag}</span>
      ))}
    </div>
    <button
      onClick={onChat}
      className="group/btn mt-auto pt-4 w-full py-2.5 text-xs font-bold bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-xl hover:from-red-500 hover:to-rose-400 hover:shadow-lg hover:shadow-red-500/40 transition-all duration-200 active:scale-95"
    >
      {chatLabel}
      <span className="inline-block ml-1 transition-transform duration-200 group-hover/btn:translate-x-0.5">→</span>
    </button>
  </div>
));

const TestimonialCard = React.memo(({ item }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 flex flex-col h-full">
    <div className="flex items-center gap-0.5 mb-4">
      {Array.from({ length: item.rating }).map((_, i) => (
        <span key={i} className="text-amber-400 text-sm">★</span>
      ))}
    </div>
    <p className="text-sm text-zinc-400 leading-relaxed flex-1">"{item.text}"</p>
    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-zinc-800">
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}>
        {item.initial}
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-none">{item.name}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{item.country}</p>
      </div>
    </div>
  </div>
));

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

  const goToAuth = useCallback(() => navigate("/auth"), [navigate]);
  const goToTerms = useCallback(() => navigate("/terms"), [navigate]);
  const goToPrivacy = useCallback(() => navigate("/privacy"), [navigate]);
  const goToPricing = useCallback(() => navigate("/pricing"), [navigate]);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const FEATURES = [
    { icon: "🎯", title: t.f1Title, desc: t.f1Desc },
    { icon: "🎤", title: t.f2Title, desc: t.f2Desc },
    { icon: "📹", title: t.f3Title, desc: t.f3Desc },
    { icon: "📚", title: t.f4Title, desc: t.f4Desc },
    { icon: "🌸", title: t.f5Title, desc: t.f5Desc },
    { icon: "🏆", title: t.f6Title, desc: t.f6Desc },
  ];

  const PARTNERS = [
    {
      initial: "L", gradient: "from-violet-500 to-purple-500",
      name: "Linh Nguyen",
      country: locale === 'ko' ? "🇻🇳 베트남" : "🇻🇳 Vietnam",
      level: levelLabel("초급"),
      levelColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      interests: locale === 'ko' ? ["K-pop", "드라마"] : ["K-pop", "Drama"], online: true,
    },
    {
      initial: "J", gradient: "from-blue-500 to-cyan-500",
      name: "James Park",
      country: locale === 'ko' ? "🇺🇸 미국" : "🇺🇸 USA",
      level: levelLabel("중급"),
      levelColor: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      interests: locale === 'ko' ? ["음식", "여행"] : ["Food", "Travel"], online: true,
    },
    {
      initial: "Y", gradient: "from-amber-500 to-orange-500",
      name: "Yuki Tanaka",
      country: locale === 'ko' ? "🇯🇵 일본" : "🇯🇵 Japan",
      level: levelLabel("고급"),
      levelColor: "bg-red-500/10 text-red-400 border border-red-500/20",
      interests: locale === 'ko' ? ["문학", "영화"] : ["Literature", "Film"], online: false,
    },
    {
      initial: "M", gradient: "from-emerald-500 to-teal-500",
      name: "Maria Silva",
      country: locale === 'ko' ? "🇧🇷 브라질" : "🇧🇷 Brazil",
      level: levelLabel("초급"),
      levelColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      interests: ["K-drama", locale === 'ko' ? "뷰티" : "Beauty"], online: true,
    },
  ];

  const STATS = [
    { end: 48, suffix: "K+", label: t.stat1Label },
    { end: 127, suffix: t.stat2Suffix, label: t.stat2Label },
    { end: 4.9, suffix: "★", label: t.stat3Label, decimal: 1 },
    { end: 92, suffix: "%", label: t.stat4Label },
  ];

  const TESTIMONIALS = [
    {
      initial: "S", gradient: "from-pink-500 to-rose-500",
      name: "Sofia K.", country: t.r1Country, rating: 5,
      text: t.r1Text,
    },
    {
      initial: "T", gradient: "from-sky-500 to-blue-500",
      name: "Takeshi M.", country: t.r2Country, rating: 5,
      text: t.r2Text,
    },
    {
      initial: "A", gradient: "from-emerald-500 to-green-500",
      name: "Aisha R.", country: t.r3Country, rating: 5,
      text: t.r3Text,
    },
  ];

  const FOOTER_COLS = [
    { title: t.footerCol1, links: t.footerLinks1 },
    { title: t.footerCol2, links: t.footerLinks2 },
    { title: t.footerCol3, links: t.footerLinks3 },
  ];

  const NAV_LINKS = [t.findPartner, t.community, t.learningTools];

  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-x-hidden">
      <Helmet>
        <title>KoriBridge - {locale === 'ko' ? '한국어·문화 교류 파트너 플랫폼' : 'Korean Language & Culture Exchange'}</title>
        <meta name="description" content={locale === 'ko' ? '전 세계 127개국 파트너와 실시간으로 한국어를 연습하고 문화를 교류하세요. AI 스마트 매칭, 완전 무료.' : 'Practice Korean in real-time with partners from 127 countries. AI-powered matching, completely free.'} />
        <meta property="og:title" content="KoriBridge - 한국어·문화 교류 파트너 플랫폼" />
        <meta property="og:description" content="전 세계 127개국 파트너와 실시간으로 한국어를 연습하고 문화를 교류하세요. AI 매칭, 완전 무료." />
        <meta property="og:url" content="https://koribridge.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://koribridge.vercel.app/logo512.png" />
        <meta name="twitter:title" content="KoriBridge - 한국어·문화 교류 파트너 플랫폼" />
        <meta name="twitter:description" content="전 세계 127개국 파트너와 실시간으로 한국어를 연습하고 문화를 교류하세요." />
        <meta name="twitter:url" content="https://koribridge.vercel.app" />
      </Helmet>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.08] bg-zinc-950/95 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-b border-white/[0.04] bg-zinc-950/70 backdrop-blur-md"
      }`}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-sm shadow-lg shadow-red-900/50">K</div>
            <span className="font-extrabold text-[15px] tracking-tight">KoriBridge</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm text-zinc-500">
            {NAV_LINKS.map((label) => (
              <button key={label} className="hover:text-white transition-colors duration-200">{label}</button>
            ))}
            <button onClick={goToPricing} className="hover:text-white transition-colors duration-200">
              {locale === "ko" ? "요금제" : "Pricing"}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <LanguageSelector dark />
            <button onClick={goToAuth} className="hidden sm:block px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors duration-200">
              {t.login}
            </button>
            <button
              onClick={goToAuth}
              className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-red-600 to-rose-500 rounded-xl shadow-lg shadow-red-900/30 hover:from-red-500 hover:to-rose-400 hover:-translate-y-px transition-all duration-200 active:scale-95"
            >
              {t.startFree}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden ml-1 w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-zinc-800 transition-colors duration-200"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-zinc-400 rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-zinc-400 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-zinc-400 rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="border-t border-zinc-800/60 px-5 py-4 space-y-1">
            {NAV_LINKS.map((item) => (
              <button key={item} onClick={closeMobile} className="w-full text-left py-2.5 text-sm text-zinc-400 hover:text-white transition-colors">
                {item}
              </button>
            ))}
            <button onClick={() => { closeMobile(); goToPricing(); }} className="w-full text-left py-2.5 text-sm text-zinc-400 hover:text-white transition-colors">
              {locale === "ko" ? "요금제" : "Pricing"}
            </button>
            <div className="pt-2">
              <button onClick={() => { closeMobile(); goToAuth(); }} className="w-full text-left py-2.5 text-sm text-zinc-400 hover:text-white transition-colors">
                {t.login}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-32 px-5 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full bg-rose-500/8 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-zinc-400 mb-10"
            style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            {t.splashOnlineBadge} <span className="text-white font-semibold">1,247{locale === 'ko' ? '명' : ''}</span>{t.splashOnlineMid}
          </div>

          <h1 className="font-black tracking-[-0.03em] leading-[1.02]" style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}>
            <span className="text-white block" style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
              {t.heroLine1}
            </span>
            <span
              className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent block"
              style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.32s both" }}
            >
              {t.heroLine2}
            </span>
            <span className="text-white block" style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.44s both" }}>
              {t.heroLine3}
            </span>
          </h1>

          <p
            className="mt-8 text-lg md:text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed tracking-[-0.01em]"
            style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.54s both" }}
          >
            {t.heroSub}
          </p>

          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.62s both" }}
          >
            <button
              onClick={goToAuth}
              className="group px-8 py-4 bg-gradient-to-r from-red-600 to-rose-500 font-bold rounded-2xl shadow-2xl shadow-red-900/40 hover:from-red-500 hover:to-rose-400 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] text-[15px] w-full sm:w-auto"
            >
              {t.ctaPrimary}
              <span className="inline-block ml-1.5 transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={goToAuth}
              className="px-8 py-4 border border-zinc-700 font-semibold rounded-2xl hover:bg-white/5 hover:border-zinc-600 transition-all duration-200 text-[15px] w-full sm:w-auto text-zinc-400 hover:text-white"
            >
              {t.ctaSecondary}
            </button>
          </div>

          <div
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
            style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.72s both" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["🇻🇳", "🇺🇸", "🇯🇵", "🇧🇷", "🇮🇳"].map((flag, i) => (
                  <span key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-base" style={{ zIndex: 5 - i }}>
                    {flag}
                  </span>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{t.heroStat1}</p>
                <p className="text-xs text-zinc-500">{t.heroStat1Sub}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-zinc-800 hidden sm:block" />
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-white">{t.heroStat2}</p>
              <p className="text-xs text-zinc-500">{t.heroStat2Sub}</p>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div
              className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 space-y-2.5 hover:border-zinc-700 transition-colors duration-300 shadow-xl shadow-black/40"
              style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.82s both" }}
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-[11px] font-bold flex-shrink-0">L</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white leading-none truncate">Linh Nguyen</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{locale === 'ko' ? '🇻🇳 베트남 · 한국어 초급' : '🇻🇳 Vietnam · Korean Beginner'}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-zinc-300">
                {locale === 'ko' ? '안녕하세요! 한국어 공부하고 싶어요 😊' : 'Hello! I want to study Korean 😊'}
              </div>
              <div className="bg-gradient-to-r from-red-600/20 to-rose-500/20 border border-red-500/10 rounded-xl rounded-tr-sm px-3 py-2 text-sm text-zinc-300 ml-6">
                {locale === 'ko' ? '반가워요! 베트남어도 배우고 싶어요' : 'Nice to meet you! I want to learn Vietnamese too'}
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-zinc-300">
                {locale === 'ko' ? '정말요? 같이 교환해요! ✨' : "Really? Let's exchange! ✨"}
              </div>
            </div>

            <div
              className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 space-y-2.5 hover:border-zinc-700 transition-colors duration-300 shadow-xl shadow-black/40"
              style={{ animation: "fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.96s both" }}
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[11px] font-bold flex-shrink-0">J</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white leading-none truncate">James Park</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{locale === 'ko' ? '🇺🇸 미국 · 한국어 중급' : '🇺🇸 USA · Korean Intermediate'}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-zinc-300">
                {locale === 'ko' ? 'K-pop 좋아하세요? 저는 너무 좋아요!' : 'Do you like K-pop? I love it!'}
              </div>
              <div className="bg-gradient-to-r from-red-600/20 to-rose-500/20 border border-red-500/10 rounded-xl rounded-tr-sm px-3 py-2 text-sm text-zinc-300 ml-6">
                {locale === 'ko' ? '저도요! 가사 공부 같이 어때요? 🎵' : 'Me too! Want to study lyrics together? 🎵'}
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-zinc-300">
                {locale === 'ko' ? '완전 좋아요! 오늘부터 시작해요' : "Sounds great! Let's start today"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 px-5 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-4">{t.featuresSectionTag}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] leading-tight">{t.featuresSectionTitle}</h2>
            <p className="mt-5 text-zinc-500 text-base max-w-md mx-auto leading-relaxed">{t.featuresSectionSub}</p>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FadeInSection key={f.title} delay={i * 60}>
                <FeatureCard icon={f.icon} title={f.title} desc={f.desc} />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-5 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-4">{t.partnersSectionTag}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] leading-tight">{t.partnersSectionTitle}</h2>
            <p className="mt-5 text-zinc-500 text-base max-w-sm mx-auto">{t.partnersSectionSub}</p>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARTNERS.map((p, i) => (
              <FadeInSection key={p.name} delay={i * 80}>
                <PartnerCard
                  partner={p}
                  onChat={goToAuth}
                  chatLabel={t.chatBtn}
                  onlineLabel={t.splashOnline}
                  offlineLabel={t.splashOffline}
                />
              </FadeInSection>
            ))}
          </div>
          <FadeInSection className="mt-8 text-center" delay={320}>
            <button
              onClick={goToAuth}
              className="group inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-700 px-6 py-2.5 rounded-xl transition-all duration-200"
            >
              {t.allPartnersBtn}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </FadeInSection>
        </div>
      </section>

      <section className="py-24 px-5 bg-gradient-to-br from-red-700 via-red-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-black/20" />
        <div className="relative max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] text-white">{t.statsTitle}</h2>
            <p className="mt-3 text-red-200/70 text-base">{t.statsSub}</p>
          </FadeInSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <StatCounter key={s.label} end={s.end} suffix={s.suffix} label={s.label} decimal={s.decimal} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-5 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-4">{t.reviewsSectionTag}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] leading-tight">{t.reviewsSectionTitle}</h2>
            <p className="mt-5 text-zinc-500 text-base max-w-sm mx-auto">{t.reviewsSectionSub}</p>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((item, i) => (
              <FadeInSection key={item.name} delay={i * 80}>
                <TestimonialCard item={item} />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-5 bg-gradient-to-br from-red-900/50 via-zinc-950 to-zinc-950 relative overflow-hidden border-t border-zinc-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-red-600/15 blur-[100px] pointer-events-none" />
        <FadeInSection className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-5">{t.ctaTag}</p>
          <h2 className="text-5xl md:text-6xl font-black tracking-[-0.02em] leading-[1.06] mb-5">
            {t.ctaTitle1}
            <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              {t.ctaTitle2}
            </span>
          </h2>
          <p className="text-zinc-500 text-base mb-10 max-w-md mx-auto leading-relaxed">{t.ctaDesc}</p>
          <button
            onClick={goToAuth}
            className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-red-600 to-rose-500 font-bold rounded-2xl shadow-2xl shadow-red-900/50 hover:from-red-500 hover:to-rose-400 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] text-base"
          >
            {t.ctaMainBtn}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
          <p className="mt-6 text-xs text-zinc-600">
            {t.ctaSubText} <span className="text-zinc-400 font-semibold">{t.ctaSubBold}</span>{t.ctaSubEnd}
          </p>
        </FadeInSection>
      </section>

      <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-10 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-xs font-black">K</div>
                <span className="font-bold text-sm">KoriBridge</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed mb-5">{t.footerDesc}</p>
              <div className="flex items-center gap-3">
                {[IconX, IconInstagram, IconYoutube, IconTiktok].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all duration-200">
                    <Icon />
                  </button>
                ))}
              </div>
            </div>
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link, li) => (
                    <li key={li}>
                      <button
                        onClick={
                          (locale === 'ko' ? link === "이용약관" : link === "Terms" || link === "Terms of Service")
                            ? goToTerms
                            : (locale === 'ko' ? link === "개인정보" : link === "Privacy")
                            ? goToPrivacy
                            : undefined
                        }
                        className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-700">{t.footerCopy}</p>
            <p className="text-xs text-zinc-800">{t.footerMade}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
