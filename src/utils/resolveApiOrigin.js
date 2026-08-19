export function resolveConfiguredApiUrl() {
  return (
    window.APP_CONFIG?.API_URL ||
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? null : "http://t-square-lms.test/api")
  );
}

export function resolveApiOrigin() {
  const configured = resolveConfiguredApiUrl();

  if (!configured) {
    throw new Error("VITE_API_URL is required in production builds.");
  }

  if (configured.startsWith("/")) {
    return window.location.origin;
  }

  return configured.replace(/\/api\/?$/, "");
}

export function resolveAxiosBaseUrl() {
  const configured = resolveConfiguredApiUrl();

  if (!configured) {
    throw new Error("VITE_API_URL is required in production builds.");
  }

  if (configured.startsWith("/")) {
    return configured.endsWith("/api")
      ? configured
      : `${configured.replace(/\/$/, "")}/api`;
  }

  return configured;
}

export function normalizeStorageUrl(url) {
  if (!url || typeof url !== "string") {
    return url;
  }

  const trimmed = url.trim();
  if (!trimmed || !import.meta.env.DEV) {
    return trimmed;
  }

  const proxyTarget = import.meta.env.VITE_DEV_API_PROXY;
  if (!proxyTarget) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const backend = new URL(proxyTarget);

    if (parsed.origin !== backend.origin) {
      return trimmed;
    }

    return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return trimmed;
  }
}

export function resolveMediaUrl(item) {
  if (!item || typeof item !== "string") {
    return null;
  }

  const path = item.trim();
  if (!path) {
    return null;
  }

  if (path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return normalizeStorageUrl(path);
  }

  const apiURL = resolveApiOrigin();
  const cleanBase = apiURL.endsWith("/") ? apiURL.slice(0, -1) : apiURL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!cleanPath.startsWith("/storage") && !cleanPath.startsWith("/public")) {
    return `${cleanBase}/storage${cleanPath}`;
  }

  return `${cleanBase}${cleanPath}`;
}
