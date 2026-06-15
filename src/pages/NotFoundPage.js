import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 px-6">
      <Helmet><title>KoriBridge - 페이지 없음</title></Helmet>

      <div className="text-center">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-200">
          <span className="text-white text-3xl font-black">404</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          요청하신 페이지가 존재하지 않거나<br />이동됐습니다.
        </p>
        <button
          onClick={() => navigate("/home")}
          className="mt-8 btn-primary px-8 py-3 w-auto inline-flex items-center gap-2"
        >
          홈으로 돌아가기
        </button>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 block mx-auto text-sm text-gray-400 hover:text-gray-600 underline transition"
        >
          이전 페이지로
        </button>
      </div>
    </div>
  );
}
