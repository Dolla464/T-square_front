import { useState, useCallback } from "react";
import { getCat as fetchCategories } from "../services/coursesServices";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchCategories();
      const data = response?.data || [];
      // console.log(" data : ", response);

      // API returns: { status, message, data: [...] }
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { categories, loading, getCategories };

};
