import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocale } from "../hooks/useLocale";
import { usePublicStats } from "../hooks/usePublicStats";
import LanguageSelector from "../components/LanguageSelector";

const FadeInSection = React.memo(({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
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
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
});

const MARQUEE_FLAGS = [
  "🇰🇷","🇻🇳","🇰🇿","🇺🇿","🇵🇭","🇮🇩","🇲🇾","🇹🇭","🇨🇳","🇯🇵","🇧🇷",
  "🇮🇳","🇺🇸","🇫🇷","🇩🇪","🇬🇧","🇲🇽","🇸🇦","🇳🇱","🇷🇺","🇺🇦","🇲🇳",
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

function StatBar({ label, count, total, color = "bg-neutral-800" }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-600 w-28 flex-shrink-0 truncate font-medium">{label}</span>
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-neutral-400 w-8 text-right font-medium">{count}</span>
    </div>
  );
}

function MiniProfileCard({ name, country, flag, level, levelKey, bio, isVerified }) {
  const LEVEL_COLOR = {
    고급: "bg-blue-50 text-blue-700 border-blue-100",
    중급: "bg-amber-50 text-amber-700 border-amber-100",
    초급: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  const GRADIENTS = [
    "from-rose-400 to-pink-500",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
  ];
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const gradientIdx = name ? name.charCodeAt(0) % GRADIENTS.length : 0;
  return (
    <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-4 flex gap-3 items-start hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRADIENTS[gradientIdx]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-neutral-900">{name}</span>
          <span className="text-base leading-none">{flag}</span>
          {isVerified && (
            <span className="inline-flex items-center gap-0.5 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              인증
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">{country}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${LEVEL_COLOR[levelKey] || LEVEL_COLOR["초급"]}`}>
            {level}
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed line-clamp-2">{bio}</p>
      </div>
    </div>
  );
}

function StoryPersonCard({ name, flag, country, learningLang, quote, gradient, align = "left" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`bg-white rounded-2xl border border-neutral-150 shadow-card-md p-6 flex flex-col gap-4 ${align === "right" ? "md:text-right" : ""}`}>
      <div className={`flex items-center gap-3 ${align === "right" ? "md:flex-row-reverse" : ""}`}>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
          {initials}
        </div>
        <div>
          <div className={`flex items-center gap-1.5 ${align === "right" ? "md:flex-row-reverse" : ""}`}>
            <span className="font-bold text-neutral-900">{name}</span>
            <span className="text-lg leading-none">{flag}</span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">{country}</p>
        </div>
      </div>
      <div className={`text-xs text-neutral-500 ${align === "right" ? "md:text-right" : ""}`}>
        <span className="inline-flex items-center gap-1 bg-surface-bg border border-neutral-150 text-neutral-600 px-2.5 py-1 rounded-full font-medium">
          <svg className="w-3 h-3 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
          </svg>
          {learningLang} 배우는 중
        </span>
      </div>
      <p className="text-sm text-neutral-700 leading-relaxed italic">"{quote}"</p>
    </div>
  );
}

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: { ko: "실시간 채팅", en: "Real-Time Chat" },
    desc: { ko: "텍스트·이미지를 자유롭게 주고받으며 대화합니다", en: "Exchange text and images freely in real time" },
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: { ko: "음성 메모", en: "Voice Memo" },
    desc: { ko: "발음을 녹음해 파트너에게 보냅니다", en: "Record your pronunciation and share it" },
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    ),
    title: { ko: "교정 제안", en: "Correction" },
    desc: { ko: "파트너가 직접 문장을 고쳐줍니다", en: "Your partner corrects your sentences directly" },
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
    title: { ko: "즉시 번역", en: "Translate" },
    desc: { ko: "메시지를 바로 번역해 이해를 돕습니다", en: "Translate messages instantly for clarity" },
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: { ko: "스와이프 매칭", en: "Swipe Match" },
    desc: { ko: "카드 형태로 파트너를 탐색합니다", en: "Browse partners in a card format" },
    color: "text-rose-600 bg-rose-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: { ko: "안전 보호", en: "Safe & Secure" },
    desc: { ko: "신고·차단·이메일 인증으로 안전을 지킵니다", en: "Report, block, and email verification keep you safe" },
    color: "text-teal-600 bg-teal-50",
  },
];

