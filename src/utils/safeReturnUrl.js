export function safeReturnUrl(url) {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return null;
}
