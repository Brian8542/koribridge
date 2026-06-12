import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setProfiles(data || []);
      }
      setLoading(false);
    };

    loadProfiles();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">파트너 탐색</p>
          <h1 className="text-xl font-bold text-gray-900">KoriBridge</h1>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-400 active:text-gray-600"
        >
          로그아웃
        </button>
      </div>

      <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card animate-pulse h-52" />
            ))
          ) : profiles.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-gray-600">현재 다른 사용자가 없습니다.</p>
            </div>
          ) : (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="card p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/profile/${profile.id}`)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">🙋</div>
                    <div>
                      <p className="font-bold text-gray-900">{profile.display_name}</p>
                      <p className="text-sm text-gray-500">{profile.nationality}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      <p>모국어: <span className="text-gray-900">{profile.native_language}</span></p>
                      <p>배우고 싶은 언어: <span className="text-gray-900">{profile.learning_language}</span></p>
                    </div>
                    {profile.interests?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest) => (
                          <span key={interest} className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-medium">
                            #{interest}
                          </span>
                        ))}
                      </div>
                    )}
                    {profile.bio && (
                      <p className="text-sm text-gray-600 line-clamp-3">{profile.bio}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-500">프로필을 더 보려면 클릭하세요.</div>
                  <button
                    type="button"
                    onClick={() => navigate(`/chat/${profile.id}`)}
                    className="btn-primary w-full sm:w-auto px-5 py-3"
                  >
                    채팅하기
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
