import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

export default function TermsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-surface-bg pb-12">
      <Helmet>
        <title>KoriBridge - {t.termsTitle}</title>
        <meta name="description" content="KoriBridge 이용약관입니다. KoriBridge 서비스 이용에 관한 규정을 확인하세요." />
        <meta property="og:title" content="KoriBridge - 이용약관" />
        <meta property="og:url" content="https://koribridge.vercel.app/terms" />
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h1 className="text-sm font-bold text-neutral-900">{t.termsTitle}</h1>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-2xl mx-auto space-y-6 text-sm text-neutral-700 leading-relaxed">
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">제1조 (목적)</h2>
          <p>본 약관은 KoriBridge(이하 "서비스")가 제공하는 언어·문화 교류 플랫폼 서비스의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">제2조 (서비스 이용)</h2>
          <p>서비스는 만 14세 이상의 사용자가 이용할 수 있습니다. 회원가입 시 정확한 정보를 입력해야 하며, 허위 정보 입력으로 발생하는 불이익은 이용자 본인의 책임입니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">제3조 (금지 행위)</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>타인에 대한 욕설, 비방, 혐오 발언</li>
            <li>스팸 메시지 및 광고성 콘텐츠 전송</li>
            <li>개인정보 무단 수집 및 유포</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">제4조 (서비스 변경 및 중단)</h2>
          <p>서비스는 운영상 필요에 따라 서비스 내용을 변경하거나 중단할 수 있으며, 이에 대해 이용자에게 사전 공지합니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-extrabold text-neutral-900 mb-2 pl-3 border-l-4 border-primary-500">제5조 (면책 조항)</h2>
          <p>서비스는 이용자 간 교류에서 발생하는 분쟁에 대해 직접적인 책임을 지지 않습니다. 단, 신고된 내용에 대해서는 검토 후 적절한 조치를 취합니다.</p>
        </section>
        <p className="text-xs text-neutral-400 pt-4 border-t border-neutral-150">최종 수정일: 2026년 6월</p>
      </div>
    </div>
  );
}
