import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

export default function PrivacyPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-surface-bg pb-12">
      <Helmet>
        <title>KoriBridge - {t.privacyTitle}</title>
        <meta name="description" content="KoriBridge 개인정보처리방침입니다. 회원님의 개인정보를 안전하게 보호합니다." />
        <meta property="og:title" content="KoriBridge - 개인정보처리방침" />
        <meta property="og:url" content="https://koribridge.vercel.app/privacy" />
      </Helmet>

      <div className="bg-white border-b border-neutral-150 shadow-nav px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-900 transition p-1 -ml-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h1 className="text-sm font-bold text-neutral-900">{t.privacyTitle}</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-2xl mx-auto space-y-6 text-sm text-neutral-700 leading-relaxed">
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">1. 수집하는 개인정보 항목</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>이메일 주소 (회원가입 및 로그인)</li>
            <li>닉네임, 국적, 사용 언어, 관심사 (프로필 등록)</li>
            <li>프로필 사진 (선택 사항)</li>
            <li>채팅 메시지 내용</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">2. 개인정보 수집 및 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>회원 식별 및 서비스 제공</li>
            <li>언어 교환 파트너 매칭</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">3. 개인정보 보유 및 이용 기간</h2>
          <p>회원 탈퇴 시까지 보유합니다. 단, 관계 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">4. 개인정보의 제3자 제공</h2>
          <p>서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 요청이 있는 경우는 예외입니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">5. 이용자의 권리</h2>
          <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다. 회원 탈퇴를 통해 모든 개인정보 삭제를 요청할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">6. 문의</h2>
          <p>개인정보 관련 문의는 서비스 내 신고 기능 또는 이메일로 연락해 주세요.</p>
        </section>
        <p className="text-xs text-neutral-400 pt-4 border-t border-neutral-150">최종 수정일: 2026년 6월</p>
      </div>
    </div>
  );
}
