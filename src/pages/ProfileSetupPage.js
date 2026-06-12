import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const NATIONALITIES = [
  "한국", "베트남", "태국", "필리핀", "인도네시아", "말레이시아",
  "캄보디아", "미얀마", "라오스", "카자흐스탄", "우즈베키스탄",
  "키르기스스탄", "타지키스탄", "몽골", "중국", "일본", "기타",
];

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어",
  "일본어", "기타",
];

const INTERESTS = [
  { id: "kpop", label: "K-pop", emoji: "🎵" },
  { id: "kdrama", label: "K-드라마", emoji: "📺" },
  { id: "food", label: "한국 음식", emoji: "🍜" },
  { id: "travel", label: "여행", emoji: "✈️" },
  { id: "language", label: "언어 교환", emoji: "💬" },
  { id: "culture", label: "문화 교류", emoji: "🎎" },
  { id: "sports", label: "스포츠", emoji: "⚽" },
  { id: "gaming", label: "게임", emoji: "🎮" },
  { id: "beauty", label: "뷰티/패션", emoji: "💄" },
  { id: "study", label: "공부/학업", emoji: "📚" },
];

export default function ProfileSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    display_name: "",
    nationality: "",
    native_language: "",
    learning_language: "",
    bio: "",
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.display_name.trim()) { setError("이름을 입력해 주세요."); return; }
    if (!form.nationality) { setError("국적을 선택해 주세요."); return; }
    if (!form.native_language) { setError("모국어를 선택해 주세요."); return; }
    if (!form.learning_language) { setError("배우고 싶은 언어를 선택해 주세요."); return; }

    setLoading(true);

    const { error: dbError } = await supabase.from("profiles").upsert({
      id: user.id,
      display_name: form.display_name.trim(),
      nationality: form.nationality,
      native_language: form.native_language,
      learning_language: form.learning_language,
      bio: form.bio.trim(),
      interests: selectedInterests,
    });

    setLoading(false);

    if (dbError) {
      setError("저장 중 오류가 발생했습니다: " + dbError.message);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 헤더 */}
      <div className="bg-red-600 px-6 pt-12 pb-6 text-white">
        <p className="text-red-200 text-xs font-medium mb-1">STEP 1 of 1</p>
        <h1 className="text-xl font-bold">프로필 등록</h1>
        <p className="text-red-100 text-sm mt-1">파트너 찾기에 사용될 정보입니다</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 max-w-md mx-auto">

        {/* 이름 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            표시 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="닉네임 또는 실명"
            value={form.display_name}
            onChange={(e) => handleChange("display_name", e.target.value)}
            maxLength={30}
          />
        </div>

        {/* 국적 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            국적 <span className="text-red-500">*</span>
          </label>
          <select
            className="input-field"
            value={form.nationality}
            onChange={(e) => handleChange("nationality", e.target.value)}
          >
            <option value="">선택해 주세요</option>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* 모국어 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            모국어 <span className="text-red-500">*</span>
          </label>
          <select
            className="input-field"
            value={form.native_language}
            onChange={(e) => handleChange("native_language", e.target.value)}
          >
            <option value="">선택해 주세요</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* 배우고 싶은 언어 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            배우고 싶은 언어 <span className="text-red-500">*</span>
          </label>
          <select
            className="input-field"
            value={form.learning_language}
            onChange={(e) => handleChange("learning_language", e.target.value)}
          >
            <option value="">선택해 주세요</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* 관심사 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            관심사 <span className="text-gray-400 font-normal">(복수 선택 가능)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {INTERESTS.map(({ id, label, emoji }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleInterest(id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedInterests.includes(id)
                    ? "bg-red-50 border-red-400 text-red-700"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 자기소개 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            자기소개 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="간단히 소개해 주세요 (언어 실력, 목표 등)"
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            maxLength={200}
          />
          <p className="text-right text-xs text-gray-400 mt-1">{form.bio.length}/200</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "저장 중..." : "프로필 완성하기 →"}
        </button>
      </form>
    </div>
  );
}
