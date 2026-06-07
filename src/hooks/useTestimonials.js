import { useEffect, useState } from "react";
import { getTestimonials } from "../services/testimonials";
import { cache } from "../utils/cache";

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState(() => {
    return cache.get("testimonials_data") || [];
  });
  const [loading, setLoading] = useState(() => {
    return !cache.get("testimonials_data");
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = cache.get("testimonials_data");
    const isStale = cache.isStale("testimonials_data", 120000);

    if (cached && !isStale) {
      setLoading(false);
      return;
    }

    const fetchFromAPI = async () => {
      try {
        if (!cached) setLoading(true);
        const res = await getTestimonials();
        const data = res?.data?.data || [];
        cache.set("testimonials_data", data);
        setTestimonials(data);
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
