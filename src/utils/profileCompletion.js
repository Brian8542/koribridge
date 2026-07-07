export function getProfileCompletion(profile = {}) {
  const hasAvatar = Boolean(profile.avatar_url);
  const hasBasics = Boolean(
    profile.display_name?.trim() &&
    profile.nationality &&
    profile.native_language &&
    profile.learning_language &&
    profile.language_level
  );
  const hasConversationFit = Boolean(profile.conversation_goal && profile.communication_style);
  const hasOpeningQuestion = Boolean(profile.opening_question?.trim());
  const hasInterests = (profile.interests || []).length >= 2;
  const hasBio = (profile.bio || "").trim().length >= 30;
  const hasPrompts = (profile.prompts || []).filter((p) => p?.answer?.trim()).length >= 1;

  const items = [
    { key: "avatar", label: "프로필 사진 또는 아바타", done: hasAvatar },
    { key: "basics", label: "국적과 언어 정보", done: hasBasics },
    { key: "conversation", label: "대화 목적과 방식", done: hasConversationFit },
    { key: "opening", label: "첫 대화 질문", done: hasOpeningQuestion },
    { key: "interests", label: "관심사 2개 이상", done: hasInterests },
    { key: "bio", label: "자기소개 30자 이상", done: hasBio },
    { key: "prompts", label: "나의 이야기 1개 이상", done: hasPrompts },
  ];

  const completed = items.filter((item) => item.done).length;
  const percentage = Math.round((completed / items.length) * 100);

  return {
    completed,
    total: items.length,
    percentage,
    items,
    nextItem: items.find((item) => !item.done) || null,
  };
}
