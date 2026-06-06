import { useState, useRef, useEffect } from "react";
import axios from "axios";
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
  const abortControllerRef = useRef(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const res = await fetchUserCourses(params, { signal: abortControllerRef.current.signal });
      setCourses(res.data.data);
      const meta = res.data.meta;
      setPagination({
        currentPage: meta.current_page,
        lastPage: meta.last_page,
        total: meta.total,
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message);
        return; // لا تغير حالة التحميل إذا تم إلغاء الطلب
      }
      console.error("Filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { courses, categories, loading, pagination, loadInitialData, filterCourses };
};