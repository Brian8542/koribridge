import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

export default function PrivacyPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  const SECTIONS = [
    { title: "1. 수집하는 개인정보 항목", list: [
      "이메일 주소 (회원가입 및 로그인)",
      "닉네임, 국적, 사용 언어, 관심사 (프로필 등록)",
      "프로필 사진 (선택 사항)",
      "채팅 메시지 내용",
    ]},
    { title: "2. 개인정보 수집 및 이용 목적", list: [
      "회원 식별 및 서비스 제공",
      "언어 교환 파트너 매칭",
      "서비스 개선 및 통계 분석",
    ]},
    { title: "3. 개인정보 보유 및 이용 기간", text: "회원 탈퇴 시까지 보유합니다. 단, 관계 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다." },
    { title: "4. 개인정보의 제3자 제공", text: "서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 요청이 있는 경우는 예외입니다." },
    { title: "5. 이용자의 권리", text: "이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다. 회원 탈퇴를 통해 모든 개인정보 삭제를 요청할 수 있습니다." },
    { title: "6. 문의", text: "개인정보 관련 문의는 서비스 내 신고 기능 또는 이메일로 연락해 주세요." },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Helmet>
        <title>KoriBridge - {t.privacyTitle}</title>
        <meta name="description" content="KoriBridge 개인정보처리방침입니다. 회원님의 개인정보를 안전하게 보호합니다." />
      </Helmet>

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
          <span className="text-[13px] font-medium text-[#1d1d1f]">{t.privacyTitle}</span>
        </div>
      </nav>

      <div className="px-5 py-12 max-w-[720px] mx-auto">
        <div className="bg-white rounded-apple-lg p-8 md:p-10 shadow-card">
          <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em] mb-2">{t.privacyTitle}</h1>
          <p className="text-[13px] text-[#86868b] mb-10">최종 수정일: 2026년 6월</p>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-3">{section.title}</h2>
                {section.text && <p className="text-[15px] text-[#6e6e73] leading-relaxed">{section.text}</p>}
                {section.list && (
                  <ul className="space-y-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[15px] text-[#6e6e73] leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#86868b] mt-2.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-[#d2d2d7]/50">
            <button
              onClick={() => navigate("/terms")}
              className="text-[13px] text-[#0071e3] hover:underline transition-colors"
            >
              이용약관 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
