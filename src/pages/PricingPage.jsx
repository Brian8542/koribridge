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

const CheckIcon = React.memo(function CheckIcon({ className }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${className}`} viewBox="0 0 16 16" fill="none">
      <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export default function PricingPage() {
  const navigate = useNavigate();
  const goToAuth = useCallback(() => navigate("/auth"), [navigate]);

  return (
    <div className="bg-surface-bg text-neutral-900 min-h-screen">
      <Helmet>
        <title>KoriBridge - 요금제 | 여성 완전 무료</title>
        <meta name="description" content="KoriBridge 요금제 안내. 여성 회원은 모든 기능을 영구 무료로 이용하세요. Pro 플랜 월 4,900원 (론칭 특가)." />
        <meta property="og:title" content="KoriBridge - 요금제 | 여성 완전 무료" />
        <meta property="og:description" content="여성 회원은 모든 기능을 영구 무료. Pro 플랜 월 4,900원 론칭 특가." />
        <meta property="og:url" content="https://koribridge.vercel.app/pricing" />
      </Helmet>

      {/* 론칭 배너 */}
      <div className="bg-primary-500 text-center py-2.5 px-5 text-sm font-semibold text-white">
        지금 가입하면 론칭 특가 · Pro 월 <strong>4,900원</strong> (정가 ₩9,900)
      </div>

      {/* 네비게이션 */}
      <nav className="sticky top-0 z-40 border-b border-neutral-150 bg-white/95 backdrop-blur-xl shadow-nav">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center font-black text-sm text-white">K</div>
            <span className="font-extrabold text-[15px] tracking-tight text-neutral-900 group-hover:text-neutral-600 transition-colors">KoriBridge</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="hidden sm:block px-3 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              ← 홈으로
            </button>
            <button onClick={goToAuth} className="btn-primary px-4 py-2.5 text-sm font-bold w-auto">
              무료로 시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="text-center pt-20 pb-14 px-5">
        <p className="section-label mb-5">Pricing</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-5 text-neutral-900">
          투명한 요금제,<br />
          <span className="text-primary-500">여성은 완전 무료</span>
        </h1>
        <p className="text-neutral-500 text-base max-w-sm mx-auto leading-relaxed">
          숨겨진 비용 없이 투명하게.<br />여성 회원은 모든 기능을 영구 무료로 이용하세요.
        </p>
      </section>

      {/* 요금제 */}
      <section className="px-5 pb-28 max-w-6xl mx-auto">

        {/* 여성 무료 — featured */}
        <div className="relative mb-6 rounded-2xl border-2 border-primary-200 bg-white p-8 md:p-10 shadow-card-md hover:border-primary-300 transition-colors duration-300">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span className="badge bg-primary-500 text-white border-primary-500">여성 회원 혜택</span>
                <span className="badge bg-primary-50 text-primary-600 border border-primary-100">영구 무료</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-2">여성 무료</h2>
              <p className="text-neutral-500 text-sm mb-6">여성 회원이라면 모든 프리미엄 기능을 영구 무료로</p>
              <div className="flex items-end gap-2 mb-8">
                <span className="text-6xl font-black text-primary-500">₩0</span>
                <span className="text-neutral-400 text-sm mb-2">/영구 무료</span>
              </div>
              <button onClick={goToAuth} className="btn-primary px-8 py-3.5 text-sm font-bold inline-flex items-center gap-2 w-auto">
                지금 가입하기
                <span>→</span>
              </button>
              <p className="mt-4 text-xs text-neutral-400">신용카드 불필요 · 가입 즉시 이용 가능</p>
            </div>
            <div className="lg:w-72 flex-shrink-0">
              <p className="section-label mb-4">포함 기능</p>
              <ul className="space-y-2.5">
                {FEMALE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
                    <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-neutral-800 font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 3-tier grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* 기본 무료 */}
          <div className="rounded-2xl border border-neutral-150 bg-white p-6 hover:border-neutral-300 hover:-translate-y-1 shadow-card transition-all duration-300">
            <h3 className="text-lg font-black text-neutral-900 mb-1">기본 무료</h3>
            <p className="text-xs text-neutral-400 mb-5">가볍게 시작해보세요</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-black text-neutral-900">₩0</span>
              <span className="text-neutral-400 text-sm mb-1">/월</span>
            </div>
            <button onClick={goToAuth} className="btn-secondary w-full py-3 mb-6">
              무료로 시작
            </button>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-500">
                  <CheckIcon className="text-neutral-300" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-primary-400 bg-white p-6 shadow-card-md hover:border-primary-500 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="badge bg-primary-500 text-white border-primary-500 px-3.5 py-1 whitespace-nowrap">인기</span>
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-1 mt-2">Pro</h3>
            <p className="text-xs text-neutral-400 mb-5">가장 인기 있는 플랜</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-black text-neutral-900">₩4,900</span>
              <span className="text-neutral-400 text-sm mb-1">/월</span>
            </div>
            <p className="text-xs text-neutral-300 line-through mb-5">정가 ₩9,900</p>
            <button onClick={goToAuth} className="btn-primary w-full py-3 mb-6">
              Pro 시작하기
            </button>
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-700">
                  <CheckIcon className="text-primary-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="rounded-2xl border border-neutral-150 bg-white p-6 hover:border-amber-200 hover:-translate-y-1 shadow-card transition-all duration-300">
            <h3 className="text-lg font-black text-neutral-900 mb-1">Premium</h3>
            <p className="text-xs text-neutral-400 mb-5">최고의 학습 경험</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-black text-neutral-900">₩9,900</span>
              <span className="text-neutral-400 text-sm mb-1">/월</span>
            </div>
            <button
              onClick={goToAuth}
              className="w-full py-3 rounded-xl border border-amber-200 text-amber-700 font-bold text-sm hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 mb-6"
            >
              Premium 시작
            </button>
            <ul className="space-y-2.5">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-neutral-500">
                  <CheckIcon className="text-amber-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="px-5 py-20 border-t border-neutral-150 bg-neutral-900 text-center">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white">
          지금 바로 시작하세요
        </h2>
        <p className="text-neutral-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          신용카드 불필요 · 언제든 플랜 변경 가능
        </p>
        <button
          onClick={goToAuth}
          className="inline-flex items-center gap-2 px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl transition-all duration-200 active:scale-[0.98]"
        >
          무료로 시작하기
          <span>→</span>
        </button>
      </section>
    </div>
  );
}
