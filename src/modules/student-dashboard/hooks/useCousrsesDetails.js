import { useEffect, useState } from "react";
import { getCourseDetails } from "../services/dashboardService";

export const useCourseDetails = (courseId) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    const fetchCourse = async () => {
      try {
        setLoading(true);

        const res = await getCourseDetails(courseId);
        if (res.data?.data) {
          setCourseData(res.data.data);
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
  }, [courseId]);

  return { courseData, loading, error };
};
