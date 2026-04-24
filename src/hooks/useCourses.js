import { useState } from "react";
import { fetchUserCourses, fetchUserCategories } from "../api/courses";

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // فانكشن تجيب الداتا لأول مرة (كورسات وأقسام)
  const loadInitialData = async (
    params = { per_page: 6, type: "sub" },
  ) => {
    setLoading(true);
    try {
      const [catRes, courseRes] = await Promise.all([
        fetchUserCategories({ type: params.type }),
        fetchUserCourses(params),
      ]);
      setCategories(catRes.data.data);
      setCourses(courseRes.data.data);
      const meta = courseRes.data.meta;
      setPagination({
        currentPage: meta.current_page,
        lastPage: meta.last_page,
        total: meta.total,
      });
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  // فانكشن للفلترة فقط
  const filterCourses = async (params) => {
    setLoading(true);
    try {
      const res = await fetchUserCourses(params);
      setCourses(res.data.data);
      const meta = res.data.meta;
      setPagination({
        currentPage: meta.current_page,
        lastPage: meta.last_page,
        total: meta.total,
      });
    } catch (error) {
      console.error("Filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { courses, categories, loading, pagination, loadInitialData, filterCourses };
};