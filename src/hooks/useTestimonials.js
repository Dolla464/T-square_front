import { useEffect, useState } from "react";
import { getTestimonials } from "../services/testimonials";
import { cache } from "../utils/cache";

const CACHE_KEY = "testimonials_featured_v3";
const LEGACY_CACHE_KEYS = [
  "testimonials_data",
  "testimonials_featured",
  "testimonials_featured_v2",
];

const toReviewList = (value) => {
  if (Array.isArray(value)) return value;
  return [];
};

const clearLegacyCache = () => {
  LEGACY_CACHE_KEYS.forEach((key) => cache.clear(key));
};

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState(() => {
    clearLegacyCache();
    const cached = cache.get(CACHE_KEY);
    return cached ? toReviewList(cached) : [];
  });
  const [loading, setLoading] = useState(() => !cache.get(CACHE_KEY));
  const [error, setError] = useState(null);

  useEffect(() => {
    clearLegacyCache();

    const cached = cache.get(CACHE_KEY);
    const isStale = cache.isStale(CACHE_KEY, 60000);

    if (cached && !isStale) {
      setTestimonials(toReviewList(cached));
      setLoading(false);
      return;
    }

    const fetchFromAPI = async () => {
      try {
        if (!cached) setLoading(true);
        const res = await getTestimonials();
        const list = toReviewList(res?.data?.data);
        cache.set(CACHE_KEY, list);
        setTestimonials(list);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFromAPI();
  }, []);

  return { testimonials, loading, error };
};
