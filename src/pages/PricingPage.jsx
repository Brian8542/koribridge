import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Check = () => (
  <svg className="w-4 h-4 text-[#4A1D3F] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const Dash = () => (
  <svg className="w-4 h-4 text-[#E5DED2] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

const PLANS = [
  {
    id: "free",
    name: "기본",
    price: "₩0",
    period: "/월",
    badge: null,
    desc: "가볍게 시작해보세요",
    cta: "무료로 시작",
    ctaClass: "bg-[#F3EEE6] text-[#1E1B18] hover:bg-[#F3EEE6]",
    features: {
      "파트너 매칭": "3명",
      "채팅": "하루 20회",
      "번역": "5회/일",
      "AI 매칭": false,
      "음성 메모": false,
      "우선 매칭": false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: "₩4,900",
    period: "/월",
    badge: "인기",
    desc: "가장 인기 있는 플랜",
    cta: "Pro 시작하기",
    ctaClass: "bg-[#4A1D3F] text-white hover:bg-[#3B1732]",
    features: {
      "파트너 매칭": "무제한",
      "채팅": "무제한",
      "번역": "무제한",
      "AI 매칭": true,
      "음성 메모": true,
      "우선 매칭": false,
    },
    originalPrice: "₩9,900",
  },
  {
    id: "premium",
    name: "Premium",
    price: "₩9,900",
    period: "/월",
    badge: null,
    desc: "최고의 학습 경험",
    cta: "Premium 시작",
    ctaClass: "bg-[#1E1B18] text-white hover:bg-[#3E3934]",
    features: {
      "파트너 매칭": "무제한",
      "채팅": "무제한",
      "번역": "무제한",
      "AI 매칭": true,
      "음성 메모": true,
      "우선 매칭": true,
    },
  },
];

const FEATURE_KEYS = ["파트너 매칭", "채팅", "번역", "AI 매칭", "음성 메모", "우선 매칭"];

export default function PricingPage() {
  const navigate = useNavigate();
  const goToAuth = useCallback(() => navigate("/auth"), [navigate]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1B18]">
      <Helmet>
        <title>KoriBridge - 요금제 | 여성 완전 무료</title>
        <meta name="description" content="KoriBridge 요금제 안내. 여성 회원은 모든 기능을 영구 무료로 이용하세요." />
      </Helmet>

      {/* Launch banner */}
      <div className="bg-[#1E1B18] text-center py-2.5 px-5 text-[13px] font-medium text-white">
        지금 가입하면 론칭 특가 · Pro 월{" "}
        <strong className="text-[#4A1D3F]">₩4,900</strong>{" "}
        <span className="text-[#6E675F] line-through">₩9,900</span>
      </div>

      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-[#E5DED2]/40 px-5 h-14 flex items-center sticky top-0 z-40">
        <div className="max-w-[980px] mx-auto w-full flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white text-[11px] font-black">K</span>
            </div>
            <span className="font-semibold text-[14px] text-[#1E1B18] group-hover:text-[#4A1D3F] transition-colors">KoriBridge</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="hidden sm:block text-[13px] text-[#8A837B] hover:text-[#1E1B18] transition-colors">
              ← 홈으로
            </button>
            <button onClick={goToAuth} className="px-4 py-1.5 bg-[#4A1D3F] text-white text-[13px] font-medium rounded-full hover:bg-[#3B1732] transition-all duration-200">
              무료로 시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-5 text-center">
        <p className="section-label mb-5">Pricing</p>
        <h1 className="font-display leading-[1.14] text-[#1E1B18]"
          style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
          투명한 요금제.<br />
          <span className="text-[#4A1D3F]">여성은 완전 무료.</span>
        </h1>
        <p className="mt-5 text-[17px] text-[#8A837B] max-w-sm mx-auto leading-relaxed">
          숨겨진 비용 없이 투명하게.<br />여성 회원은 모든 기능을 영구 무료로 이용하세요.
        </p>
      </section>

      {/* Female free highlight */}
      <section className="px-5 pb-8 max-w-[980px] mx-auto">
        <div className="bg-white rounded-apple-lg p-8 md:p-10 border border-[#E5DED2]/30 shadow-card-md">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-[#4A1D3F] text-white">여성 회원 혜택</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-[#F3EEE6] text-[#1E1B18]">영구 무료</span>
              </div>
              <h2 className="font-display text-[32px] text-[#1E1B18] mb-2">여성 회원 · 모든 기능 무료</h2>
              <p className="text-[15px] text-[#8A837B] mb-6">여성 회원이라면 Pro 기능을 포함한 모든 프리미엄 기능을 영구 무료로</p>
              <button onClick={goToAuth} className="inline-flex items-center gap-2 px-7 py-3 bg-[#4A1D3F] text-white text-[15px] font-medium rounded-full hover:bg-[#3B1732] transition-all duration-200">
                지금 가입하기 ›
              </button>
              <p className="mt-3 text-[13px] text-[#8A837B]">신용카드 불필요 · 가입 즉시 이용 가능</p>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:w-72 flex-shrink-0">
              {["무제한 파트너 매칭", "무제한 채팅", "AI 매칭", "번역 무제한", "음성 메모", "우선 매칭"].map(f => (
                <div key={f} className="flex items-center gap-2 bg-[#F3EEE6] rounded-apple px-3 py-2.5">
                  <Check />
                  <span className="text-[13px] text-[#1E1B18] font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plan comparison */}
      <section className="px-5 pb-24 max-w-[980px] mx-auto">
        {/* Mobile: card stack */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:hidden">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-white rounded-apple-lg p-6 relative ${plan.id === "pro" ? "ring-2 ring-[#4A1D3F]" : "border border-[#E5DED2]/40"} shadow-card`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-[11px] font-semibold px-3 py-1 bg-[#4A1D3F] text-white rounded-full">{plan.badge}</span>
                </div>
              )}
              <h3 className="text-[19px] font-bold text-[#1E1B18] mt-2">{plan.name}</h3>
              <p className="text-[13px] text-[#8A837B] mt-1 mb-4">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[32px] font-bold text-[#1E1B18] tracking-tight">{plan.price}</span>
                <span className="text-[14px] text-[#8A837B]">{plan.period}</span>
              </div>
              {plan.originalPrice && (
                <p className="text-[12px] text-[#B3AB9F] line-through -mt-3 mb-4">정가 {plan.originalPrice}</p>
              )}
              <button onClick={goToAuth} className={`w-full py-2.5 rounded-full text-[14px] font-medium transition-all duration-200 mb-5 ${plan.ctaClass}`}>
                {plan.cta}
              </button>
              <ul className="space-y-2.5">
                {FEATURE_KEYS.map(key => {
                  const val = plan.features[key];
                  return (
                    <li key={key} className="flex items-center gap-2 text-[13px]">
                      {val === false ? <Dash /> : <Check />}
                      <span className={val === false ? "text-[#B3AB9F]" : "text-[#1E1B18]"}>
                        {typeof val === "string" ? val : key}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Desktop: Apple-style comparison table */}
        <div className="hidden md:block bg-white rounded-apple-lg shadow-card overflow-hidden border border-[#E5DED2]/30">
          {/* Header row */}
          <div className="grid grid-cols-4 border-b border-[#F3EEE6]">
            <div className="p-6" />
            {PLANS.map(plan => (
              <div key={plan.id} className={`p-6 text-center relative ${plan.id === "pro" ? "bg-[#F3EEE6]" : ""}`}>
                {plan.badge && (
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 bg-[#4A1D3F] text-white rounded-full">{plan.badge}</span>
                )}
                <h3 className="text-[18px] font-bold text-[#1E1B18] mt-5">{plan.name}</h3>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-[28px] font-bold text-[#1E1B18] tracking-tight">{plan.price}</span>
                  <span className="text-[13px] text-[#8A837B]">{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <p className="text-[12px] text-[#B3AB9F] line-through">정가 {plan.originalPrice}</p>
                )}
                <button onClick={goToAuth} className={`mt-4 w-full py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${plan.ctaClass}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {FEATURE_KEYS.map((key, i) => (
            <div key={key} className={`grid grid-cols-4 border-b border-[#F3EEE6] last:border-0 ${i % 2 === 0 ? "" : "bg-[#fafafa]"}`}>
              <div className="px-6 py-4 text-[14px] text-[#1E1B18] font-medium flex items-center">{key}</div>
              {PLANS.map(plan => {
                const val = plan.features[key];
                return (
                  <div key={plan.id} className={`px-6 py-4 text-center flex items-center justify-center ${plan.id === "pro" ? "bg-[#F3EEE6]" : ""}`}>
                    {val === false ? (
                      <Dash />
                    ) : typeof val === "string" ? (
                      <span className="text-[13px] font-semibold text-[#1E1B18]">{val}</span>
                    ) : (
                      <Check />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 bg-[#1E1B18] text-center">
        <h2 className="font-display leading-[1.14] text-[#FAF7F2]"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          지금 바로 시작하세요.
        </h2>
        <p className="mt-4 text-[15px] text-[#8A837B] max-w-xs mx-auto">
          신용카드 불필요 · 언제든 플랜 변경 가능
        </p>
        <button
          onClick={goToAuth}
          className="mt-8 px-8 py-3.5 bg-[#4A1D3F] text-white text-[17px] font-medium rounded-full hover:bg-[#3B1732] transition-all duration-200 active:scale-[0.97]"
        >
          무료로 시작하기
        </button>
      </section>
    </div>
  );
}
