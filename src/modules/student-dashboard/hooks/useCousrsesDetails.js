import { useEffect, useState } from "react";
import axios from "axios";
import { useForbidden } from "../../../contexts/ForbiddenContext";
import { getCourseDetails } from "../services/dashboardService";
import { isAbortError, getApiErrorMeta } from "../../../utils/apiErrors";

export const useCourseDetails = (courseId) => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const { forbidden } = useForbidden();

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const res = await getCourseDetails(courseId, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (res.data?.data) {
          setCourseData(res.data.data);
        } else {
          setError("Invalid course data received.");
        }
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) return;

        const meta = getApiErrorMeta(err);
        if (meta.isNotFound) {
          setNotFound(true);
        }

        setError(meta.message || "Something went wrong");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCourse();

    return () => controller.abort();
  }, [courseId]);

  return {
    courseData,
    loading: forbidden ? false : loading,
    error,
    notFound,
    forbidden,
  };
};

