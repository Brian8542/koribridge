export function getMatchScore(me, other) {
  if (!me || !other) return { score: 0, percentage: 0, reason: "" };
  let score = 20;
  const reasons = [];

  if (me.learning_language === other.native_language) {
    score += 40;
    reasons.push(`${other.native_language} 원어민`);
  }
  if (me.native_language === other.learning_language) {
    score += 20;
    reasons.push(`나의 ${me.native_language}를 배우고 싶어함`);
  }

  const commonInterests = (me.interests || []).filter((i) => (other.interests || []).includes(i));
  score += Math.min(commonInterests.length * 10, 20);
  if (commonInterests.length > 0) reasons.push(`공통 관심사: ${commonInterests[0]}`);

  return { score, percentage: Math.min(score, 100), reason: reasons[0] || "관심사가 비슷해요" };
}

export function getMatchPercentage(me, other) {
  return getMatchScore(me, other).percentage;
}
