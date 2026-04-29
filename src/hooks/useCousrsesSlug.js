import { useEffect, useState } from "react";
import { getCourseSlug } from "../services/coursesSlug";

export const useCourseSlug = (slug) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    const fetchCourse = async () => {
      try {
        setLoading(true);

        const res = await getCourseSlug(slug);
        if (res.data?.data?.course) {
          setCourseData(res.data.data.course);
        } else {
          setError("Invalid course data received.");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  return { courseData, loading, error };
};
