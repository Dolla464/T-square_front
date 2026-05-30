import { useEffect, useState } from "react";
import { getTestimonials } from "../services/testimonials";

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFromAPI = async () => {
      try {
        setLoading(true);
        const res = await getTestimonials();
        const data = res?.data?.data;
        setTestimonials(data || []);
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
