import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "./Toast";
import ConfirmModal from "./ConfirmModal";

export default function BlockButton({ targetId, onBlockSuccess }) {
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBlockConfirm = async () => {
    setShowConfirm(false);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("blocked_users").insert({ blocker_id: user.id, blocked_id: targetId });
    if (error) {
      showToast("차단 처리 중 오류가 발생했습니다.", "error");
    } else {
      showToast("사용자가 차단되었습니다.", "success");
      onBlockSuccess?.();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 rounded-xl"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        차단하기
      </button>
      {showConfirm && (
        <ConfirmModal
          message="이 사용자를 차단하시겠습니까?"
          description="차단 후 서로의 프로필을 볼 수 없습니다."
          confirmLabel="차단하기"
          onConfirm={handleBlockConfirm}
          onCancel={() => setShowConfirm(false)}
          danger
        />
      )}
    </>
  );
}
