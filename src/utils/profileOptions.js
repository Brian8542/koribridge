export const CONVERSATION_GOALS = [
  { value: "serious_learning", label: "진지한 학습" },
  { value: "casual_chat", label: "가벼운 대화" },
  { value: "culture_exchange", label: "문화 교류" },
  { value: "travel_friend", label: "여행/현지 친구" },
];

export const COMMUNICATION_STYLES = [
  { value: "text_first", label: "텍스트 먼저" },
  { value: "voice_friendly", label: "음성 대화 환영" },
  { value: "correction_focused", label: "교정 중심" },
  { value: "slow_and_kind", label: "천천히 친절하게" },
];

export function getProfileOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || "";
}
