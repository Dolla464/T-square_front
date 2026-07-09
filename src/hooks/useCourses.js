import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { fetchUserCourses, fetchUserCategories } from "../api/courses";
import { cache } from "../utils/cache";

export const useCourses = (type = "sub") => {
  const cacheKey = `initial_courses_data_${type}`;
  const [courses, setCourses] = useState(() => {
    const cached = cache.get(cacheKey);
    return cached ? cached.courses : [];
  });
  const [categories, setCategories] = useState(() => {
    const cached = cache.get(cacheKey);
    return cached ? cached.categories : [];
  });
  const [pagination, setPagination] = useState(() => {
    const cached = cache.get(cacheKey);
    return cached ? cached.pagination : {
      currentPage: 1,
      lastPage: 1,
      total: 0,
    };
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

  const setInitialData = useCallback(({ courses: initialCourses, categories: initialCategories, pagination: initialPagination }) => {
    setCourses(Array.isArray(initialCourses) ? initialCourses : []);
    setCategories(Array.isArray(initialCategories) ? initialCategories : []);
    setPagination(initialPagination ?? {
      currentPage: 1,
      lastPage: 1,
      total: 0,
    });
    setLoading(false);
  }, []);

  // فانكشن تجيب الداتا لأول مرة (كورسات وأقسام)
  const loadInitialData = useCallback(async (
    params = { per_page: 6, type },
  ) => {
    const activeType = params.type || type;
    const activeCacheKey = `initial_courses_data_${activeType}`;
    const cached = cache.get(activeCacheKey);
    const isStale = cache.isStale(activeCacheKey, 10000); // 10 seconds TTL for quick updates

    // If cache exists and is not stale, skip the request entirely
    if (cached && !isStale) {
      setLoading(false);
      return;
    }

    // If cache already exists, skip loaders to avoid visual layouts shifting
    if (cached) {
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const [catRes, courseRes] = await Promise.all([
        fetchUserCategories({ type: params.type || activeType }),
        fetchUserCourses(params),
      ]);
      const fetchedCategories = Array.isArray(catRes.data.data) ? catRes.data.data : [];
      const fetchedCourses = Array.isArray(courseRes.data.data) ? courseRes.data.data : [];
      const meta = courseRes.data.meta;
      const fetchedPagination = {
        currentPage: meta.current_page,
        lastPage: meta.last_page,
        total: meta.total,
      };

      setCategories(fetchedCategories);
      setCourses(fetchedCourses);
      setPagination(fetchedPagination);

      // Save initial page dataset to cache
      cache.set(activeCacheKey, {
        courses: fetchedCourses,
        categories: fetchedCategories,
        pagination: fetchedPagination,
      });
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // فانكشن للفلترة فقط
  const filterCourses = useCallback(async (params) => {
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
  }, []);

  return { courses, categories, loading, pagination, loadInitialData, filterCourses, setInitialData };
};