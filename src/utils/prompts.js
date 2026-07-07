export const PROFILE_PROMPTS = [
  { id: "why_learning",     ko: "내가 이 언어를 배우는 진짜 이유는",           en: "The real reason I'm learning this language is" },
  { id: "place_together",   ko: "언젠가 파트너와 같이 가보고 싶은 곳은",       en: "A place I'd love to visit with a partner someday" },
  { id: "makes_me_laugh",   ko: "나를 웃게 만드는 것은",                       en: "Something that always makes me laugh" },
  { id: "show_my_country",  ko: "우리나라에서 꼭 보여주고 싶은 것은",           en: "One thing from my country I'd love to show you" },
  { id: "perfect_weekend",  ko: "나의 완벽한 주말은",                          en: "My perfect weekend looks like" },
  { id: "food_i_miss",      ko: "요즘 가장 먹고 싶은 음식은",                  en: "The food I'm craving these days" },
  { id: "language_moment",  ko: "언어 공부하다 생긴 웃픈 에피소드는",          en: "A funny language-learning fail of mine" },
  { id: "talk_hours",       ko: "밤새 이야기할 수 있는 주제는",                en: "A topic I could talk about all night" },
  { id: "small_joy",        ko: "요즘 나의 소소한 행복은",                     en: "A small thing making me happy lately" },
  { id: "teach_you",        ko: "내가 알려줄 수 있는 우리말 표현 하나는",       en: "A phrase from my language I can teach you" },
  { id: "dream_conversation", ko: "언젠가 이 언어로 꼭 해보고 싶은 것은",       en: "Something I dream of doing in this language" },
  { id: "first_impression", ko: "사람들이 나에 대해 오해하는 것은",             en: "Something people get wrong about me" },
];

export const MAX_PROMPTS = 3;
export const MAX_PROMPT_ANSWER = 300;

export function getPromptLabel(promptId, locale = "ko") {
  const prompt = PROFILE_PROMPTS.find((p) => p.id === promptId);
  if (!prompt) return "";
  return locale === "ko" ? prompt.ko : prompt.en;
}

export function normalizePrompts(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p) => p && typeof p.id === "string" && typeof p.answer === "string" && p.answer.trim())
    .slice(0, MAX_PROMPTS)
    .map((p) => ({ id: p.id, answer: p.answer.trim().slice(0, MAX_PROMPT_ANSWER) }));
}

export function getConversationStartersFromProfile(partner, locale = "ko") {
  const starters = [];
  const name = partner?.display_name || "";
  const prompts = normalizePrompts(partner?.prompts);

  if (prompts.length > 0) {
    const p = prompts[0];
    const label = getPromptLabel(p.id, locale);
    const snippet = p.answer.length > 40 ? `${p.answer.slice(0, 40)}…` : p.answer;
    starters.push(
      locale === "ko"
        ? `"${label}"에 "${snippet}"라고 쓰셨네요! 더 자세히 듣고 싶어요.`
        : `You wrote "${snippet}" for "${label}" — I'd love to hear more!`
    );
  }

  const myInterests = partner?.interests || [];
  if (myInterests.length > 0) {
    starters.push(
      locale === "ko"
        ? `${myInterests[0]} 좋아하시는군요! 저도 관심 많아요. 어떻게 시작하게 됐어요?`
        : `You're into ${myInterests[0]}? Me too! How did you get started?`
    );
  }

  if (partner?.opening_question) {
    starters.push(partner.opening_question);
  }

  if (starters.length < 2) {
    starters.push(
      locale === "ko"
        ? `안녕하세요 ${name}님! 서로의 언어를 편하게 가르쳐주는 파트너가 되면 좋겠어요.`
        : `Hi ${name}! I'd love to be language partners and help each other out.`
    );
  }
  if (starters.length < 3) {
    starters.push(
      locale === "ko"
        ? "요즘 자주 쓰는 표현 하나만 알려주실래요? 저도 하나 알려드릴게요!"
        : "Teach me one phrase you use a lot these days — I'll teach you one back!"
    );
  }

  return starters.slice(0, 3);
}
