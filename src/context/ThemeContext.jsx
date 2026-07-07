import React, { createContext, useContext, useEffect, useMemo } from "react";

const ThemeContext = createContext(null);

// 다크 모드 제거: Hinge식 웜 라이트 테마 단일 운영.
// App.jsx 의 ThemeProvider 합성을 유지하기 위해 API 표면만 보존한다.
export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    try { window.localStorage.removeItem("koribridge-dark-mode"); } catch {}
  }, []);

  const value = useMemo(() => ({ darkMode: false, toggleDarkMode: () => {} }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
