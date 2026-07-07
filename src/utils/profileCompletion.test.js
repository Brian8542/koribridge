import { getProfileCompletion } from "./profileCompletion";

describe("getProfileCompletion", () => {
  it("starts empty profiles with zero completed items", () => {
    const completion = getProfileCompletion();

    expect(completion.completed).toBe(0);
    expect(completion.total).toBe(7);
    expect(completion.percentage).toBe(0);
    expect(completion.nextItem.key).toBe("avatar");
  });

  it("marks a complete profile as 100 percent complete", () => {
    const completion = getProfileCompletion({
      display_name: "Mina",
      nationality: "한국",
      native_language: "한국어",
      learning_language: "영어",
      language_level: "중급",
      avatar_url: "gradient:1",
      conversation_goal: "culture_exchange",
      communication_style: "text_first",
      opening_question: "오늘 가장 기억에 남는 일은 뭐예요?",
      interests: ["K-pop", "여행"],
      bio: "한국어와 영어로 자연스럽게 대화하고 문화를 나누고 싶어요.",
      prompts: [{ id: "why_learning", answer: "K-드라마를 자막 없이 보고 싶어서요." }],
    });

    expect(completion.completed).toBe(7);
    expect(completion.percentage).toBe(100);
    expect(completion.nextItem).toBeNull();
    expect(completion.items.every((item) => item.done)).toBe(true);
  });

  it("requires at least two interests, a meaningful bio, and a prompt", () => {
    const completion = getProfileCompletion({
      display_name: "Alex",
      nationality: "미국",
      native_language: "영어",
      learning_language: "한국어",
      language_level: "초급",
      avatar_url: "https://example.com/avatar.png",
      conversation_goal: "serious_learning",
      communication_style: "slow_and_kind",
      opening_question: "좋아하는 표현은?",
      interests: ["영화"],
      bio: "짧은 소개",
    });

    const interestItem = completion.items.find((item) => item.key === "interests");
    const bioItem = completion.items.find((item) => item.key === "bio");
    const promptItem = completion.items.find((item) => item.key === "prompts");

    expect(completion.completed).toBe(4);
    expect(completion.percentage).toBe(57);
    expect(interestItem.done).toBe(false);
    expect(bioItem.done).toBe(false);
    expect(promptItem.done).toBe(false);
    expect(completion.nextItem.key).toBe("interests");
  });
});
