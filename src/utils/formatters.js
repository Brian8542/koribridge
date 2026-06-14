export function formatTime(ts) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return "활동 정보 없음";
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "방금 전 활동";
  if (minutes < 60) return `${minutes}분 전 활동`;
  if (hours < 24) return `${hours}시간 전 활동`;
  return `${days}일 전 활동`;
}
