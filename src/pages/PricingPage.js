import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const FEMALE_FEATURES = [
  "무제한 파트너 매칭",
  "무제한 채팅",
  "AI 매칭",
  "번역 무제한",
];

const FREE_FEATURES = [
  "파트너 3명",
  "채팅 하루 20회",
  "번역 5회/일",
];

const PRO_FEATURES = [
  "무제한 파트너",
  "무제한 채팅",
  "AI 매칭",
  "번역 무제한",
];

const PREMIUM_FEATURES = [
  "Pro 전체 포함",
  "AI 발음 코치",
  "우선 매칭",
  "프로필 상단 노출",
];

const CheckIcon = React.memo(function CheckIcon({ color }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${color}`} viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export default function PricingPage() {
  const navigate = useNavigate();
  const goToAuth = useCallback(() => navigate("/auth"), [navigate]);

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <Helmet>
        <title>KoriBridge - 요금제 | 여성 완전 무료</title>
        <meta name="description" content="KoriBridge 요금제 안내. 여성 회원은 모든 기능을 영구 무료로 이용하세요. Pro 플랜 월 4,900원 (론칭 특가)." />
        <meta property="og:title" content="KoriBridge - 요금제 | 여성 완전 무료" />
        <meta property="og:description" content="여성 회원은 모든 기능을 영구 무료. Pro 플랜 월 4,900원 론칭 특가." />
        <meta property="og:url" content="https://koribridge.vercel.app/pricing" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://koribridge.vercel.app/logo512.png" />
        <meta name="twitter:title" content="KoriBridge - 요금제 | 여성 완전 무료" />
        <meta name="twitter:description" content="여성 회원은 모든 기능을 영구 무료. Pro 플랜 월 4,900원 론칭 특가." />
        <meta name="twitter:url" content="https://koribridge.vercel.app/pricing" />
      </Helmet>

      {/* Launch special banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-center py-2.5 px-5 text-sm font-semibold">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <span className="relative">🎉 지금 가입하면 론칭 특가 · Pro 월 <strong>4,900원</strong> (정가 ₩9,900)</span>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-sm shadow-lg shadow-red-900/50">K</div>
            <span className="font-extrabold text-[15px] tracking-tight group-hover:text-zinc-300 transition-colors">KoriBridge</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="hidden sm:block px-3 py-2 text-sm font-medium text-zinc-500 hover:text-white transition-colors"
            >
              ← 홈으로
            </button>
            <button
              onClick={goToAuth}
              className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-red-600 to-rose-500 rounded-xl shadow-lg shadow-red-900/30 hover:from-red-500 hover:to-rose-400 hover:-translate-y-px transition-all duration-200 active:scale-95"
            >
              무료로 시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative text-center pt-20 pb-14 px-5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-red-600/8 blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase mb-5">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.02em] leading-tight mb-5">
            투명한 요금제,<br />
            <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">
              여성은 완전 무료
            </span>
          </h1>
          <p className="text-zinc-500 text-base max-w-sm mx-auto leading-relaxed">
            숨겨진 비용 없이 투명하게.<br />여성 회원은 모든 기능을 영구 무료로 이용하세요.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-5 pb-28 max-w-6xl mx-auto">

        {/* Female Free — featured */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-500/20 via-rose-500/10 to-pink-500/20 blur-2xl pointer-events-none" />
          <div className="relative rounded-3xl border-2 border-pink-500/50 bg-zinc-900/80 p-8 md:p-10 shadow-2xl shadow-pink-500/10 hover:border-pink-400/70 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black shadow-lg shadow-pink-500/30">
                    ♀ 여성 회원 혜택
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-pink-500/30 text-pink-300 text-xs font-semibold">
                    영구 무료
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">여성 무료</h2>
                <p className="text-zinc-400 text-sm mb-6">여성 회원이라면 모든 프리미엄 기능을 영구 무료로</p>
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-6xl font-black bg-gradient-to-br from-pink-300 to-rose-400 bg-clip-text text-transparent">₩0</span>
                  <span className="text-zinc-500 text-sm mb-2">/영구 무료</span>
                </div>
                <button
                  onClick={goToAuth}
                  className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-pink-500/30 hover:from-pink-400 hover:to-rose-400 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
                >
                  지금 가입하기
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
                <p className="mt-4 text-xs text-zinc-600">신용카드 불필요 · 가입 즉시 이용 가능</p>
              </div>
              <div className="lg:w-72 flex-shrink-0">
                <p className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-4">포함 기능</p>
                <ul className="space-y-2.5">
                  {FEMALE_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-3 bg-pink-500/5 border border-pink-500/15 rounded-xl px-4 py-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-500/30">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm text-zinc-200 font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 3-plan grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Free */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-lg font-black text-white mb-1">기본 무료</h3>
            <p className="text-xs text-zinc-500 mb-5">가볍게 시작해보세요</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-black text-white">₩0</span>
              <span className="text-zinc-600 text-sm mb-1">/월</span>
            </div>
            <button
              onClick={goToAuth}
              className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold text-sm hover:border-zinc-600 hover:bg-white/5 hover:text-white transition-all duration-200 mb-6 active:scale-[0.98]"
            >
              무료로 시작
            </button>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <CheckIcon color="text-zinc-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-red-500/60 bg-zinc-900/60 p-6 shadow-2xl shadow-red-500/10 hover:border-red-400/80 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-black shadow-lg shadow-red-500/40 whitespace-nowrap">
                🔥 인기
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-1 mt-2">Pro</h3>
            <p className="text-xs text-zinc-500 mb-5">가장 인기 있는 플랜</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-black text-white">₩4,900</span>
              <span className="text-zinc-600 text-sm mb-1">/월</span>
            </div>
            <p className="text-xs text-zinc-600 line-through mb-5">정가 ₩9,900</p>
            <button
              onClick={goToAuth}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold text-sm hover:from-red-500 hover:to-rose-400 shadow-lg shadow-red-500/30 transition-all duration-200 mb-6 active:scale-[0.98]"
            >
              Pro 시작하기
            </button>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <CheckIcon color="text-red-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-lg font-black text-white mb-1">Premium</h3>
            <p className="text-xs text-zinc-500 mb-5">최고의 학습 경험</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-black text-white">₩9,900</span>
              <span className="text-zinc-600 text-sm mb-1">/월</span>
            </div>
            <button
              onClick={goToAuth}
              className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold text-sm hover:border-amber-500/40 hover:text-amber-300 hover:bg-amber-500/5 transition-all duration-200 mb-6 active:scale-[0.98]"
            >
              Premium 시작
            </button>
            <ul className="space-y-2.5">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                  <CheckIcon color="text-amber-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-5 py-20 border-t border-zinc-900 bg-gradient-to-br from-red-900/20 via-zinc-950 to-zinc-950 text-center">
        <h2 className="text-3xl md:text-4xl font-black tracking-[-0.02em] mb-4">
          지금 바로 시작하세요
        </h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          신용카드 불필요 · 언제든 플랜 변경 가능
        </p>
        <button
          onClick={goToAuth}
          className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-red-600 to-rose-500 font-bold rounded-2xl shadow-2xl shadow-red-900/50 hover:from-red-500 hover:to-rose-400 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
        >
          무료로 시작하기
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </button>
      </section>
    </div>
  );
}
