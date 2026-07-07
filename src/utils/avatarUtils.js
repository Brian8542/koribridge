export const AVATAR_GRADIENTS = [
  "bg-[#4A1D3F]",
  "bg-[#E8604C]",
  "bg-[#5B8A72]",
  "bg-[#B0764A]",
  "bg-[#7D4E6E]",
  "bg-[#C4402E]",
  "bg-[#5C6E8A]",
  "bg-[#8A5A22]",
  "bg-[#40664F]",
  "bg-[#A9829C]",
  "bg-[#D9503C]",
  "bg-[#6E675F]",
];

export function isRealAvatar(url) {
  return !!(url && !url.startsWith("gradient:"));
}

export function getAvatarGradient(url, fallback) {
  if (url && url.startsWith("gradient:")) {
    const idx = parseInt(url.split(":")[1], 10);
    return AVATAR_GRADIENTS[Number.isFinite(idx) ? idx % AVATAR_GRADIENTS.length : 0];
  }
  if (fallback) {
    let code = 0;
    for (let i = 0; i < Math.min(fallback.length, 4); i++) code += fallback.charCodeAt(i);
    return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
  }
  return AVATAR_GRADIENTS[0];
}
