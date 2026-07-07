import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

export default function PrivacyPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  // 법률 검토 필요: 아래 방침은 상용 배포 전 반드시 개인정보보호 전문가(변호사/CPO)의 검토를 거쳐야 합니다.
  const SECTIONS = [
    { title: "1. 수집하는 개인정보 항목", list: [
      "필수: 이메일 주소 (회원가입, 로그인, 계정 인증)",
      "필수: 닉네임, 국적, 모국어, 학습 언어, 언어 수준 (프로필 및 매칭)",
      "선택: 프로필 사진, 자기소개, 관심사, 대화 목적, 프로필 이야기(프롬프트 답변)",
      "서비스 이용 과정 생성 정보: 채팅 메시지, 음성 메모, 이미지, 커뮤니티 게시물, 추천글, 좋아요·매칭 기록, 최근 접속 시각, 알림 기록",
      "자동 수집 정보: 접속 로그, 기기·브라우저 정보, 쿠키(로그인 유지·언어 설정), 서비스 이용 통계(Google Analytics)",
    ]},
    { title: "2. 개인정보 수집 및 이용 목적", list: [
      "회원 식별, 계정 관리 및 서비스 제공",
      "언어 교류 파트너 매칭 및 추천 (성별·국적에 따른 차별적 가중치를 두지 않습니다)",
      "실시간 채팅, 알림, 푸시 등 커뮤니케이션 기능 제공",
      "부정 이용 방지, 신고 처리, 이용자 보호",
      "서비스 개선 및 익명화된 통계 분석",
    ]},
    { title: "3. 개인정보 보유 및 이용 기간", text: "회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령(통신비밀보호법, 전자상거래법 등)에 따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 분리 보관 후 파기합니다. 신고·제재 이력은 재가입 악용 방지를 위해 탈퇴 후 최대 1년간 보관될 수 있습니다." },
    { title: "4. 개인정보의 제3자 제공 및 처리 위탁", list: [
      "회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 적법한 요청이 있는 경우는 예외입니다.",
      "처리 위탁: Supabase Inc. (데이터베이스·인증·저장소 호스팅), Vercel Inc. (웹 호스팅), Google LLC (접속 통계 분석)",
      "위 수탁사는 국외(미국 등)에서 개인정보를 처리할 수 있으며, 회사는 계약을 통해 안전한 관리·감독을 수행합니다.",
    ]},
    { title: "5. 개인정보의 파기 절차 및 방법", text: "전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법으로 삭제하며, 그 외 기록물은 분쇄 또는 소각하여 파기합니다." },
    { title: "6. 이용자의 권리와 행사 방법", text: "이용자는 언제든지 자신의 개인정보를 조회·수정할 수 있으며, 프로필 공개 여부를 직접 설정할 수 있습니다. 회원 탈퇴 기능을 통해 개인정보 삭제를 요청할 수 있고, 법정대리인은 만 14세 이상 아동의 권리를 대리 행사할 수 있습니다." },
    { title: "7. 개인정보의 안전성 확보 조치", list: [
      "전송 구간 암호화(HTTPS) 및 데이터베이스 접근 제어(행 수준 보안, RLS)",
      "이메일 인증 기반 계정 확인",
      "접근 권한 최소화 및 관리자 접근 기록 관리",
    ]},
    { title: "8. 쿠키의 운용", text: "로그인 유지, 언어 설정 저장, 서비스 이용 통계 목적으로 쿠키 및 로컬 스토리지를 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나 일부 기능 이용이 제한될 수 있습니다." },
    { title: "9. 개인정보 보호책임자 및 문의", text: "개인정보 관련 문의, 열람·정정·삭제 요청은 서비스 내 신고 기능 또는 문의 이메일로 연락해 주세요. 회사는 지체 없이 답변·처리합니다. 기타 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118)에 문의할 수 있습니다." },
    { title: "10. 고지의 의무", text: "본 방침의 내용 추가·삭제·수정이 있을 경우 시행 7일 전부터 서비스 내 공지사항을 통해 고지합니다." },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Helmet>
        <title>KoriBridge - {t.privacyTitle}</title>
        <meta name="description" content="KoriBridge 개인정보처리방침입니다. 회원님의 개인정보를 안전하게 보호합니다." />
      </Helmet>

      <nav className="bg-white/90 backdrop-blur-xl border-b border-[#E5DED2]/40 px-5 h-14 flex items-center">
        <div className="max-w-[720px] mx-auto w-full flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="text-[#8A837B] hover:text-[#4A1D3F] transition-colors p-1 -ml-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[13px] font-medium text-[#1E1B18]">{t.privacyTitle}</span>
        </div>
      </nav>

      <div className="px-5 py-12 max-w-[720px] mx-auto">
        <div className="bg-white rounded-apple-lg p-8 md:p-10 shadow-card">
          <h1 className="font-display text-[30px] text-[#1E1B18] mb-2">{t.privacyTitle}</h1>
          <p className="text-[13px] text-[#8A837B] mb-10">시행일: 2026년 7월 7일 · 버전 2.0</p>

          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-[17px] font-semibold text-[#1E1B18] mb-3">{section.title}</h2>
                {section.text && <p className="text-[15px] text-[#6E675F] leading-relaxed">{section.text}</p>}
                {section.list && (
                  <ul className="space-y-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[15px] text-[#6E675F] leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8A837B] mt-2.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-[#E5DED2]/50">
            <button
              onClick={() => navigate("/terms")}
              className="text-[13px] text-[#4A1D3F] hover:underline transition-colors"
            >
              이용약관 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
