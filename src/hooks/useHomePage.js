import { useEffect, useState } from "react";
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

const normalizeHomeData = (data) => ({
  hero: {
    image: data?.hero?.image ?? null,
    settings: { ...emptyState.hero.settings, ...(data?.hero?.settings ?? {}) },
  },
  about: { images: toList(data?.about?.images) },
  discovery: { images: toList(data?.discovery?.images) },
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

export const useHomePage = () => {
  const [data, setData] = useState(() => {
    const cached = cache.get(CACHE_KEY);
    return cached ? normalizeHomeData(cached) : emptyState;
  });
  const [loading, setLoading] = useState(() => !cache.get(CACHE_KEY));
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = cache.get(CACHE_KEY);
    const isStale = cache.isStale(CACHE_KEY, CACHE_TTL_MS);

    if (cached && !isStale) {
      setLoading(false);
      return;
    }

    const fetchHomeData = async () => {
      try {
        if (!cached) setLoading(true);
        const res = await getHomePageData();
        const payload = normalizeHomeData(res?.data?.data);

        const heroImage = payload.hero.image;
        if (heroImage && !document.querySelector("link[data-hero-preload]")) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "image";
          link.href = heroImage;
          link.setAttribute("data-hero-preload", "true");
          document.head.appendChild(link);
        }

        cache.set(CACHE_KEY, payload);
        setData(payload);
      } catch (err) {
        setError(err);
        console.error("Error fetching home page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return { ...data, loading, error };
};
