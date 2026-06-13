import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* 로고 */}
        <div className="w-20 h-20 rounded-3xl bg-red-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-4xl font-extrabold tracking-tight">K</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">KoriBridge</h1>
          <p className="mt-1 text-sm text-gray-400">한국어·문화 교류 파트너 플랫폼</p>
        </div>
        {/* 로딩 점 */}
        <div className="flex items-center gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-red-600 opacity-80"
              style={{
                animation: `bounce 1s infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
