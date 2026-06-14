export function getLanguageLevel(profile) {
  const text = (profile.bio || "").toLowerCase();
  if (text.includes("고급") || text.includes("advanced")) return "고급";
  if (text.includes("중급") || text.includes("intermediate")) return "중급";
  return "초급";
}
