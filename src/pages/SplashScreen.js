import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const FEATURES = [
  {
    icon: "🎯",
    title: "스마트 매칭",
    desc: "국적·언어 수준·관심사를 분석해 최적의 파트너를 자동으로 연결합니다.",
  },
  {
    icon: "🎤",
    title: "AI 발음 교정",
    desc: "실시간 AI가 발음을 분석하고 교정 피드백을 즉시 제공합니다.",
  },
  {
    icon: "📹",
    title: "영상 통화",
    desc: "얼굴을 보며 더 자연스럽게 대화하고 표현력을 키워보세요.",
  },
  {
    icon: "📚",
    title: "AI 학습 플랜",
    desc: "AI가 학습 패턴을 분석해 맞춤형 학습 로드맵을 설계합니다.",
  },
  {
    icon: "🌸",
    title: "문화 콘텐츠",
    desc: "K-pop, 드라마, 음식, 여행 등 한국 문화를 함께 탐구합니다.",
  },
  {
    icon: "🏆",
    title: "게임화 학습",
    desc: "연속 학습 스트릭, 뱃지, 리더보드로 동기부여를 유지합니다.",
  },
];

const PARTNERS = [
  {
    initial: "L",
    gradient: "from-violet-500 to-purple-400",
    name: "Linh Nguyen",
    country: "🇻🇳 베트남",
    level: "한국어 초급",
    interests: ["K-pop", "드라마"],
    online: true,
  },
  {
    initial: "J",
    gradient: "from-blue-500 to-cyan-400",
    name: "James Park",
    country: "🇺🇸 미국",
    level: "한국어 중급",
    interests: ["음식", "여행"],
    online: true,
  },
  {
    initial: "Y",
    gradient: "from-amber-500 to-orange-400",
    name: "Yuki Tanaka",
    country: "🇯🇵 일본",
    level: "한국어 고급",
    interests: ["문학", "영화"],
    online: false,
  },
  {
    initial: "M",
    gradient: "from-emerald-500 to-teal-400",
    name: "Maria Silva",
    country: "🇧🇷 브라질",
    level: "한국어 초급",
    interests: ["K-drama", "뷰티"],
    online: true,
  },
];

const TESTIMONIALS = [
  {
    initial: "S",
    gradient: "from-pink-500 to-rose-400",
    name: "Sofia K.",
    country: "스페인",
    rating: 5,
    text: "3개월 만에 한국어로 자유롭게 대화할 수 있게 됐어요. KoriBridge 없었으면 불가능했을 거예요!",
  },
  {
    initial: "T",
    gradient: "from-sky-500 to-blue-400",
    name: "Takeshi M.",
    country: "일본",
    rating: 5,
    text: "매칭 알고리즘이 정말 놀라워요. 첫 파트너와 지금까지 6개월째 대화 중입니다.",
  },
  {
    initial: "A",
    gradient: "from-green-500 to-emerald-400",
    name: "Aisha R.",
    country: "인도",
    rating: 5,
    text: "AI 발음 교정 덕분에 한국 친구들이 제 발음이 좋아졌다고 해요. 정말 효과적입니다.",
  },
];

const STATS_TOP = [
  { value: "48K+", label: "활성 학습자" },
  { value: "120,000+", label: "매일 이루어지는 대화" },
];

