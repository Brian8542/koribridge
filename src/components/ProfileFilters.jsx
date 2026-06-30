import React, { useMemo } from "react";
import { useLocale } from "../hooks/useLocale";

function ProfileFilters({
  profiles,
  languages,
  nationalityFilter,
  languageFilter,
  levelFilter,
  onNationality,
  onLanguage,
  onLevel,
}) {
  const { t, levelLabel } = useLocale();
  const nationalities = useMemo(
    () => [...new Set(profiles.map((p) => p.nationality))],
    [profiles]
  );

  return (
    <div className="rounded-apple-lg bg-white p-5 border border-[#d2d2d7]/40">
      <p className="text-[13px] font-semibold text-[#1d1d1f] mb-4">{t.filterTitle}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-[11px] font-semibold text-[#86868b] block mb-1.5">{t.filterNationality}</label>
          <select
            className="input-field"
            value={nationalityFilter}
            onChange={(e) => onNationality(e.target.value)}
          >
            <option value="">{t.filterAll}</option>
            {nationalities.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[#86868b] block mb-1.5">{t.filterLanguage}</label>
          <select
            className="input-field"
            value={languageFilter}
            onChange={(e) => onLanguage(e.target.value)}
          >
            <option value="">{t.filterAll}</option>
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[#86868b] block mb-1.5">{t.filterLevel}</label>
          <select
            className="input-field"
            value={levelFilter}
            onChange={(e) => onLevel(e.target.value)}
          >
            <option value="">{t.filterAll}</option>
            {["초급", "중급", "고급"].map((level) => (
              <option key={level} value={level}>{levelLabel(level)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProfileFilters);
