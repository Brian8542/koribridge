import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocale } from "../hooks/useLocale";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] px-5">
      <Helmet><title>KoriBridge - {t.notFoundTitle}</title></Helmet>

      <div className="text-center max-w-sm">
        <p className="font-bold text-[#d2d2d7] select-none leading-none mb-4" style={{ fontSize: "clamp(6rem, 20vw, 9rem)", letterSpacing: "-0.05em" }}>
          404
        </p>
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em]">{t.notFoundTitle}</h1>
        <p className="mt-3 text-[15px] text-[#86868b] leading-relaxed">{t.notFoundDesc}</p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3 bg-[#0071e3] text-white text-[15px] font-medium rounded-full hover:bg-[#0077ed] transition-all duration-200 active:scale-[0.97]"
          >
            {t.notFoundHome}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-[14px] text-[#86868b] hover:text-[#0071e3] transition-colors"
          >
            {t.notFoundBack}
          </button>
        </div>
      </div>
    </div>
  );
}
