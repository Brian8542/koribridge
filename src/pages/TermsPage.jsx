import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

export default function TermsPage() {
  const navigate = useNavigate();
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Helmet>
        <title>KoriBridge - {t.termsTitle}</title>
        <meta name="description" content="KoriBridge 이용약관입니다. KoriBridge 서비스 이용에 관한 규정을 확인하세요." />
      </Helmet>

      {/* Nav */}
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
          <span className="text-[13px] font-medium text-[#1E1B18]">{t.termsTitle}</span>
        </div>
      </nav>

      {/* Content */}
      <div className="px-5 py-12 max-w-[720px] mx-auto">
        <div className="bg-white rounded-apple-lg p-8 md:p-10 shadow-card">
          <h1 className="font-display text-[30px] text-[#1E1B18] mb-2">{t.termsTitle}</h1>
          <p className="text-[13px] text-[#8A837B] mb-10">시행일: 2026년 7월 7일 · 버전 2.0</p>

          {/* 법률 검토 필요: 아래 약관은 상용 배포 전 반드시 법률 전문가의 검토를 거쳐야 합니다. */}
          <div className="space-y-8 text-[15px] text-[#1E1B18] leading-relaxed">
            {[
              { title: "제1조 (목적)", content: "본 약관은 KoriBridge(이하 '회사' 또는 '서비스')가 제공하는 언어·문화 교류 플랫폼 및 관련 제반 서비스의 이용 조건과 절차, 회사와 이용자 간의 권리·의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.", list: null },
              { title: "제2조 (용어의 정의)", content: null, list: [
                "'이용자'란 본 약관에 따라 서비스를 이용하는 회원을 말합니다.",
                "'프로필'이란 이용자가 등록한 닉네임, 사진, 언어 정보, 관심사, 이야기(프롬프트 답변) 등 공개 정보를 말합니다.",
                "'매칭'이란 이용자 상호 간 좋아요 표시로 대화가 연결되는 것을 말합니다.",
                "'콘텐츠'란 이용자가 서비스 내에 게시한 메시지, 이미지, 음성 메모, 게시물, 추천글 등을 말합니다.",
              ]},
              { title: "제3조 (약관의 게시와 개정)", content: "회사는 본 약관을 서비스 초기 화면 또는 연결 화면에 게시합니다. 회사는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일자 및 개정 사유를 명시하여 적용일 7일 전(이용자에게 불리한 변경은 30일 전)부터 공지합니다.", list: null },
              { title: "제4조 (이용 계약의 성립 및 자격)", content: "서비스는 만 14세 이상의 사용자가 이용할 수 있습니다. 회원가입 시 정확한 정보를 입력해야 하며, 허위 정보 입력·타인 사칭으로 발생하는 불이익은 이용자 본인의 책임입니다. 이메일 인증이 완료되지 않은 계정은 일부 기능 이용이 제한될 수 있습니다.", list: null },
              { title: "제5조 (서비스의 내용)", content: null, list: [
                "언어 교류 파트너 프로필 열람·검색·매칭",
                "실시간 채팅, 음성 메모, 이미지 공유, 번역·교정 제안",
                "커뮤니티 게시물 및 댓글·교정 기능",
                "알림, 추천글(레퍼런스), 프로필 프롬프트 등 부가 기능",
              ]},
              { title: "제6조 (금지 행위)", content: "이용자는 다음 행위를 해서는 안 되며, 위반 시 사전 통지 없이 이용 제한 또는 계약 해지가 이루어질 수 있습니다.", list: [
                "타인에 대한 욕설, 비방, 차별·혐오 발언, 성희롱",
                "스팸 메시지, 광고성 콘텐츠, 외부 서비스 유인 행위",
                "타인의 개인정보 무단 수집·요구·유포",
                "금전 요구, 사기, 로맨스 스캠 등 재산상 피해를 유발하는 행위",
                "타인 사칭, 허위 프로필 운영, 계정 양도·대여",
                "서비스의 정상적인 운영을 방해하는 일체의 행위",
              ]},
              { title: "제7조 (콘텐츠의 권리와 책임)", content: "이용자가 게시한 콘텐츠의 저작권은 이용자 본인에게 있습니다. 이용자는 회사에 서비스 운영·개선·홍보 목적의 범위 내에서 콘텐츠를 사용할 수 있는 권리를 부여합니다. 타인의 권리를 침해하는 콘텐츠에 대한 법적 책임은 게시한 이용자에게 있습니다.", list: null },
              { title: "제8조 (신고 및 이용 제한)", content: "이용자는 금지 행위를 발견한 경우 서비스 내 신고 기능으로 신고할 수 있습니다. 회사는 신고 내용을 검토하여 경고, 콘텐츠 삭제, 이용 정지, 계약 해지 등의 조치를 취할 수 있습니다.", list: null },
              { title: "제9조 (서비스 변경 및 중단)", content: "회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 중대한 변경은 사전에 공지합니다. 무료로 제공되는 서비스의 변경·중단에 대해 회사는 관련 법령에 특별한 규정이 없는 한 별도의 보상을 하지 않습니다.", list: null },
              { title: "제10조 (면책 조항)", content: "회사는 이용자 간 언어 교류 및 오프라인 만남 등 교류 과정에서 발생하는 분쟁에 대해 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다. 천재지변, 통신 장애 등 불가항력으로 인한 서비스 제공 불능에 대해서도 같습니다.", list: null },
              { title: "제11조 (준거법 및 관할)", content: "본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련한 분쟁은 민사소송법상의 관할 법원에 제소합니다.", list: null },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-[17px] font-semibold text-[#1E1B18] mb-3">{section.title}</h2>
                {section.content && <p className="text-[#6E675F]">{section.content}</p>}
                {section.list && (
                  <ul className="space-y-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[#6E675F]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8A837B] mt-2.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* 법률 검토 필요: 사업자등록 완료 후 상호·대표자·사업자등록번호·소재지를 실제 정보로 교체할 것 */}
          <section className="mt-10 pt-8 border-t border-[#E5DED2]/50">
            <h2 className="text-[17px] font-semibold text-[#1E1B18] mb-3">부칙 · 운영자 및 문의처</h2>
            <ul className="space-y-2 text-[14px] text-[#6E675F] leading-relaxed">
              <li>서비스명: KoriBridge (코리브리지)</li>
              <li>운영: KoriBridge 운영팀 (사업자 등록 절차 진행 중)</li>
              <li>문의 이메일: <a href="mailto:brian8542@gmail.com" className="text-[#4A1D3F] hover:underline">brian8542@gmail.com</a></li>
              <li>본 약관은 2026년 7월 7일부터 시행됩니다.</li>
            </ul>
          </section>

          <div className="mt-10 pt-8 border-t border-[#E5DED2]/50 flex gap-3">
            <button
              onClick={() => navigate("/privacy")}
              className="text-[13px] text-[#4A1D3F] hover:underline transition-colors"
            >
              개인정보처리방침 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
