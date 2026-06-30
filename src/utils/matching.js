export function getMatchScore(me, other) {
  if (!me || !other) return { score: 0, percentage: 0, reason: "", reasons: [] };
  
  // 기본 점수 20점 (Fairness를 위해 모든 사용자 동일 시작)
  let score = 20; 
  const reasons = [];

  // 1. 상호 언어 교환 적합도 (Mutual Matching)
  const meLearnsOtherNative = me.learning_language === other.native_language;
  const otherLearnsMeNative = other.learning_language === me.native_language;

  if (meLearnsOtherNative && otherLearnsMeNative) {
    score += 50; // 완벽한 매칭
    reasons.push("서로의 모국어를 배우고 싶어하는 최고의 파트너!");
  } else if (meLearnsOtherNative) {
    score += 30;
    reasons.push(`${other.native_language} 원어민이에요`);
  } else if (otherLearnsMeNative) {
    score += 20;
    reasons.push(`나의 ${me.native_language}를 배우고 싶어해요`);
  }

  // 2. 공통 관심사 (가중치 적용)
  const commonInterests = (me.interests || []).filter((i) => (other.interests || []).includes(i));
  if (commonInterests.length > 0) {
    score += Math.min(commonInterests.length * 10, 20);
    reasons.push(`공통 관심사: ${commonInterests[0]}`);
  }

  // 3. 대화 목적과 방식이 맞으면 첫 대화 전환율이 높아짐
  if (me.conversation_goal && me.conversation_goal === other.conversation_goal) {
    score += 10;
    reasons.push("대화 목적이 잘 맞아요");
  }

  if (me.communication_style && me.communication_style === other.communication_style) {
    score += 8;
    reasons.push("선호하는 대화 방식이 비슷해요");
  }

  if (other.opening_question) {
    score += 4;
    reasons.push("첫 대화 질문이 준비되어 있어요");
  }

  // 4. 활동 시간대 (최근 24시간 이내 접속 시 가점)
  if (other.last_seen_at) {
    const lastSeen = new Date(other.last_seen_at);
    const isRecent = (new Date() - lastSeen) < 24 * 60 * 60 * 1000;
    if (isRecent) {
      score += 10;
      reasons.push("최근에 활동했어요");
    }
  }

  // 5. 추천글 신뢰 지표 (국적/성별 무관, 추천글 수·별점만 반영)
  const refCount = other.reference_count ?? 0;
  const avgRating = other.avg_rating ?? 0;
  if (refCount >= 5 && avgRating >= 4) {
    score += 8;
    reasons.push("추천글이 많은 파트너예요");
  } else if (refCount >= 2 && avgRating >= 3.5) {
    score += 5;
    reasons.push("추천글이 있어요");
  } else if (refCount >= 1) {
    score += 3;
  }

  const percentage = Math.min(score, 100);
  const fallbackReason = "관심사가 비슷해요";
  return {
    score: percentage,
    percentage,
    reason: reasons[0] || fallbackReason,
    reasons: reasons.length > 0 ? reasons : [fallbackReason],
  };
}

export function getMatchPercentage(me, other) {
  return getMatchScore(me, other).percentage;
}
