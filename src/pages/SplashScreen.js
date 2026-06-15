import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth", { replace: true });
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-600 via-rose-500 to-pink-500 overflow-hidden relative">
      <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div
        className="relative flex flex-col items-center gap-7 px-6 text-center"
        style={{ animation: "splashIn 0.75s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
      >
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
          <span className="text-white text-5xl font-extrabold leading-none">K</span>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">KoriBridge</h1>
          <p className="mt-2 text-white/80 text-base font-medium">한국어·문화 교류 파트너 플랫폼</p>
          <p className="mt-1 text-white/55 text-sm">세계를 잇는 언어의 다리</p>
        </div>

        <div className="flex items-center gap-2.5 mt-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-white/70"
              style={{ animation: "dotBounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes splashIn {
          from { opacity: 0; transform: translateY(24px) scale(0.93); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