const STATS_MAIN = [
  { value: "48K+", label: "활성 학습자" },
  { value: "127개", label: "참여 국가" },
  { value: "4.9★", label: "앱스토어 평점" },
  { value: "92%", label: "목표 달성률" },
];

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <Helmet>
        <title>KoriBridge - 한국어·문화 교류 파트너 플랫폼</title>
      </Helmet>

      {/* ── 고정 네비게이션 ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-sm shadow-lg shadow-red-900/40">
              K
            </div>
            <span className="font-extrabold text-base tracking-tight">KoriBridge</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
            <button className="hover:text-white transition-colors">파트너 찾기</button>
            <button className="hover:text-white transition-colors">커뮤니티</button>
            <button className="hover:text-white transition-colors">학습도구</button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 text-sm font-semibold text-white/50 hover:text-white transition-colors"
            >
              로그인
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-red-600 to-rose-500 rounded-xl shadow-lg shadow-red-900/30 hover:from-red-500 hover:to-rose-400 hover:-translate-y-px transition-all active:scale-95"
            >
              무료 시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* ── 히어로 섹션 ── */}
      <section className="relative pt-40 pb-28 px-5 overflow-hidden">
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-red-600/12 blur-3xl pointer-events-none" />
        <div className="absolute top-32 left-1/3 w-80 h-80 rounded-full bg-rose-500/8 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/60 mb-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            지금 <span className="text-white font-semibold">1,247명</span>이 대화 중
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.06]">
            말이 통하면
            <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              한국어가
            </span>{" "}
            이어집니다
          </h1>

          <p className="mt-6 text-base sm:text-lg text-white/45 max-w-xl mx-auto leading-relaxed">
            전 세계 파트너와 실시간으로 한국어를 연습하고,
            <br className="hidden sm:block" />
            문화를 교류하며 진짜 언어 실력을 키워보세요.
          </p>

          {/* 통계 배지 */}
          <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
            {STATS_TOP.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="px-7 py-3.5 bg-gradient-to-r from-red-600 to-rose-500 font-bold rounded-2xl shadow-xl shadow-red-900/40 hover:from-red-500 hover:to-rose-400 hover:-translate-y-0.5 transition-all active:scale-[0.98] text-base w-full sm:w-auto"
            >
              지금 무료로 시작하기 →
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-7 py-3.5 border border-white/10 font-semibold rounded-2xl hover:bg-white/5 hover:border-white/20 transition text-base w-full sm:w-auto text-white/60 hover:text-white"
            >
              로그인
            </button>
          </div>

          {/* 실시간 채팅 미리보기 */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 space-y-2.5 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-2 pb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  L
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-none">Linh</p>
                  <p className="text-[10px] text-white/40 mt-0.5">베트남 · 한국어 초급</p>
                </div>
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-white/75">
                안녕하세요! 한국어 공부하고 싶어요 😊
              </div>
              <div className="bg-gradient-to-r from-red-600/25 to-rose-500/25 border border-red-500/15 rounded-xl rounded-tr-sm px-3 py-2 text-sm text-white/75 ml-8">
                반가워요! 베트남어도 배우고 싶어요
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-white/75">
                정말요? 같이 교환해요! ✨
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 space-y-2.5 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-2 pb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  J
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-none">James</p>
                  <p className="text-[10px] text-white/40 mt-0.5">미국 · 한국어 중급</p>
                </div>
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-white/75">
                K-pop 좋아하세요? 저는 너무 좋아요!
              </div>
              <div className="bg-gradient-to-r from-red-600/25 to-rose-500/25 border border-red-500/15 rounded-xl rounded-tr-sm px-3 py-2 text-sm text-white/75 ml-8">
                저도요! 가사 공부 같이 어때요? 🎵
              </div>
              <div className="bg-zinc-800 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-white/75">
                완전 좋아요! 오늘부터 시작해요
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 기능 소개 6개 ── */}
      <section className="py-24 px-5 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase mb-3">
              핵심 기능
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              왜 KoriBridge인가요?
            </h2>
            <p className="mt-3 text-white/40 text-sm max-w-sm mx-auto">
              언어 교류의 모든 것을 하나의 플랫폼에서 경험하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-zinc-900 border border-white/8 rounded-2xl p-6 hover:border-red-500/30 hover:bg-zinc-900/80 transition-all group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white text-base mb-2 group-hover:text-red-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 파트너 카드 4개 ── */}
      <section className="py-24 px-5 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase mb-3">
              파트너 찾기
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              지금 대화 가능한 파트너
            </h2>
            <p className="mt-3 text-white/40 text-sm max-w-sm mx-auto">
              전 세계 127개국에서 당신을 기다리고 있어요.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="bg-zinc-900 border border-white/8 rounded-2xl p-5 hover:border-white/20 hover:-translate-y-1 transition-all group cursor-pointer"
                onClick={() => navigate("/auth")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-lg font-black`}
                  >
                    {p.initial}
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                      p.online ? "bg-emerald-400" : "bg-zinc-600"
                    }`}
                  />
                </div>
                <p className="font-bold text-white text-sm">{p.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{p.country}</p>
                <p className="text-xs text-white/30 mt-0.5">{p.level}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.interests.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  className="mt-4 w-full py-2 text-xs font-bold border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/auth");
                  }}
                >
                  대화 시작하기
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 통계 섹션 ── */}
      <section className="py-24 px-5 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase mb-3">
              숫자로 보는 KoriBridge
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              전 세계가 선택한 플랫폼
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS_MAIN.map((s) => (
              <div
                key={s.label}
                className="bg-zinc-900 border border-white/8 rounded-2xl p-6 text-center hover:border-red-500/20 transition-colors"
              >
                <p className="text-4xl font-black text-white mb-2">{s.value}</p>
                <p className="text-sm text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 사용자 후기 3개 ── */}
      <section className="py-24 px-5 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase mb-3">
              사용자 후기
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              실제 사용자들의 이야기
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-zinc-900 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors"
              >
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-white/65 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-black flex-shrink-0`}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-none">{t.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">{t.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA 섹션 ── */}
      <section className="py-28 px-5 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-red-600/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase mb-4">
            지금 시작
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            오늘 첫 대화를
            <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              시작해보세요
            </span>
          </h2>
          <p className="text-white/40 text-sm mb-10 leading-relaxed">
            가입 즉시 매칭을 시작할 수 있습니다. 무료, 광고 없음.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-500 font-bold rounded-2xl shadow-2xl shadow-red-900/40 hover:from-red-500 hover:to-rose-400 hover:-translate-y-0.5 transition-all active:scale-[0.98] text-base w-full sm:w-auto"
            >
              무료로 시작하기 →
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-8 py-4 border border-white/10 font-semibold rounded-2xl hover:bg-white/5 hover:border-white/20 transition text-base w-full sm:w-auto text-white/60 hover:text-white"
            >
              파트너 둘러보기
            </button>
          </div>
          <p className="mt-6 text-xs text-white/20">
            이미 <span className="text-white/40">48,000+</span>명이 KoriBridge와 함께합니다
          </p>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-white/5 py-12 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-xs font-black">
                K
              </div>
              <span className="font-bold text-sm">KoriBridge</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-white/25">
              <button
                onClick={() => navigate("/terms")}
                className="hover:text-white/60 transition-colors"
              >
                이용약관
              </button>
              <button
                onClick={() => navigate("/privacy")}
                className="hover:text-white/60 transition-colors"
              >
                개인정보처리방침
              </button>
              <button className="hover:text-white/60 transition-colors">파트너 찾기</button>
              <button className="hover:text-white/60 transition-colors">커뮤니티</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
            <p className="text-xs text-white/20">© 2026 KoriBridge. All rights reserved.</p>
            <p className="text-xs text-white/15">
              Made with ❤️ for Korean culture lovers worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
