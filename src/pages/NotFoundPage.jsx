import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLocale } from "../hooks/useLocale";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-bg px-6">
      <Helmet><title>KoriBridge - {t.notFoundTitle}</title></Helmet>

      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-8 shadow-red-md">
          <span className="text-white text-xl font-black">K</span>
        </div>
        <p className="text-[7rem] font-black text-neutral-100 leading-none select-none">404</p>
        <h1 className="text-2xl font-extrabold text-neutral-900 mt-2 tracking-tight">{t.notFoundTitle}</h1>
        <p className="mt-3 text-neutral-500 text-sm leading-relaxed">{t.notFoundDesc}</p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="btn-primary px-8 py-3.5 text-sm font-extrabold w-auto"
          >
            {t.notFoundHome}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-neutral-400 text-sm hover:text-neutral-700 underline transition"
          >
            {t.notFoundBack}
          </button>
        </div>
      </div>
    </div>
  );
}
