import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const FEATURES = [
  {
    icon: "🎯",
    title: "스마트 매칭",
    desc: "국적·언어 수준·관심사를 AI가 분석해 최적의 파트너를 자동 연결합니다.",
  },
  {
    icon: "🎤",
    title: "AI 발음 교정",
    desc: "실시간 AI가 발음을 분석하고 즉각적인 교정 피드백을 제공합니다.",
  },
  {
    icon: "📹",
    title: "영상 통화",
    desc: "얼굴을 보며 더 자연스럽게 대화하고 비언어적 표현력을 키워보세요.",
  },
  {
    icon: "📚",
    title: "AI 학습 플랜",
    desc: "AI가 학습 패턴을 분석해 맞춤형 학습 로드맵을 자동으로 설계합니다.",
  },
  {
    icon: "🌸",
    title: "문화 콘텐츠",
    desc: "K-pop, 드라마, 음식, 여행 등 한국 문화를 파트너와 함께 탐구합니다.",
  },
  {
    icon: "🏆",
    title: "게임화 학습",
    desc: "스트릭, 뱃지, 리더보드로 꾸준한 학습 동기부여를 유지합니다.",
  },
];

const PARTNERS = [
  {
    initial: "L",
    gradient: "from-violet-500 to-purple-500",
    name: "Linh Nguyen",
    country: "🇻🇳 베트남",
    level: "초급",
    levelColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    interests: ["K-pop", "드라마"],
    online: true,
  },
  {
    initial: "J",
    gradient: "from-blue-500 to-cyan-500",
    name: "James Park",
    country: "🇺🇸 미국",
    level: "중급",
    levelColor: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    interests: ["음식", "여행"],
    online: true,
  },
  {
    initial: "Y",
    gradient: "from-amber-500 to-orange-500",
    name: "Yuki Tanaka",
    country: "🇯🇵 일본",
    level: "고급",
    levelColor: "bg-red-500/10 text-red-400 border border-red-500/20",
    interests: ["문학", "영화"],
    online: false,
  },
  {
    initial: "M",
    gradient: "from-emerald-500 to-teal-500",
    name: "Maria Silva",
    country: "🇧🇷 브라질",
    level: "초급",
    levelColor: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    interests: ["K-drama", "뷰티"],
    online: true,
  },
];

const STATS = [
  { value: "48K+", label: "활성 학습자" },
  { value: "127개", label: "참여 국가" },
  { value: "4.9★", label: "평균 평점" },
  { value: "92%", label: "목표 달성률" },
];

const TESTIMONIALS = [
  {
    initial: "S",
    gradient: "from-pink-500 to-rose-500",
    name: "Sofia K.",
    country: "스페인",
    rating: 5,
    text: "3개월 만에 한국어로 자유롭게 대화할 수 있게 됐어요. KoriBridge 없었으면 불가능했을 거예요!",
  },
  {
    initial: "T",
    gradient: "from-sky-500 to-blue-500",
    name: "Takeshi M.",
    country: "일본",
    rating: 5,
    text: "매칭 알고리즘이 정말 놀라워요. 첫 파트너와 지금까지 6개월째 대화 중입니다.",
  },
  {
    initial: "A",
    gradient: "from-emerald-500 to-green-500",
    name: "Aisha R.",
    country: "인도",
    rating: 5,
    text: "AI 발음 교정 덕분에 한국 친구들이 제 발음이 좋아졌다고 해요. 정말 효과적입니다.",
  },
];

const FOOTER_COLS = [
  {
    title: "플랫폼",
    links: ["파트너 찾기", "커뮤니티", "학습 도구", "프리미엄"],
  },
  {
    title: "회사",
    links: ["소개", "블로그", "채용", "보도자료"],
  },
  {
    title: "지원",
    links: ["도움말", "이용약관", "개인정보", "문의하기"],
  },
];

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

const FeatureCard = React.memo(({ icon, title, desc }) => (
  <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-red-500/40 hover:bg-zinc-900/60 transition-all duration-300 cursor-default">
    <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-red-500/10 flex items-center justify-center text-2xl mb-5 transition-colors duration-300">
      {icon}
    </div>
    <h3 className="font-bold text-white text-base mb-2 group-hover:text-red-300 transition-colors duration-300">
      {title}
    </h3>
    <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
  </div>
));

const PartnerCard = React.memo(({ partner, onChat }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${partner.gradient} flex items-center justify-center text-xl font-black text-white shadow-lg`}
      >
        {partner.initial}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            partner.online ? "bg-emerald-400" : "bg-zinc-600"
          }`}
        />
        <span className={`text-[10px] font-medium ${partner.online ? "text-emerald-400" : "text-zinc-600"}`}>
          {partner.online ? "온라인" : "오프라인"}
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
        <span
          key={tag}
          className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
        >
          {tag}
        </span>
      ))}
    </div>

    <button
      onClick={onChat}
      className="mt-4 w-full py-2.5 text-xs font-bold bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-xl hover:from-red-500 hover:to-rose-400 transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/20"
    >
      채팅하기
    </button>
  </div>
));

