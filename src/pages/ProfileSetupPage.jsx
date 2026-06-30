import React, { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../hooks/useLocale";
import { AVATAR_GRADIENTS, getAvatarGradient } from "../utils/avatarUtils";
import { COMMUNICATION_STYLES, CONVERSATION_GOALS, INTERESTS, MAX_INTERESTS } from "../utils/profileOptions";
import { getProfileCompletion } from "../utils/profileCompletion";
import ProfileCompletionCard from "../components/ProfileCompletionCard";

const LANGUAGES = [
  "한국어", "영어", "베트남어", "태국어", "필리핀어(타갈로그)",
  "인도네시아어", "말레이어", "카자흐어", "우즈베크어", "중국어", "일본어", "기타",
];

const NATIONALITIES = [
  "한국", "미국", "영국", "캐나다", "호주", "베트남", "태국", "필리핀",
  "인도네시아", "말레이시아", "카자흐스탄", "우즈베키스탄", "중국", "일본", "기타",
];

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
  const profileCompletion = useMemo(() => getProfileCompletion({
    ...form,
    avatar_url: avatarPreview ? "preview" : form.avatar_url,
  }), [form, avatarPreview]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest) => {
    setForm((prev) => {
      const has = prev.interests.includes(interest);
      if (!has && prev.interests.length >= MAX_INTERESTS) return prev;
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
    if (form.opening_question.length > 140) return setError(t.errOpeningQuestionLen);

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
    <div className="min-h-screen bg-[#f5f5f7]">
      <Helmet><title>KoriBridge - {t.setupTitle}</title></Helmet>

      <div className="bg-white border-b border-[#d2d2d7]/40 px-6 pt-12 pb-8 text-center">
        <div className="w-10 h-10 rounded-apple bg-primary-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-sm font-bold">K</span>
        </div>
        <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.025em]">{t.setupTitle}</h1>
        <p className="text-[#86868b] text-[14px] mt-1.5">{t.setupDesc}</p>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <ProfileCompletionCard completion={profileCompletion} />

          <div className="card flex flex-col items-center gap-4 py-8">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="preview" className="w-32 h-32 rounded-apple object-cover ring-4 ring-[#0071e3]/20 shadow-card" />
              ) : form.avatar_url.startsWith("gradient:") ? (
                <div className={`w-32 h-32 rounded-apple bg-gradient-to-br ${getAvatarGradient(form.avatar_url)} flex items-center justify-center text-6xl font-black text-white shadow-card`}>
                  {form.display_name?.[0]?.toUpperCase() || "?"}
                </div>
              ) : (
                <div className="w-32 h-32 rounded-apple bg-[#f5f5f7] border-2 border-dashed border-[#d2d2d7] flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#86868b]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#0071e3] hover:bg-[#0077ed] flex items-center justify-center cursor-pointer shadow-card border-2 border-white transition-colors">
                <span className="text-white text-lg leading-none font-bold">+</span>
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-[#1d1d1f]">{t.avatarLabel}</p>
              <p className="text-[12px] text-[#86868b] mt-0.5">{t.avatarLimit}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: 288 }}>
              {AVATAR_GRADIENTS.map((gradient, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGradientSelect(idx)}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex-shrink-0 transition-all duration-150 ${
                    form.avatar_url === `gradient:${idx}` && !avatarPreview
                      ? "ring-2 ring-offset-2 ring-[#0071e3] scale-110 shadow-md"
                      : "opacity-70 hover:opacity-100 hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">{t.nickname}</label>
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
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">{t.nationality}</label>
                <select className="input-field" value={form.nationality} onChange={(e) => handleChange("nationality", e.target.value)}>
                  <option value="">{t.select}</option>
                  {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">{t.nativeLanguage}</label>
                <select className="input-field" value={form.native_language} onChange={(e) => handleChange("native_language", e.target.value)}>
                  <option value="">{t.select}</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">{t.learningLanguage}</label>
              <select className="input-field" value={form.learning_language} onChange={(e) => handleChange("learning_language", e.target.value)}>
                <option value="">{t.select}</option>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">{t.languageLevel}</label>
              <div className="flex gap-2">
                {["초급", "중급", "고급"].map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => handleChange("language_level", level)}
                    className={`flex-1 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-150 ${
                      form.language_level === level
                        ? "bg-[#0071e3] text-white"
                        : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"
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
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-2">대화 목적</label>
              <div className="grid grid-cols-2 gap-2">
                {CONVERSATION_GOALS.map((goal) => (
                  <button
                    type="button"
                    key={goal.value}
                    onClick={() => handleChange("conversation_goal", goal.value)}
                    className={`rounded-full px-3 py-2.5 text-[13px] font-semibold transition-all ${
                      form.conversation_goal === goal.value
                        ? "bg-[#0071e3] text-white"
                        : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-2">선호 대화 방식</label>
              <div className="grid grid-cols-2 gap-2">
                {COMMUNICATION_STYLES.map((style) => (
                  <button
                    type="button"
                    key={style.value}
                    onClick={() => handleChange("communication_style", style.value)}
                    className={`rounded-full px-3 py-2.5 text-[13px] font-semibold transition-all ${
                      form.communication_style === style.value
                        ? "bg-[#0071e3] text-white"
                        : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-[#1d1d1f]">첫 대화 질문</label>
                <span className={`text-[12px] ${form.opening_question.length > 120 ? "text-[#0071e3]" : "text-[#86868b]"}`}>
                  {form.opening_question.length}/140
                </span>
              </div>
              <input
                type="text"
                className="input-field"
                value={form.opening_question}
                maxLength={140}
                onChange={(e) => handleChange("opening_question", e.target.value)}
                placeholder={t.openingQuestionPlaceholder}
              />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-[13px] font-semibold text-[#1d1d1f]">{t.interests}</label>
              <span className={`text-[12px] font-semibold ${form.interests.length >= MAX_INTERESTS ? "text-[#0071e3]" : "text-[#86868b]"}`}>
                {form.interests.length}/{MAX_INTERESTS}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 ${
                    form.interests.includes(interest)
                      ? "bg-[#0071e3] text-white"
                      : form.interests.length >= MAX_INTERESTS
                        ? "bg-[#f5f5f7] text-[#d2d2d7] cursor-not-allowed"
                        : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-semibold text-[#1d1d1f]">{t.bio}</label>
              <span className={`text-[12px] ${form.bio.length > 450 ? "text-[#0071e3]" : "text-[#86868b]"}`}>
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
            <div className="rounded-apple border border-[#ff3b30]/20 bg-[#fff2f2] px-4 py-3 text-[13px] text-[#ff3b30]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary w-full py-3.5 text-[15px]"
          >
            {uploading ? t.avatarUploading : loading ? t.saving : t.saveProfileBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
