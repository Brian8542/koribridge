import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function DeleteAccountModal({ onClose }) {
  const { user, signOut } = useAuth();
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirm !== "탈퇴합니다") {
      setError("확인 문구를 정확히 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      // 프로필 삭제 (messages, blocked_users는 CASCADE로 자동 삭제)
      await supabase.from("profiles").delete().eq("id", user.id);
      // Storage 아바타 삭제 시도
      await supabase.storage.from("avatars").remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`]);
      // 로그아웃
      await signOut();
    } catch (err) {
      setError("탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-1">회원 탈퇴</h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          탈퇴하면 프로필, 채팅 내역 등 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          확인을 위해 아래에 <span className="text-red-600">탈퇴합니다</span> 를 입력해 주세요.
        </p>
        <input
          type="text"
          className="input-field text-sm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="탈퇴합니다"
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold">
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "처리 중..." : "탈퇴하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
