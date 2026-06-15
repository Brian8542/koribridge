export const AVATAR_GRADIENTS = [
  "from-red-500 to-rose-500",
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-fuchsia-600",
  "from-indigo-500 to-blue-600",
  "from-green-500 to-emerald-600",
  "from-yellow-400 to-amber-500",
  "from-sky-500 to-blue-600",
  "from-rose-600 to-pink-500",
  "from-orange-500 to-red-500",
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
