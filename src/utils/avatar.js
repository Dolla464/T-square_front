const DEFAULT_AVATAR_MARKERS = [
  "default-student.png",
  "default-instructor.png",
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
