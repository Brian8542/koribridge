import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-6 text-4xl font-extrabold text-red-600">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동됐습니다.
        </p>
        <button
          onClick={() => navigate("/home")}
          className="mt-8 btn-primary px-8 py-3"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
