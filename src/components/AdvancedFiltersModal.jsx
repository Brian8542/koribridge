import React, { useState, useEffect, useCallback } from "react";
import { useLocale } from "../hooks/useLocale";
import { INTERESTS, INTEREST_LABELS_EN, MAX_INTERESTS } from "../utils/profileOptions";
import { useToast } from "./Toast";

const LEVELS = ["초급", "중급", "고급"];

function AdvancedFiltersModal({
  languages,
  nationalities,
  filters,
  onApply,
  onClose,
}) {
  const { t, levelLabel, locale } = useLocale();
  const { showToast } = useToast();

  const [pending, setPending] = useState({ ...filters });

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = useCallback((key, value) => {
    setPending((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleInterest = useCallback((interest) => {
    setPending((prev) => {
      const has = prev.interestFilter.includes(interest);
      if (!has && prev.interestFilter.length >= MAX_INTERESTS) {
        showToast(t.interestsMaxReached, "error");
        return prev;
      }
      return {
        ...prev,
        interestFilter: has
          ? prev.interestFilter.filter((i) => i !== interest)
          : [...prev.interestFilter, interest],
      };
    });
  }, [showToast, t.interestsMaxReached]);

  const handleReset = useCallback(() => {
    setPending({
      nationalityFilter: "",
      languageFilter: "",
      nativeLangFilter: "",
      levelFilter: "",
      interestFilter: [],
      verifiedOnly: false,
    });
  }, []);

  const activeCount = [
    pending.nationalityFilter,
    pending.languageFilter,
    pending.nativeLangFilter,
    pending.levelFilter,
    pending.verifiedOnly,
  ].filter(Boolean).length + (pending.interestFilter.length > 0 ? 1 : 0);

  const interestLabel = (i) => locale === "ko" ? i : (INTEREST_LABELS_EN[i] || i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1d1d1f]/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-[28px] sm:rounded-apple-lg w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-xl border border-[#d2d2d7]/40">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#d2d2d7]/40 flex-shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-[#1d1d1f]">{t.filterTitle}</h2>
            <p className="text-[12px] text-[#86868b] mt-0.5">{t.filterIntro}</p>
          </div>
          <button onClick={onClose} className="text-[#86868b] hover:text-[#1d1d1f] p-1 -mr-1 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* 배우고 싶은 언어 */}
          <div>
            <label className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wide block mb-2">{t.filterLanguage}</label>
            <select
              className="input-field"
              value={pending.languageFilter}
              onChange={(e) => set("languageFilter", e.target.value)}
            >
              <option value="">{t.filterAll}</option>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* 모국어 */}
          <div>
            <label className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wide block mb-2">{t.filterNativeLang}</label>
            <select
              className="input-field"
              value={pending.nativeLangFilter}
              onChange={(e) => set("nativeLangFilter", e.target.value)}
            >
              <option value="">{t.filterAll}</option>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* 국적 */}
          <div>
            <label className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wide block mb-2">{t.filterNationality}</label>
            <select
              className="input-field"
              value={pending.nationalityFilter}
              onChange={(e) => set("nationalityFilter", e.target.value)}
            >
              <option value="">{t.filterAll}</option>
              {nationalities.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* 언어 수준 */}
          <div>
            <label className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wide block mb-2">{t.filterLevel}</label>
            <div className="flex gap-2">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => set("levelFilter", pending.levelFilter === level ? "" : level)}
                  className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all ${
                    pending.levelFilter === level
                      ? "bg-[#0071e3] text-white"
                      : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"
                  }`}
                >
                  {levelLabel(level)}
                </button>
              ))}
            </div>
          </div>

          {/* 관심사 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wide">{t.filterInterests}</label>
              {pending.interestFilter.length > 0 && (
                <span className="text-[11px] text-[#0071e3] font-semibold">
                  {pending.interestFilter.length}{t.interestsCount}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const active = pending.interestFilter.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all duration-150 ${
                      active
                        ? "bg-[#0071e3] text-white"
                        : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"
                    }`}
                  >
                    {interestLabel(interest)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 인증 회원만 */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-[14px] font-semibold text-[#1d1d1f]">{t.filterVerifiedOnly}</p>
            </div>
            <button
              type="button"
              onClick={() => set("verifiedOnly", !pending.verifiedOnly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                pending.verifiedOnly ? "bg-[#0071e3]" : "bg-[#d2d2d7]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  pending.verifiedOnly ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-[#d2d2d7]/40 flex gap-3 flex-shrink-0">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-semibold hover:bg-[#e8e8ed] transition-colors"
          >
            {t.filterResetBtn}
          </button>
          <button
            onClick={() => { onApply(pending); onClose(); }}
            className="flex-[2] py-3 rounded-full bg-[#0071e3] text-white text-[14px] font-semibold hover:bg-[#0077ed] transition-colors relative"
          >
            {t.filterApplyBtn}
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ff3b30] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AdvancedFiltersModal);
