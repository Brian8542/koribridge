export const INTERESTS = [
  "K-pop", "한국 음식", "여행", "드라마", "언어 교환", "게임", "영화", "스포츠",
  "음악", "독서", "요리", "패션", "사진", "카페", "애니메이션", "댄스",
  "운동", "기술/IT", "그림/예술", "역사/문화",
];

export const MAX_INTERESTS = 10;

export const INTEREST_LABELS_EN = {
  "K-pop": "K-pop", "한국 음식": "Korean Food", "여행": "Travel",
  "드라마": "K-Drama", "언어 교환": "Language Exchange", "게임": "Gaming",
  "영화": "Movies", "스포츠": "Sports", "음악": "Music", "독서": "Reading",
  "요리": "Cooking", "패션": "Fashion", "사진": "Photography", "카페": "Café",
  "애니메이션": "Anime", "댄스": "Dance", "운동": "Fitness",
  "기술/IT": "Tech/IT", "그림/예술": "Art", "역사/문화": "History & Culture",
};

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
