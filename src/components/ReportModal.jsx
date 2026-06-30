import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "./Toast";

export default function ReportModal({ targetId, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("부적절한 콘텐츠");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id, reported_id: targetId, reason, detail: detail.slice(0, 1000)
    });
    setLoading(false);
    if (!error) { onSuccess?.(); onClose(); }
    else showToast("신고 제출 중 오류가 발생했습니다.", "error");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1d1d1f]/40 backdrop-blur-sm">
      <div className="bg-white rounded-apple-lg w-full max-w-md p-6 shadow-modal border border-[#d2d2d7]/40">
        <h2 className="text-[16px] font-bold text-[#1d1d1f] mb-4">사용자 신고</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5">사유 선택</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="input-field">
              <option>부적절한 콘텐츠</option><option>스팸</option><option>사기 의심</option><option>기타</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#86868b] mb-1.5">상세 내용</label>
            <textarea value={detail} onChange={(e) => setDetail(e.target.value)} maxLength={1000} className="input-field h-32 resize-none" placeholder="자세한 상황을 설명해주세요." />
          </div>
        </div>
        <div className="flex gap-2.5 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[13px] font-semibold hover:bg-[#e8e8ed] transition-colors">취소</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold disabled:opacity-50 transition-colors">{loading ? "제출 중..." : "신고하기"}</button>
        </div>
      </div>
    </div>
  );
}