const TestimonialCard = React.memo(({ item }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors duration-300 flex flex-col">
    <div className="flex items-center gap-0.5 mb-4">
      {Array.from({ length: item.rating }).map((_, i) => (
        <span key={i} className="text-amber-400 text-sm">★</span>
      ))}
    </div>
    <p className="text-sm text-zinc-400 leading-relaxed flex-1">"{item.text}"</p>
    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-zinc-800">
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}
      >
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

  const goToAuth = useCallback(() => navigate("/auth"), [navigate]);
  const goToTerms = useCallback(() => navigate("/terms"), [navigate]);
  const goToPrivacy = useCallback(() => navigate("/privacy"), [navigate]);

  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-x-hidden">
      <Helmet>
        <title>KoriBridge - 한국어·문화 교류 파트너 플랫폼</title>
      </Helmet>

      {/* ── 고정 네비게이션 ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-zinc-950/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-sm shadow-lg shadow-red-900/50">
              K
            </div>
            <span className="font-extrabold text-[15px] tracking-tight">KoriBridge</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm text-zinc-500">
            <button className="hover:text-white transition-colors duration-200">파트너 찾기</button>
            <button className="hover:text-white transition-colors duration-200">커뮤니티</button>
            <button className="hover:text-white transition-colors duration-200">학습도구</button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={goToAuth}
              className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors duration-200"
            >
              로그인
            </button>
            <button
              onClick={goToAuth}
              className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-red-600 to-rose-500 rounded-xl shadow-lg shadow-red-900/30 hover:from-red-500 hover:to-rose-400 hover:-translate-y-px transition-all duration-200 active:scale-95"
            >
              무료 시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* ── 히어로 섹션 ── */}
      <section className="relative pt-40 pb-32 px-5 overflow-hidden">
        {/* 배경 글로우 */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full bg-rose-500/8 blur-3xl pointer-events-none" />
        {/* 닷 그리드 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* 하단 페이드 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* 활성 배지 */}
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-zinc-400 mb-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            지금{" "}
            <span className="text-white font-semibold">1,247명</span>이 한국어로 대화 중
          </div>

          {/* 메인 헤드라인 */}
          <h1 className="text-5xl sm:text-6xl md:text-[76px] font-black tracking-[-0.02em] leading-[1.04]">
            <span className="text-white">말이 통하면</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              한국어가
            </span>
            <br />
            <span className="text-white">이어집니다</span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-zinc-500 max-w-lg mx-auto leading-relaxed">
            전 세계 127개국 파트너와 실시간으로 한국어를 연습하고,
            <br className="hidden sm:block" />
            문화를 교류하며 진짜 언어 실력을 키워보세요.
          </p>

          {/* CTA 버튼 */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={goToAuth}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-500 font-bold rounded-2xl shadow-2xl shadow-red-900/40 hover:from-red-500 hover:to-rose-400 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] text-[15px] w-full sm:w-auto"
            >
              지금 무료로 시작하기 →
            </button>
            <button
              onClick={goToAuth}
              className="px-8 py-4 border border-zinc-700 font-semibold rounded-2xl hover:bg-white/5 hover:border-zinc-600 transition-all duration-200 text-[15px] w-full sm:w-auto text-zinc-400 hover:text-white"
            >
              파트너 둘러보기
            </button>
          </div>

          {/* 통계 배지 + 국기 */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["🇻🇳", "🇺🇸", "🇯🇵", "🇧🇷", "🇮🇳"].map((flag, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-base"
                    style={{ zIndex: 5 - i }}
                  >
                    {flag}
                  </span>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">48,000+ 명</p>
                <p className="text-xs text-zinc-500">활성 학습자</p>
              </div>
            </div>

            <div className="w-px h-8 bg-zinc-800 hidden sm:block" />

            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-white">매일 12만+ 대화</p>
              <p className="text-xs text-zinc-500">127개국 파트너 연결</p>
            </div>
          </div>

          {/* 채팅 미리보기 카드 2개 — dark glass */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {/* 카드 1 */}
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 space-y-2.5 hover:border-zinc-700 transition-colors duration-300 shadow-xl shadow-black/40">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  L
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white leading-none truncate">Linh Nguyen</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">🇻🇳 베트남 · 한국어 초급</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-zinc-300">
                안녕하세요! 한국어 공부하고 싶어요 😊
              </div>
              <div className="bg-gradient-to-r from-red-600/20 to-rose-500/20 border border-red-500/10 rounded-xl rounded-tr-sm px-3 py-2 text-sm text-zinc-300 ml-6">
                반가워요! 베트남어도 배우고 싶어요
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-zinc-300">
                정말요? 같이 교환해요! ✨
              </div>
            </div>

            {/* 카드 2 */}
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 space-y-2.5 hover:border-zinc-700 transition-colors duration-300 shadow-xl shadow-black/40">
              <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  J
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white leading-none truncate">James Park</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">🇺🇸 미국 · 한국어 중급</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-zinc-300">
                K-pop 좋아하세요? 저는 너무 좋아요!
              </div>
              <div className="bg-gradient-to-r from-red-600/20 to-rose-500/20 border border-red-500/10 rounded-xl rounded-tr-sm px-3 py-2 text-sm text-zinc-300 ml-6">
                저도요! 가사 공부 같이 어때요? 🎵
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-zinc-300">
                완전 좋아요! 오늘부터 시작해요
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 기능 섹션 ── */}
      <section className="py-28 px-5 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-4">
              핵심 기능
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              언어 학습을 다시 설계했습니다
            </h2>
            <p className="mt-4 text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
              단순한 채팅 앱이 아닙니다. AI와 사람이 함께 만드는 완전히 새로운 언어 교류 경험.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 파트너 섹션 ── */}
      <section className="py-28 px-5 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-4">
              파트너 찾기
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              지금 연결 가능한 파트너들
            </h2>
            <p className="mt-4 text-zinc-500 text-sm max-w-sm mx-auto">
              전 세계 127개국에서 당신의 첫 대화를 기다리고 있어요.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARTNERS.map((p) => (
              <PartnerCard key={p.name} partner={p} onChat={goToAuth} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={goToAuth}
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-700 px-6 py-2.5 rounded-xl transition-all duration-200"
            >
              모든 파트너 보기 →
            </button>
          </div>
        </div>
      </section>

      {/* ── 통계 섹션 (빨간 배경) ── */}
      <section className="py-24 px-5 bg-gradient-to-br from-red-700 via-red-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-black/20" />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              숫자로 보는 KoriBridge
            </h2>
            <p className="mt-3 text-red-200/70 text-sm">전 세계가 선택한 한국어 교류 플랫폼</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-white mb-2">{s.value}</p>
                <p className="text-sm text-red-200/70 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 후기 섹션 ── */}
      <section className="py-28 px-5 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-4">
              사용자 후기
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              직접 들어보세요
            </h2>
            <p className="mt-4 text-zinc-500 text-sm max-w-sm mx-auto">
              전 세계 48,000명 학습자들의 진짜 이야기입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} item={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA 섹션 (빨간 그라디언트) ── */}
      <section className="py-32 px-5 bg-gradient-to-br from-red-900/50 via-zinc-950 to-zinc-950 relative overflow-hidden border-t border-zinc-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-red-600/15 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-5">
            지금 시작하세요
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-5">
            오늘 첫 대화를
            <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              시작해보세요
            </span>
          </h2>
          <p className="text-zinc-500 text-base mb-10 max-w-md mx-auto leading-relaxed">
            가입 즉시 스마트 매칭이 시작됩니다.
            <br />
            완전 무료, 광고 없음, 신용카드 불필요.
          </p>
          <button
            onClick={goToAuth}
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-red-600 to-rose-500 font-bold rounded-2xl shadow-2xl shadow-red-900/50 hover:from-red-500 hover:to-rose-400 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] text-base"
          >
            무료 가입하기 →
          </button>
          <p className="mt-6 text-xs text-zinc-600">
            이미 <span className="text-zinc-400 font-semibold">48,000+</span>명이 KoriBridge와 함께합니다
          </p>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-10 px-5">
        <div className="max-w-6xl mx-auto">
          {/* 상단 4컬럼 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* 로고 + 소셜 */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-xs font-black">
                  K
                </div>
                <span className="font-bold text-sm">KoriBridge</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed mb-5">
                전 세계 한국어 학습자를 연결하는
                <br />
                AI 기반 언어 교류 플랫폼
              </p>
              <div className="flex items-center gap-3">
                {[IconX, IconInstagram, IconYoutube, IconTiktok].map((Icon, i) => (
                  <button
                    key={i}
                    className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all duration-200"
                  >
                    <Icon />
                  </button>
                ))}
              </div>
            </div>

            {/* 링크 3컬럼 */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-4">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        onClick={
                          link === "이용약관"
                            ? goToTerms
                            : link === "개인정보"
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

          {/* 하단 카피라이트 */}
          <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-700">© 2026 KoriBridge. All rights reserved.</p>
            <p className="text-xs text-zinc-800">Made with ❤️ for Korean culture lovers worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
