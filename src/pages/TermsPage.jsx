import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

export default function TermsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Helmet>
        <title>KoriBridge - {t.termsTitle}</title>
        <meta name="description" content="KoriBridge 이용약관입니다. KoriBridge 서비스 이용에 관한 규정을 확인하세요." />
      </Helmet>

      {/* Nav */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-[#d2d2d7]/40 px-5 h-14 flex items-center">
        <div className="max-w-[720px] mx-auto w-full flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[#86868b] hover:text-[#0071e3] transition-colors p-1 -ml-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[13px] font-medium text-[#1d1d1f]">{t.termsTitle}</span>
        </div>
      </nav>

      {/* Content */}
      <div className="px-5 py-12 max-w-[720px] mx-auto">
        <div className="bg-white rounded-apple-lg p-8 md:p-10 shadow-card">
          <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em] mb-2">{t.termsTitle}</h1>
          <p className="text-[13px] text-[#86868b] mb-10">최종 수정일: 2026년 6월</p>

          <div className="space-y-8 text-[15px] text-[#1d1d1f] leading-relaxed">
            {[
              { title: "제1조 (목적)", content: "본 약관은 KoriBridge(이하 '서비스')가 제공하는 언어·문화 교류 플랫폼 서비스의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.", list: null },
              { title: "제2조 (서비스 이용)", content: "서비스는 만 14세 이상의 사용자가 이용할 수 있습니다. 회원가입 시 정확한 정보를 입력해야 하며, 허위 정보 입력으로 발생하는 불이익은 이용자 본인의 책임입니다.", list: null },
              { title: "제3조 (금지 행위)", content: null, list: [
                "타인에 대한 욕설, 비방, 혐오 발언",
                "스팸 메시지 및 광고성 콘텐츠 전송",
                "개인정보 무단 수집 및 유포",
                "서비스의 정상적인 운영을 방해하는 행위",
              ]},
              { title: "제4조 (서비스 변경 및 중단)", content: "서비스는 운영상 필요에 따라 서비스 내용을 변경하거나 중단할 수 있으며, 이에 대해 이용자에게 사전 공지합니다.", list: null },
              { title: "제5조 (면책 조항)", content: "서비스는 이용자 간 교류에서 발생하는 분쟁에 대해 직접적인 책임을 지지 않습니다. 단, 신고된 내용에 대해서는 검토 후 적절한 조치를 취합니다.", list: null },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-3">{section.title}</h2>
                {section.content && <p className="text-[#6e6e73]">{section.content}</p>}
                {section.list && (
                  <ul className="space-y-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[#6e6e73]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#86868b] mt-2.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-[#d2d2d7]/50 flex gap-3">
            <button
              onClick={() => navigate("/privacy")}
              className="text-[13px] text-[#0071e3] hover:underline transition-colors"
            >
              개인정보처리방침 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
