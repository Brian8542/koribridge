import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function AdminPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  if (!user || user.email !== 'chl@qone.kr') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-3xl p-8 text-center">
        <p className="text-red-600 font-semibold">접근 권한이 없습니다.</p>
        <button onClick={() => nav('/home')} className="mt-6 btn-primary px-6 py-3">홈으로</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0">
        <button onClick={() => nav('/home')} className="text-sm text-gray-500">← 홈</button>
        <h1 className="font-bold text-lg">관리자 대시보드</h1>
      </div>
      <div className="px-4 py-6 text-center text-gray-500 text-sm">관리자 페이지입니다.</div>
    </div>
  );
}
