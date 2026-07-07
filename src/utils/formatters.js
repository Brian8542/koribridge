export function formatTime(ts) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
}

export function formatRelativeTime(timestamp, locale = "ko") {
  if (!timestamp) return locale === "ko" ? "활동 정보 없음" : "No activity info";
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === "ko") {
    if (minutes < 1) return "방금 전 활동";
    if (minutes < 60) return `${minutes}분 전 활동`;
    if (hours < 24) return `${hours}시간 전 활동`;
    return `${days}일 전 활동`;
  }
  if (minutes < 1) return "Active just now";
  if (minutes < 60) return `Active ${minutes}m ago`;
  if (hours < 24) return `Active ${hours}h ago`;
  return `Active ${days}d ago`;
}

export function formatTimeAgo(timestamp, locale = "ko") {
  if (!timestamp) return "";
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === "ko") {
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  }
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
