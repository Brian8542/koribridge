import React from "react";
import { useNavigate } from "react-router-dom";

export default function TermsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 sticky top-0">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">← 뒤로</button>
        <h1 className="font-bold text-lg text-gray-900">이용약관</h1>
      </div>
      <div className="px-6 py-8 max-w-2xl mx-auto space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제1조 (목적)</h2>
          <p>본 약관은 KoriBridge(이하 "서비스")가 제공하는 언어·문화 교류 플랫폼 서비스의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제2조 (서비스 이용)</h2>
          <p>서비스는 만 14세 이상의 사용자가 이용할 수 있습니다. 회원가입 시 정확한 정보를 입력해야 하며, 허위 정보 입력으로 발생하는 불이익은 이용자 본인의 책임입니다.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제3조 (금지 행위)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>타인에 대한 욕설, 비방, 혐오 발언</li>
            <li>스팸 메시지 및 광고성 콘텐츠 전송</li>
            <li>개인정보 무단 수집 및 유포</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제4조 (서비스 변경 및 중단)</h2>
          <p>서비스는 운영상 필요에 따라 서비스 내용을 변경하거나 중단할 수 있으며, 이에 대해 이용자에게 사전 공지합니다.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제5조 (면책 조항)</h2>
          <p>서비스는 이용자 간 교류에서 발생하는 분쟁에 대해 직접적인 책임을 지지 않습니다. 단, 신고된 내용에 대해서는 검토 후 적절한 조치를 취합니다.</p>
        </section>
        <p className="text-xs text-gray-400 pt-4">최종 수정일: 2026년 6월</p>
      </div>
    </div>
  );
}