export default function SplashScreen() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, t, levelLabel } = useLocale();
  const { stats, loading: statsLoading, hasEnoughData } = usePublicStats();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToAuth    = useCallback(() => navigate("/auth"),    [navigate]);
  const goToTerms   = useCallback(() => navigate("/terms"),   [navigate]);
  const goToPrivacy = useCallback(() => navigate("/privacy"), [navigate]);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const PREVIEW_PARTNERS = [
    {
      name: "Linh Nguyen",
      country: locale === "ko" ? "베트남" : "Vietnam",
      flag: "🇻🇳",
      level: levelLabel("초급"),
      levelKey: "초급",
      bio: locale === "ko"
        ? "K-pop 때문에 한국어를 시작했어요. 드라마 이야기 같이 해요."
        : "I started Korean because of K-pop. Let's talk dramas.",
      isVerified: true,
    },
    {
      name: "Daniyal K.",
      country: locale === "ko" ? "카자흐스탄" : "Kazakhstan",
      flag: "🇰🇿",
      level: levelLabel("중급"),
      levelKey: "중급",
      bio: locale === "ko"
        ? "한국 음식과 문화에 관심이 많아요. 진지하게 배우고 싶습니다."
        : "Really into Korean food and culture. Looking to learn seriously.",
      isVerified: true,
    },
    {
      name: "Maria S.",
      country: locale === "ko" ? "브라질" : "Brazil",
      flag: "🇧🇷",
      level: levelLabel("초급"),
      levelKey: "초급",
      bio: locale === "ko"
        ? "K-drama 팬이에요! 영어와 포르투갈어 가르쳐드릴 수 있어요."
        : "K-drama fan! Can teach English or Portuguese in return.",
      isVerified: false,
    },
  ];

  const REVIEWS = [
    { name: "Sofia K.",    country: t.r1Country, rating: 5, text: t.r1Text },
    { name: "Takeshi M.", country: t.r2Country, rating: 5, text: t.r2Text },
    { name: "Aisha R.",   country: t.r3Country, rating: 5, text: t.r3Text },
  ];

  const totalUsers       = stats?.total_users || 0;
  const verifiedCount    = stats?.verified_count || 0;
  const nationalityDist  = stats?.nationality_dist || [];
  const learningLangDist = stats?.learning_lang_dist || [];
  const levelDist        = stats?.level_dist || { 초급: 0, 중급: 0, 고급: 0 };
  const totalLevels      = (levelDist["초급"] || 0) + (levelDist["중급"] || 0) + (levelDist["고급"] || 0);
  const topNationalities = nationalityDist.slice(0, 5);
  const natTotal         = topNationalities.reduce((s, n) => s + (n.count || 0), 0);
  const topLangs         = learningLangDist.slice(0, 4);
  const langTotal        = topLangs.reduce((s, l) => s + (l.count || 0), 0);

  return (
    <div className="bg-white text-neutral-900 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>KoriBridge — {locale === "ko" ? "한국과 세계를 잇다" : "Connect Korea to the World"}</title>
        <meta
          name="description"
          content={locale === "ko"
            ? "이메일 인증 기반의 국제 언어 교류 플랫폼. 신뢰 먼저, 만남은 그 다음."
            : "An email-verified international language exchange platform. Trust first, connection second."}
        />
        <meta property="og:title" content="KoriBridge - 한국과 세계를 잇다" />
        <meta property="og:description" content="이메일 인증만으로 시작하는 한국어 교류." />
        <meta property="og:url" content="https://koribridge.vercel.app" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ─── NAV ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-nav border-b border-neutral-150"
            : "bg-white"
        }`}
      >
        <div className="max-w-5xl mx-auto px-5 h-[60px] flex items-center justify-between gap-4">
          <LogoMark />
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
              className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-150 active:scale-[0.97] shadow-red-sm"
            >
              {t.startFree}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden ml-1 w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Menu"
            >
              <span className={`block w-4 h-[1.5px] bg-neutral-600 rounded-full transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
              <span className={`block w-4 h-[1.5px] bg-neutral-600 rounded-full transition-all duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-[1.5px] bg-neutral-600 rounded-full transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
            </button>
          </div>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-200 ${mobileOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="border-t border-neutral-150 px-5 py-3 space-y-0 bg-white">
            <button onClick={() => { closeMobile(); goToAuth(); }} className="w-full text-left py-3 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors">
              {t.login}
            </button>
            <button onClick={() => { closeMobile(); goToTerms(); }} className="w-full text-left py-3 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors">
              {t.terms}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-28 pb-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left */}
            <div>
              <div
                className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8"
                style={{ animation: "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                {t.heroBadgeText}
              </div>

              <h1
                className="font-extrabold tracking-[-0.03em] leading-[1.08] text-neutral-900"
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                  animation: "fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.12s both",
                }}
              >
                {locale === "ko" ? (
                  <>한국과 세계를<br /><span className="text-primary-500">진심으로 잇다</span></>
                ) : (
                  <>Connect Korea<br /><span className="text-primary-500">to the World</span></>
                )}
              </h1>

              <p
                className="mt-6 text-base text-neutral-500 leading-relaxed max-w-sm"
                style={{ animation: "fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}
              >
                {locale === "ko"
                  ? "허위 프로필 없이, 이메일 인증만으로 시작합니다. 언어 실력과 관심사가 맞는 파트너를 만나보세요."
                  : "No fake profiles — just email verification. Meet partners matched by language level and shared interests."}
              </p>

              <div
                className="mt-8 flex flex-col sm:flex-row gap-3"
                style={{ animation: "fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.30s both" }}
              >
                <button
                  onClick={goToAuth}
                  className="group px-7 py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all duration-150 active:scale-[0.97] text-sm flex items-center justify-center gap-2 shadow-red-sm"
                >
                  {locale === "ko" ? "지금 무료로 시작하기" : "Start for Free"}
                  <svg className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={goToAuth}
                  className="px-7 py-3.5 border border-neutral-200 bg-white text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 text-sm"
                >
                  {locale === "ko" ? "파트너 둘러보기" : "Browse Partners"}
                </button>
              </div>

              <div
                className="mt-8 flex flex-wrap gap-2"
                style={{ animation: "fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) 0.38s both" }}
              >
                {[
                  locale === "ko" ? "완전 무료" : "Completely free",
                  locale === "ko" ? "광고 없음" : "No ads",
                  locale === "ko" ? "이메일 인증" : "Email verified",
                  locale === "ko" ? "신용카드 불필요" : "No credit card",
                ].map((pill) => (
                  <span key={pill} className="inline-flex items-center gap-1.5 text-xs text-neutral-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-full font-medium">
                    <span className="text-emerald-500 font-bold">✓</span>
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — preview cards */}
            <div
              className="space-y-3 hidden md:block"
              style={{ animation: "fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}
            >
              <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-4">
                {locale === "ko" ? "지금 가입된 멤버 예시" : "Sample verified members"}
              </p>
              {PREVIEW_PARTNERS.map((p) => (
                <MiniProfileCard key={p.name} {...p} />
              ))}
              <p className="text-xs text-neutral-400 text-center pt-1">
                {locale === "ko" ? "실제 멤버 유형을 바탕으로 한 예시입니다" : "Illustrative examples based on real member types"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FLAG MARQUEE ─── */}
      <section className="py-5 bg-surface-bg overflow-hidden border-y border-neutral-100">
        <div
          className="flex items-center"
          style={{ animation: "marquee 30s linear infinite", width: "max-content" }}
        >
          {[...MARQUEE_FLAGS, ...MARQUEE_FLAGS].map((flag, i) => (
            <span key={i} className="text-2xl flex-shrink-0 px-4 leading-none select-none opacity-70">
              {flag}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-neutral-400 font-medium mt-3 tracking-[0.12em] uppercase">
          {locale === "ko" ? "다양한 나라에서 오신 멤버들과 함께하세요" : "Members from all over the world"}
        </p>
      </section>

      {/* ─── STORY SECTION ─── */}
      <section className="py-20 px-5 bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-14">
            <p className="section-label mb-3">
              {locale === "ko" ? "이렇게 만납니다" : "Real Connections"}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight max-w-lg">
              {locale === "ko"
                ? "두 사람, KoriBridge에서 연결되다"
                : "Two people, connected on KoriBridge"}
            </h2>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            <FadeInSection delay={60}>
              <StoryPersonCard
                name="김민준"
                flag="🇰🇷"
                country={locale === "ko" ? "한국" : "Korea"}
                learningLang={locale === "ko" ? "카자흐어" : "Kazakh"}
                quote={locale === "ko"
                  ? "카자흐스탄 문화가 정말 궁금했어요. 현지 사람과 직접 대화하고 싶었습니다."
                  : "I was genuinely curious about Kazakh culture. I wanted to talk directly with someone from there."}
                gradient="from-rose-400 to-orange-400"
                align="left"
              />
            </FadeInSection>

            <FadeInSection delay={120} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center shadow-red-md mb-4">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-neutral-900 mb-2">
                {locale === "ko" ? "2024년 11월, 연결됐습니다" : "November 2024, connected"}
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {locale === "ko"
                  ? "민준과 Aisha는 KoriBridge에서 만나 서로의 언어를 가르쳐주고 있습니다. 지금은 매주 대화를 나눕니다."
                  : "Minjun and Aisha met on KoriBridge and teach each other their languages. They talk every week."}
              </p>
              <div className="mt-4 flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                  </svg>
                ))}
              </div>
            </FadeInSection>

            <FadeInSection delay={180}>
              <StoryPersonCard
                name="Aisha K."
                flag="🇰🇿"
                country={locale === "ko" ? "카자흐스탄" : "Kazakhstan"}
                learningLang={locale === "ko" ? "한국어" : "Korean"}
                quote={locale === "ko"
                  ? "K-드라마를 보다 한국어에 빠졌어요. 한국 친구와 직접 대화하고 싶었습니다."
                  : "I got hooked on Korean through K-dramas. I wanted to talk with a real Korean friend."}
                gradient="from-blue-400 to-indigo-500"
                align="right"
              />
            </FadeInSection>
          </div>

          <FadeInSection className="mt-10 text-center" delay={240}>
            <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
              {locale === "ko"
                ? "이런 만남이 매일 일어나고 있습니다. 당신의 이야기도 여기서 시작될 수 있습니다."
                : "Connections like this happen every day. Your story can start here too."}
            </p>
            <button
              onClick={goToAuth}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              {locale === "ko" ? "나도 시작하기" : "Start your story"}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </FadeInSection>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 px-5 bg-surface-bg border-b border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-12">
            <p className="section-label mb-3">
              {locale === "ko" ? "핵심 기능" : "Features"}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight">
                {locale === "ko"
                  ? "언어 교류를 위한 모든 것"
                  : "Everything you need to connect"}
              </h2>
              <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
                {locale === "ko"
                  ? "채팅부터 교정, 번역, 안전까지 한 곳에서"
                  : "Chat, correction, translation, safety — all in one place"}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FadeInSection key={i} delay={i * 60}>
                <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-5 h-full hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1.5">
                    {f.title[locale === "ko" ? "ko" : "en"]}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {f.desc[locale === "ko" ? "ko" : "en"]}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-5 bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-12">
            <p className="section-label mb-3">
              {locale === "ko" ? "시작 방법" : "How It Works"}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight">
              {t.howTitle}
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: "01", title: t.howStep1Title, desc: t.howStep1Desc,
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
              },
              { num: "02", title: t.howStep2Title, desc: t.howStep2Desc,
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
              },
              { num: "03", title: t.howStep3Title, desc: t.howStep3Desc,
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                ),
              },
            ].map((step, i) => (
              <FadeInSection key={step.num} delay={i * 80}>
                <div className="bg-surface-bg rounded-2xl border border-neutral-150 p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-xs">
                      {step.icon}
                    </div>
                    <span className="text-[11px] font-bold text-neutral-300 tracking-[0.15em]">STEP {step.num}</span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMUNITY STATS ─── */}
      <section className="py-20 px-5 bg-surface-bg border-b border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-12">
            <p className="section-label mb-3">{t.statsSectionTag}</p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight mb-3">
              {t.statsSectionTitle}
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xl">
              {locale === "ko" ? t.statsSectionNarrative : t.statsSectionNarrativeEn}
            </p>
          </FadeInSection>

          {statsLoading ? (
            <div className="flex items-center gap-3 py-12">
              <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-400 rounded-full animate-spin" />
              <span className="text-sm text-neutral-400">{t.loading}</span>
            </div>
          ) : hasEnoughData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FadeInSection>
                <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-6 h-full">
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-4">{t.statsTotalLabel}</p>
                  <p className="text-4xl font-extrabold text-neutral-900 tracking-[-0.03em]">{totalUsers.toLocaleString()}</p>
                  <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        {t.statsVerifiedLabel}
                      </span>
                      <span className="font-bold text-neutral-900">{verifiedCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">{locale === "ko" ? "이번 달 신규" : "New this month"}</span>
                      <span className="font-bold text-neutral-900">{stats?.joined_this_month || 0}</span>
                    </div>
                  </div>
                </div>
              </FadeInSection>

              {topNationalities.length > 0 && (
                <FadeInSection delay={80}>
                  <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-6 h-full">
                    <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-4">{t.statsNationalityTitle}</p>
                    <div className="space-y-3">
                      {topNationalities.map((n) => (
                        <StatBar key={n.nationality} label={n.nationality} count={n.count} total={natTotal} color="bg-neutral-800" />
                      ))}
                    </div>
                  </div>
                </FadeInSection>
              )}

              <FadeInSection delay={160}>
                <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-6 h-full">
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-4">{t.statsLevelTitle}</p>
                  <div className="space-y-4">
                    {[
                      { key: "초급", label: locale === "ko" ? "초급" : "Beginner", color: "bg-emerald-400", textColor: "text-emerald-700" },
                      { key: "중급", label: locale === "ko" ? "중급" : "Intermediate", color: "bg-amber-400", textColor: "text-amber-700" },
                      { key: "고급", label: locale === "ko" ? "고급" : "Advanced", color: "bg-blue-400", textColor: "text-blue-700" },
                    ].map(({ key, label, color, textColor }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className={`${textColor} font-semibold`}>{levelDist[key] || 0}{locale === "ko" ? "명" : ""}</span>
                          <span className="text-neutral-500">{label}</span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-700`}
                            style={{ width: totalLevels > 0 ? `${Math.round(((levelDist[key] || 0) / totalLevels) * 100)}%` : "0%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {topLangs.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-neutral-100">
                      <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-3">{t.statsLangTitle}</p>
                      <div className="space-y-2.5">
                        {topLangs.map((l) => (
                          <StatBar key={l.language} label={l.language} count={l.count} total={langTotal} color="bg-primary-400" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FadeInSection>
            </div>
          ) : (
            <FadeInSection>
              <div className="bg-white rounded-2xl border border-neutral-150 shadow-card p-10 text-center max-w-lg mx-auto">
                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">{t.statsEmptyTitle}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {locale === "ko" ? t.statsEmptyDesc : t.statsEmptyDescEn}
                </p>
                {totalUsers > 0 && (
                  <p className="mt-4 text-xs text-neutral-300">
                    {locale === "ko" ? `현재 ${totalUsers}명이 함께하고 있습니다` : `${totalUsers} member${totalUsers > 1 ? "s" : ""} so far`}
                  </p>
                )}
              </div>
            </FadeInSection>
          )}
        </div>
      </section>

      {/* ─── TRUST ─── */}
      <section className="py-20 px-5 bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-12">
            <p className="section-label mb-3">{t.trustSectionTag}</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight">
                {t.trustSectionTitle}
              </h2>
              <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
                {t.trustSectionDesc}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                color: "text-emerald-600 bg-emerald-50",
                title: t.trustItem1Title,
                desc: t.trustItem1Desc,
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
                color: "text-blue-600 bg-blue-50",
                title: t.trustItem2Title,
                desc: t.trustItem2Desc,
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
                color: "text-amber-600 bg-amber-50",
                title: t.trustItem3Title,
                desc: t.trustItem3Desc,
              },
            ].map((item, i) => (
              <FadeInSection key={item.title} delay={i * 80}>
                <div className="bg-surface-bg rounded-2xl border border-neutral-150 p-6 h-full">
                  <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNER PREVIEW ─── */}
      <section className="py-20 px-5 bg-surface-bg border-b border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-12">
            <p className="section-label mb-3">{t.partnersSectionTag}</p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight">
                {t.partnersSectionTitle}
              </h2>
              <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
                {t.partnersSectionSub}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PREVIEW_PARTNERS.map((p, i) => (
              <FadeInSection key={p.name} delay={i * 60}>
                <div className="bg-white rounded-2xl overflow-hidden border border-neutral-150 shadow-card hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                  <div className="px-4 pt-4 pb-3 border-b border-neutral-100 flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full ${
                      p.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-400"
                    }`}>
                      {p.isVerified ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {p.isVerified ? t.trustBadgeVerified : t.trustBadgeUnverified}
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${
                      p.levelKey === "고급" ? "bg-blue-50 text-blue-700 border-blue-100"
                      : p.levelKey === "중급" ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    }`}>
                      {p.level}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-sm flex-shrink-0">
                        {p.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-neutral-900">{p.name}</p>
                          <span className="text-sm">{p.flag}</span>
                        </div>
                        <p className="text-xs text-neutral-400">{p.country}</p>
                      </div>
                    </div>
                    {p.bio && (
                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3 flex-1">{p.bio}</p>
                    )}
                    <button
                      onClick={goToAuth}
                      className="w-full py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-700 transition-all duration-150 active:scale-[0.97] mt-auto"
                    >
                      {t.chatBtn}
                    </button>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection className="mt-8 text-center" delay={200}>
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

      {/* ─── REVIEWS ─── */}
      <section className="py-20 px-5 bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="mb-12">
            <p className="section-label mb-3">{t.reviewsSectionTag}</p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-[-0.02em] text-neutral-900 leading-tight">
              {t.reviewsSectionTitle}
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVIEWS.map((item, i) => (
              <FadeInSection key={item.name} delay={i * 60}>
                <div className="bg-surface-bg rounded-2xl p-6 border border-neutral-150 hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: item.rating }).map((_, ri) => (
                      <svg key={ri} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed flex-1">"{item.text}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-neutral-150">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500 flex-shrink-0">
                      {item.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 leading-none">{item.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{item.country}</p>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection className="mt-10 text-center" delay={200}>
            <p className="text-xs text-neutral-400 italic">
              {locale === "ko"
                ? "실제 사용자 예시를 기반으로 한 후기입니다. 더 많은 이야기가 채워질 예정입니다."
                : "These reviews are illustrative examples. More real stories coming soon."}
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-5 bg-neutral-900">
        <FadeInSection className="max-w-xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-5">
            {t.ctaTag}
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-white leading-[1.1] mb-5">
            {locale === "ko"
              ? <>오늘, 첫 대화를<br /><span className="text-primary-400">시작해보세요</span></>
              : <>Start your first<br /><span className="text-primary-400">conversation today</span></>}
          </h2>
          <p className="text-neutral-400 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
            {locale === "ko"
              ? "이메일 인증 후 바로 매칭이 시작됩니다. 완전 무료, 광고 없음, 신용카드 불필요."
              : "Matching starts the moment you sign up. Completely free, no ads, no credit card needed."}
          </p>
          <button
            onClick={goToAuth}
            className="group inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all duration-150 active:scale-[0.97] text-sm shadow-red-md"
          >
            {locale === "ko" ? "무료 가입하기" : "Sign Up Free"}
            <svg className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="mt-5 text-xs text-neutral-600">
            {locale === "ko"
              ? "이미 함께하는 멤버들과 새로운 만남을 시작하세요"
              : "Join members from around the world already on KoriBridge"}
          </p>
        </FadeInSection>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-neutral-900 border-t border-white/5 pt-12 pb-10 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
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

          <div className="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-neutral-600">{t.footerCopy}</p>
            <p className="text-xs text-neutral-700">{t.footerMade}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
