import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Helmet><title>KoriBridge - 개인정보처리방침</title></Helmet>

      <div className="relative bg-gradient-to-br from-red-600 via-rose-500 to-pink-400 px-6 pt-12 pb-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white text-sm font-semibold transition mb-6 block">← 뒤로</button>
        <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center mb-3 shadow-lg">
          <span className="text-xl">🔒</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">개인정보처리방침</h1>
        <p className="text-white/70 text-sm mt-1">회원님의 개인정보를 소중히 다루겠습니다.</p>
      </div>

      <div className="px-6 py-8 max-w-2xl mx-auto space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-sm font-extrabold text-gray-900 mb-2 pl-3 border-l-4 border-red-500">1. 수집하는 개인정보 항목</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>이메일 주소 (회원가입 및 로그인)</li>
            <li>닉네임, 국적, 사용 언어, 관심사 (프로필 등록)</li>
            <li>프로필 사진 (선택 사항)</li>
            <li>채팅 메시지 내용</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-gray-900 mb-2 pl-3 border-l-4 border-red-500">2. 개인정보 수집 및 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>회원 식별 및 서비스 제공</li>
            <li>언어 교환 파트너 매칭</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-gray-900 mb-2 pl-3 border-l-4 border-red-500">3. 개인정보 보유 및 이용 기간</h2>
          <p>회원 탈퇴 시까지 보유합니다. 단, 관계 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-gray-900 mb-2 pl-3 border-l-4 border-red-500">4. 개인정보의 제3자 제공</h2>
          <p>서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 요청이 있는 경우는 예외입니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-gray-900 mb-2 pl-3 border-l-4 border-red-500">5. 이용자의 권리</h2>
          <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다. 회원 탈퇴를 통해 모든 개인정보 삭제를 요청할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-gray-900 mb-2 pl-3 border-l-4 border-red-500">6. 문의</h2>
          <p>개인정보 관련 문의는 서비스 내 신고 기능 또는 이메일로 연락해 주세요.</p>
        </section>
        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">최종 수정일: 2026년 6월</p>
      </div>
    </div>
  );
}
