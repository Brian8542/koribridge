import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProfileDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("프로필을 불러오는 중 오류가 발생했습니다.");
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">프로필을 불러오는 중...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold">{error || "프로필을 찾을 수 없습니다."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 btn-secondary"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">← 뒤로</button>
        <h1 className="font-bold text-lg text-gray-900">프로필 상세</h1>
      </div>

      <div className="px-6 py-8 max-w-2xl mx-auto space-y-6">
        <div className="card">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">🙋</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile.display_name}</p>
              <p className="text-sm text-gray-500">
                {profile.nationality} · {profile.native_language} → {profile.learning_language}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">관심사</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">자기소개</p>
              <div className="bg-gray-50 p-4 rounded-2xl text-gray-700 whitespace-pre-wrap">
                {profile.bio || "소개가 없습니다."}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => navigate(`/chat/${profile.id}`)}
              className="btn-primary w-full sm:w-auto px-5 py-3"
            >
              채팅하기
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary w-full sm:w-auto px-5 py-3"
            >
              뒤로 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
