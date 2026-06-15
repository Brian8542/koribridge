import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const FEATURES = [
  {
    icon: "💬",
    title: "실시간 1:1 채팅",
    desc: "텍스트와 이미지를 주고받으며 자연스럽게 언어를 익혀보세요.",
  },
  {
    icon: "🤝",
    title: "스마트 파트너 매칭",
    desc: "국적·언어 수준·관심사 기반으로 딱 맞는 파트너를 연결합니다.",
  },
  {
    icon: "🌏",
    title: "문화 교류",
    desc: "K-pop, 한국 음식, 드라마 등 다양한 주제로 깊은 대화를 나눠보세요.",
  },
];

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <Helmet><title>KoriBridge - 한국어·문화 교류 파트너 플랫폼</title></Helmet>

      {/* ── 고정 네비게이션 ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          {/* 로고 */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center font-black text-sm shadow-lg shadow-red-900/40">
              K
            </div>
            <span className="font-extrabold text-base tracking-tight">KoriBridge</span>
          </div>

          {/* 중앙 메뉴 */}
          <div className="hidden md:flex items-center gap-8 text-sm text-white/40">
            <button className="hover:text-white transition-colors">파트너 찾기</button>
            <button className="hover:text-white transition-colors">커뮤니티</button>
            <button className="hover:text-white transition-colors">학습도구</button>
          </div>

          {/* 우측 버튼 */}
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
        {/* 장식용 그라디언트 오브 */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-32 left-1/3 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        {/* 닷 그리드 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* 활성 사용자 배지 */}
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/60 mb-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            지금{" "}
            <span className="text-white font-semibold">1,247명</span>이 대화 중
          </div>

          {/* 대형 타이포그래피 */}
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

          {/* CTA 버튼 2개 */}
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

          {/* 실시간 채팅 미리보기 카드 2개 */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {/* 카드 1 */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 space-y-2.5 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-2 pb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
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

            {/* 카드 2 */}
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 space-y-2.5 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-2 pb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
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

      {/* ── 기능 소개 섹션 ── */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-zinc-900 border border-white/10 rounded-2xl p-6 hover:border-red-500/30 hover:bg-zinc-900/80 transition-all group"
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

      {/* ── 하단 CTA 배너 ── */}
      <section className="py-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block text-xs font-bold tracking-[0.2em] text-red-400 uppercase mb-4">
            지금 시작
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            첫 파트너를 만나보세요
          </h2>
          <p className="text-white/40 text-sm mb-8 leading-relaxed">
            가입 즉시 매칭을 시작할 수 있습니다. 무료, 광고 없음.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-500 font-bold rounded-2xl shadow-2xl shadow-red-900/40 hover:from-red-500 hover:to-rose-400 hover:-translate-y-0.5 transition-all active:scale-[0.98] text-base"
          >
            무료로 시작하기 →
          </button>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-white/5 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-[10px] font-black">
              K
            </div>
            <span className="font-bold text-sm">KoriBridge</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/25">
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
          </div>

          <p className="text-xs text-white/20">© 2026 KoriBridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
