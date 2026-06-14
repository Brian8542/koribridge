import React, { useMemo } from "react";

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
  const nationalities = useMemo(
    () => [...new Set(profiles.map((p) => p.nationality))],
    [profiles]
  );

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
      <p className="text-sm font-semibold text-gray-700 mb-4">파트너 필터</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm text-gray-600">국적</label>
          <select
            className="input-field mt-1"
            value={nationalityFilter}
            onChange={(e) => onNationality(e.target.value)}
          >
            <option value="">전체</option>
            {nationalities.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">배우고 싶은 언어</label>
          <select
            className="input-field mt-1"
            value={languageFilter}
            onChange={(e) => onLanguage(e.target.value)}
          >
            <option value="">전체</option>
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">언어 수준</label>
          <select
            className="input-field mt-1"
            value={levelFilter}
            onChange={(e) => onLevel(e.target.value)}
          >
            <option value="">전체</option>
            {["초급", "중급", "고급"].map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProfileFilters);
