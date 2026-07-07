import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "../hooks/useLocale";

const LOCALE_OPTIONS = [
  { code: "ko", flag: "🇰🇷", label: "한국어" },
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "th", flag: "🇹🇭", label: "ภาษาไทย" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
];

function LanguageSelector({ dark = false }) {
  const { locale, changeLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LOCALE_OPTIONS.find((o) => o.code === locale) || LOCALE_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = useCallback((code) => {
    changeLocale(code);
    setOpen(false);
  }, [changeLocale]);

  const btnCls = dark
    ? "flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition text-white"
    : "flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 hover:bg-neutral-150 transition text-neutral-700";

  const dropdownCls = dark
    ? "absolute right-0 top-full mt-1.5 w-40 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-[9999] py-1"
    : "absolute right-0 top-full mt-1.5 w-40 bg-white border border-neutral-150 rounded-xl shadow-card overflow-hidden z-[9999] py-1";

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button type="button" onClick={() => setOpen((o) => !o)} className={btnCls}>
        <span className="text-sm leading-none">{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <span
          className="text-[9px] inline-block transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >▾</span>
      </button>
      {open && (
        <div className={dropdownCls}>
          {LOCALE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => handleSelect(opt.code)}
              className={
                dark
                  ? `w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                      locale === opt.code ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`
                  : `w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                      locale === opt.code ? "bg-[#F1E9EE] text-[#4A1D3F]" : "text-[#1E1B18] hover:bg-[#F3EEE6]"
                    }`
              }
            >
              <span className="text-base leading-none">{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(LanguageSelector);
