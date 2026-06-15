import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-600 via-rose-500 to-pink-400 px-6 relative overflow-hidden">
      <Helmet><title>KoriBridge - 페이지 없음</title></Helmet>

      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/10 translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[14rem] font-black text-white/10 leading-none">404</span>
      </div>

      <div className="relative z-10 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-sm">
          <span className="text-white text-2xl font-black">K</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight">페이지 없음</h1>
        <p className="mt-3 text-white/70 text-sm leading-relaxed">
          요청하신 페이지가 존재하지 않거나<br />이동됐습니다.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="bg-white text-red-600 font-extrabold px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-[0.98] text-sm"
          >
            홈으로 돌아가기
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-white/60 text-sm hover:text-white underline transition"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
