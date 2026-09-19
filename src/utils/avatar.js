const DEFAULT_AVATAR_MARKERS = [
  "default-student.png",
  "default-instructor.png",
  "default_avatar",
];

export function getProfileDisplayName(user, userProfile) {
  if (user?.role === "student") {
    return userProfile?.student?.full_name || user?.name || "";
  }

  if (user?.role === "instructor") {
    return userProfile?.instructor?.full_name || user?.name || "";
  }

  return user?.name || "";
}

export function getProfileAvatarUrl(user, userProfile) {
  if (user?.role === "student") {
    return userProfile?.student?.avatar || null;
  }

  if (user?.role === "instructor") {
    return userProfile?.instructor?.avatar || null;
  }

  return null;
}

export function isDefaultAvatarUrl(url) {
  if (!url) return true;

  return DEFAULT_AVATAR_MARKERS.some((marker) => url.includes(marker));
}

export function shouldShowAvatarInitials(avatarUrl, imageError = false) {
  return isDefaultAvatarUrl(avatarUrl) || imageError;
}

export function resolveAvatarUrl(path) {
  if (!path) return null;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  let apiURL = import.meta.env.VITE_API_URL || "";
  apiURL = apiURL.replace(/\/api\/?$/, "");
  const cleanBase = apiURL.endsWith("/") ? apiURL.slice(0, -1) : apiURL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!cleanPath.startsWith("/storage") && !cleanPath.startsWith("/public")) {
    return `${cleanBase}/storage${cleanPath}`;
  }

  return `${cleanBase}${cleanPath}`;
}

export function getNameInitials(name, fallback = "US") {
  if (typeof name !== "string" || !name.trim()) {
    return fallback;
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function hasRealAvatar(avatarUrl) {
  return Boolean(avatarUrl) && !isDefaultAvatarUrl(avatarUrl);
}
