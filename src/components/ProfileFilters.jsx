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
    <div className="rounded-2xl bg-white p-5 border border-neutral-150 shadow-xs">
      <p className="text-sm font-semibold text-neutral-700 mb-4">{t.filterTitle}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold text-neutral-500 block mb-1.5">{t.filterNationality}</label>
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
          <label className="text-xs font-semibold text-neutral-500 block mb-1.5">{t.filterLanguage}</label>
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
          <label className="text-xs font-semibold text-neutral-500 block mb-1.5">{t.filterLevel}</label>
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
