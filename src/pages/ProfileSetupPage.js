import React, { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../hooks/useLocale";
import { AVATAR_GRADIENTS, getAvatarGradient } from "../utils/avatarUtils";
import { COMMUNICATION_STYLES, CONVERSATION_GOALS } from "../utils/profileOptions";

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어", "일본어", "기타",
];

const NATIONALITIES = [
  "한국", "미국", "영국", "캐나다", "호주", "베트남", "태국", "필리핀",
  "인도네시아", "말레이시아", "카자흐스탄", "우즈베키스탄", "중국", "일본", "기타",
];

const INTERESTS = ["K-pop", "한국 음식", "여행", "드라마", "언어 교환", "게임", "영화", "스포츠"];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfileSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, levelLabel } = useLocale();

  const [form, setForm] = useState({
    display_name: "",
    nationality: "",
    native_language: "",
    learning_language: "",
    language_level: "초급",
    bio: "",
    avatar_url: "",
    interests: [],
    conversation_goal: "culture_exchange",
    communication_style: "text_first",
    opening_question: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

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
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(t.errAvatarType);
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t.errAvatarSize);
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, avatar_url: "" }));
    setError("");
  };

  const handleGradientSelect = (idx) => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setForm((prev) => ({ ...prev, avatar_url: `gradient:${idx}` }));
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    if (!form.display_name.trim()) return setError(t.errName);
    if (form.display_name.trim().length > 50) return setError(t.errNameLen);
    if (!form.nationality) return setError(t.errNationality);
    if (!form.native_language) return setError(t.errNativeLang);
    if (!form.learning_language) return setError(t.errLearningLang);
    if (!form.language_level) return setError(t.errLangLevel);
    if (form.bio.length > 500) return setError(t.errBioLen);
    if (form.opening_question.length > 140) return setError("첫 질문은 140자 이하로 입력해 주세요.");

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
        language_level: form.language_level,
        bio: form.bio.trim(),
        avatar_url: avatar_url || "",
        interests: form.interests,
        conversation_goal: form.conversation_goal,
        communication_style: form.communication_style,
        opening_question: form.opening_question.trim(),
        is_verified: !!user.email_confirmed_at,
      });

      if (upsertError) throw upsertError;
      navigate("/home", { replace: true });
    } catch {
      setError(t.setupError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>KoriBridge - {t.setupTitle}</title></Helmet>

      <div className="relative bg-gradient-to-br from-red-600 via-rose-500 to-pink-400 pt-12 pb-10 px-6 text-white text-center overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-xl font-extrabold">K</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t.setupTitle}</h1>
          <p className="text-white/75 text-sm mt-1.5">{t.setupDesc}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="card flex flex-col items-center gap-4 py-8">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="preview" className="w-32 h-32 rounded-3xl object-cover ring-4 ring-red-200 shadow-xl" />
              ) : form.avatar_url.startsWith("gradient:") ? (
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${getAvatarGradient(form.avatar_url)} flex items-center justify-center text-6xl font-black text-white shadow-xl`}>
                  {form.display_name?.[0]?.toUpperCase() || "?"}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center shadow-lg">
                  <span className="text-4xl opacity-60">📷</span>
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center cursor-pointer shadow-xl border-2 border-white">
                <span className="text-white text-lg leading-none font-bold">+</span>
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">{t.avatarLabel}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.avatarLimit}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: 288 }}>
              {AVATAR_GRADIENTS.map((gradient, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGradientSelect(idx)}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0 transition-all duration-150 ${
                    form.avatar_url === `gradient:${idx}` && !avatarPreview
                      ? "ring-2 ring-offset-2 ring-red-500 scale-110 shadow-md"
                      : "opacity-70 hover:opacity-100 hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.nickname}</label>
              <input
                type="text"
                className="input-field"
                value={form.display_name}
                maxLength={50}
                onChange={(e) => handleChange("display_name", e.target.value)}
                placeholder={t.nickname}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.nationality}</label>
                <select className="input-field" value={form.nationality} onChange={(e) => handleChange("nationality", e.target.value)}>
                  <option value="">{t.select}</option>
                  {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.nativeLanguage}</label>
                <select className="input-field" value={form.native_language} onChange={(e) => handleChange("native_language", e.target.value)}>
                  <option value="">{t.select}</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.learningLanguage}</label>
              <select className="input-field" value={form.learning_language} onChange={(e) => handleChange("learning_language", e.target.value)}>
                <option value="">{t.select}</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{t.languageLevel}</label>
              <div className="flex gap-2">
                {["초급", "중급", "고급"].map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => handleChange("language_level", level)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                      form.language_level === level
                        ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {levelLabel(level)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">대화 목적</label>
              <div className="grid grid-cols-2 gap-2">
                {CONVERSATION_GOALS.map((goal) => (
                  <button
                    type="button"
                    key={goal.value}
                    onClick={() => handleChange("conversation_goal", goal.value)}
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                      form.conversation_goal === goal.value
                        ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">선호 대화 방식</label>
              <div className="grid grid-cols-2 gap-2">
                {COMMUNICATION_STYLES.map((style) => (
                  <button
                    type="button"
                    key={style.value}
                    onClick={() => handleChange("communication_style", style.value)}
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                      form.communication_style === style.value
                        ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-gray-700">첫 대화 질문</label>
                <span className={`text-xs ${form.opening_question.length > 120 ? "text-red-500" : "text-gray-400"}`}>
                  {form.opening_question.length}/140
                </span>
              </div>
              <input
                type="text"
                className="input-field"
                value={form.opening_question}
                maxLength={140}
                onChange={(e) => handleChange("opening_question", e.target.value)}
                placeholder="예: 가장 좋아하는 한국 음식은 뭐예요?"
              />
            </div>
          </div>

          <div className="card">
            <label className="block text-sm font-bold text-gray-700 mb-3">{t.interests}</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 ${
                    form.interests.includes(interest)
                      ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-gray-700">{t.bio}</label>
              <span className={`text-xs ${form.bio.length > 450 ? "text-red-500" : "text-gray-400"}`}>
                {form.bio.length}/500
              </span>
            </div>
            <textarea
              rows={3}
              className="input-field resize-none"
              value={form.bio}
              maxLength={500}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder={t.bioSetupPlaceholder}
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
            className="btn-primary w-full py-3.5 text-base"
          >
            {uploading ? t.avatarUploading : loading ? t.saving : t.saveProfileBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
