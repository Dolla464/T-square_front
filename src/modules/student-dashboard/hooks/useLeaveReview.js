import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import i18next from "i18next";
import {
  getReviewEligibility,
  submitCourseReview,
} from "../services/dashboardService";
import { toastError, toastSuccess } from "../../../components/shared/Toaster/toaster";

export const useLeaveReview = (courseId) => {
  const navigate = useNavigate();
  const isArabic = i18next.language === "ar";

  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchEligibility = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getReviewEligibility(courseId);
      const data = res.data?.data ?? res.data;
      setEligibility(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (isArabic ? "تعذر تحميل بيانات التقييم" : "Failed to load review data");
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [courseId, isArabic]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  useEffect(() => {
    if (loading || !eligibility) return;

    if (!eligibility.is_completed) {
      navigate(`/student/course/${courseId}`, { replace: true });
      return;
    }

    if (eligibility.has_review) {
      navigate(`/student/course/${courseId}`, { replace: true });
    }
  }, [loading, eligibility, navigate, courseId]);

  const submitReview = useCallback(
    async ({ ratings, overallComment }) => {
      if (!courseId) return false;

      try {
        setSubmitting(true);
        setError(null);

        const res = await submitCourseReview({
          course_id: Number(courseId),
          overall_comment: overallComment,
          ratings,
        });

        const message =
          res.data?.message ||
          (isArabic
            ? "تم إرسال تقييماتك بنجاح! شكراً لك على مشاركة رأيك الصادق."
            : "Your reviews have been submitted successfully! Thank you for sharing your honest feedback.");

        toastSuccess(message);

        const certificateIssued = res.data?.data?.certificate_issued;
        if (certificateIssued) {
          navigate("/student/certificates");
        } else {
          navigate(`/student/course/${courseId}`);
        }

        return true;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          (isArabic ? "فشل إرسال التقييم" : "Failed to submit review");
        setError(message);
        toastError(message);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [courseId, isArabic, navigate]
  );

  return {
    eligibility,
    loading,
    submitting,
    error,
    submitReview,
    refetchEligibility: fetchEligibility,
  };
};
