import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어", "일본어", "기타",
];

const NATIONALITIES = [
  "한국", "미국", "영국", "캐나다", "호주", "베트남", "태국", "필리핀",
  "인도네시아", "말레이시아", "카자흐스탄", "우즈베키스탄", "중국", "일본", "기타",
];

const INTERESTS = ["K-pop", "한국 음식", "여행", "드라마", "언어 교환", "게임", "영화", "스포츠"];

export default function ProfileSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    display_name: "",
    nationality: "",
    native_language: "",
    learning_language: "",
    bio: "",
    avatar_url: "",
    interests: [],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setForm((prev) => {
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest],
      };
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("사진 크기는 2MB 이하여야 합니다.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user?.id) return null;
    setUploading(true);
    const ext = avatarFile.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });

    if (uploadError) {
      setUploading(false);
      throw uploadError;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setUploading(false);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.display_name.trim()) return setError("이름을 입력해 주세요.");
    if (!form.nationality) return setError("국적을 선택해 주세요.");
    if (!form.native_language) return setError("모국어를 선택해 주세요.");
    if (!form.learning_language) return setError("배우고 싶은 언어를 선택해 주세요.");

    setLoading(true);
    try {
      let avatar_url = form.avatar_url;
      if (avatarFile) {
        avatar_url = await uploadAvatar();
      }

      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: form.display_name.trim(),
        nationality: form.nationality,
        native_language: form.native_language,
        learning_language: form.learning_language,
        bio: form.bio.trim(),
        avatar_url: avatar_url || "",
        interests: form.interests,
      });

      if (upsertError) throw upsertError;
      navigate("/home", { replace: true });
    } catch (err) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">프로필 등록</h1>
          <p className="mt-2 text-sm text-gray-500">파트너를 만나기 전에 나를 소개해 주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* 프로필 사진 */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="미리보기" className="w-24 h-24 rounded-full object-cover border-2 border-red-100" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-4xl border-2 border-red-100">
                  {form.display_name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center cursor-pointer shadow">
                <span className="text-white text-lg leading-none">+</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="text-xs text-gray-400">JPG/PNG, 최대 2MB</p>
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">닉네임</label>
            <input
              type="text"
              className="input-field"
              value={form.display_name}
              onChange={(e) => handleChange("display_name", e.target.value)}
              placeholder="표시될 이름을 입력하세요"
            />
          </div>

          {/* 국적 / 모국어 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">국적</label>
              <select className="input-field" value={form.nationality} onChange={(e) => handleChange("nationality", e.target.value)}>
                <option value="">선택</option>
                {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">모국어</label>
              <select className="input-field" value={form.native_language} onChange={(e) => handleChange("native_language", e.target.value)}>
                <option value="">선택</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* 배우고 싶은 언어 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">배우고 싶은 언어</label>
            <select className="input-field" value={form.learning_language} onChange={(e) => handleChange("learning_language", e.target.value)}>
              <option value="">선택</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* 관심사 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">관심사</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    form.interests.includes(interest)
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* 자기소개 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">자기소개</label>
            <textarea
              rows={3}
              className="input-field resize-none"
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="간단히 자신을 소개해 주세요 (언어 수준: 초급/중급/고급 포함 가능)"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary w-full py-3"
          >
            {uploading ? "사진 업로드 중..." : loading ? "저장 중..." : "프로필 저장"}
          </button>
        </form>
      </div>
    </div>
  );
}
