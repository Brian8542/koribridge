import { getMatchPercentage, getMatchScore } from "./matching";

const baseProfile = {
  native_language: "한국어",
  learning_language: "영어",
  interests: [],
};

describe("getMatchScore", () => {
  it("returns zero score when either profile is missing", () => {
    expect(getMatchScore(null, baseProfile)).toEqual({
      score: 0,
      percentage: 0,
      reason: "",
      reasons: [],
    });
  });

  it("scores a strong mutual language exchange match with reasons", () => {
    const other = {
      native_language: "영어",
      learning_language: "한국어",
      interests: ["K-pop", "여행"],
      conversation_goal: "culture_exchange",
      communication_style: "text_first",
      opening_question: "가장 좋아하는 한국 음식은 뭐예요?",
    };
    const me = {
      ...baseProfile,
      interests: ["K-pop", "영화"],
      conversation_goal: "culture_exchange",
      communication_style: "text_first",
    };

    const match = getMatchScore(me, other);

    expect(match.percentage).toBe(100);
    expect(match.score).toBe(match.percentage);
    expect(match.reason).toBe("서로의 모국어를 배우고 싶어하는 최고의 파트너!");
    expect(match.reasons).toEqual(
      expect.arrayContaining([
        "서로의 모국어를 배우고 싶어하는 최고의 파트너!",
        "공통 관심사: K-pop",
        "대화 목적이 잘 맞아요",
        "선호하는 대화 방식이 비슷해요",
        "첫 대화 질문이 준비되어 있어요",
      ])
    );
  });

  it("caps scores at 100 and keeps getMatchPercentage compatible", () => {
    const other = {
      native_language: "영어",
      learning_language: "한국어",
      interests: ["K-pop", "여행", "드라마"],
      conversation_goal: "culture_exchange",
      communication_style: "text_first",
      opening_question: "안녕하세요?",
      last_seen_at: new Date().toISOString(),
    };
    const me = {
      ...baseProfile,
      interests: ["K-pop", "여행", "드라마"],
      conversation_goal: "culture_exchange",
      communication_style: "text_first",
    };

    expect(getMatchScore(me, other).percentage).toBe(100);
    expect(getMatchPercentage(me, other)).toBe(100);
  });
});
