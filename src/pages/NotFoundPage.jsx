import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocale } from "../hooks/useLocale";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] px-5">
      <Helmet><title>KoriBridge - {t.notFoundTitle}</title></Helmet>

      <div className="text-center max-w-sm">
        <p className="font-bold text-[#E5DED2] select-none leading-none mb-4" style={{ fontSize: "clamp(6rem, 20vw, 9rem)", letterSpacing: "-0.05em" }}>
          404
        </p>
        <h1 className="font-display text-[30px] text-[#1E1B18]">{t.notFoundTitle}</h1>
        <p className="mt-3 text-[15px] text-[#8A837B] leading-relaxed">{t.notFoundDesc}</p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3 bg-[#4A1D3F] text-white text-[15px] font-medium rounded-full hover:bg-[#3B1732] transition-all duration-200 active:scale-[0.97]"
          >
            {t.notFoundHome}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-[14px] text-[#8A837B] hover:text-[#4A1D3F] transition-colors"
          >
            {t.notFoundBack}
          </button>
        </div>
      </div>
    </div>
  );
}
