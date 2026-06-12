import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비바 */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-red-600 font-bold text-lg">🌏 KoriBridge</span>
        <button
          onClick={signOut}
          className="text-sm text-gray-400 active:text-gray-600"
        >
          로그아웃
        </button>
      </div>

      <div className="px-6 py-8 max-w-md mx-auto space-y-4">
        {profile ? (
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl">
                🙋
              </div>
              <div>
                <p className="font-bold text-gray-900">{profile.display_name}</p>
                <p className="text-sm text-gray-500">{profile.nationality} · {profile.native_language} → {profile.learning_language}</p>
              </div>
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{profile.bio}</p>
            )}
            {profile.interests?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.interests.map((i) => (
                  <span key={i} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-medium">
                    #{i}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        )}

        {/* 준비 중 배너 */}
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">🚧</div>
          <p className="font-semibold text-gray-700">파트너 매칭 기능 준비 중</p>
          <p className="text-sm text-gray-400 mt-1">곧 업데이트될 예정입니다!</p>
        </div>
      </div>
    </div>
  );
}
