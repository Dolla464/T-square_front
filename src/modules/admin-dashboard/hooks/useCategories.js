import { useState, useCallback } from "react";
import { getCategories as fetchCategories } from "../services/coursesServices";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchCategories();
      // API returns: { status, message, data: [...] }
      const data = response?.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { categories, loading, getCategories };
};
