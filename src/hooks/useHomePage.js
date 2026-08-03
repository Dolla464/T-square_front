import { useEffect, useState, useCallback } from "react";
import { getHomePageData } from "../services/home";
import { cache } from "../utils/cache";

const CACHE_KEY = "home_page_data";
const CACHE_TTL_MS = 15 * 60 * 1000;

const emptyState = {
  hero: {
    image: null,
    settings: {
      hero_title_en: "",
      hero_title_ar: "",
      hero_title_highlight_en: "",
      hero_title_highlight_ar: "",
      hero_subtitle_en: "",
      hero_subtitle_ar: "",
    },
  },
  about: { images: [] },
  discovery: { images: [] },
  courses: {
    categories: [],
    items: [],
    meta: { current_page: 1, last_page: 1, total: 0 },
  },
  testimonials: [],
};

const toList = (value) => (Array.isArray(value) ? value : []);

const resolveMediaUrl = (item) => {
  if (!item || typeof item !== "string") return null;

  const path = item.trim();
  if (!path) return null;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  let apiURL = import.meta.env.VITE_API_URL || window.APP_CONFIG?.API_URL || "";
  apiURL = apiURL.replace(/\/api\/?$/, "");
  const cleanBase = apiURL.endsWith("/") ? apiURL.slice(0, -1) : apiURL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!cleanPath.startsWith("/storage") && !cleanPath.startsWith("/public")) {
    return `${cleanBase}/storage${cleanPath}`;
  }

  return `${cleanBase}${cleanPath}`;
};

const normalizeHomeData = (data) => ({
  hero: {
    image: resolveMediaUrl(data?.hero?.image),
    settings: { ...emptyState.hero.settings, ...(data?.hero?.settings ?? {}) },
  },
  about: {
    images: toList(data?.about?.images)
      .map((item) => resolveMediaUrl(item))
      .filter(Boolean),
  },
  discovery: {
    images: toList(data?.discovery?.images)
      .map((item) => resolveMediaUrl(item))
      .filter(Boolean),
  },
  courses: {
    categories: toList(data?.courses?.categories),
    items: toList(data?.courses?.items),
    meta: {
      current_page: data?.courses?.meta?.current_page ?? 1,
      last_page: data?.courses?.meta?.last_page ?? 1,
      total: data?.courses?.meta?.total ?? 0,
    },
  },
  testimonials: toList(data?.testimonials),
});

const preloadHeroImage = (heroImage) => {
  if (!heroImage) return;

  const existing = document.querySelector("link[data-hero-preload]");
  if (existing) {
    if (existing.getAttribute("href") === heroImage) return;
    existing.remove();
  }

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = heroImage;
  link.setAttribute("data-hero-preload", "true");
  document.head.appendChild(link);
};

const cacheHasUsableHero = (cached) => Boolean(cached?.hero?.image);

export const clearHomePageCache = () => {
  cache.clear(CACHE_KEY);
};

export const useHomePage = () => {
  const [data, setData] = useState(() => {
    const cached = cache.get(CACHE_KEY);
    return cached ? normalizeHomeData(cached) : emptyState;
  });
  const [loading, setLoading] = useState(() => !cache.get(CACHE_KEY));
  const [error, setError] = useState(null);

  const fetchHomeData = useCallback(async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const res = await getHomePageData();
      const payload = normalizeHomeData(res?.data?.data);

      preloadHeroImage(payload.hero.image);
      cache.set(CACHE_KEY, payload);
      setData(payload);
      setError(null);
    } catch (err) {
      setError(err);
      console.error("Error fetching home page data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = cache.get(CACHE_KEY);
    const isStale = cache.isStale(CACHE_KEY, CACHE_TTL_MS);

    if (cached && !isStale) {
      setLoading(false);
      if (!cacheHasUsableHero(cached)) {
        fetchHomeData();
      }
      return;
    }

    fetchHomeData({ showLoading: !cached });
  }, [fetchHomeData]);

  useEffect(() => {
    const onFocus = () => {
      if (cache.isStale(CACHE_KEY, CACHE_TTL_MS)) {
        fetchHomeData();
      }
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchHomeData]);

  return { ...data, loading, error, refetchHomeData: fetchHomeData };
};
