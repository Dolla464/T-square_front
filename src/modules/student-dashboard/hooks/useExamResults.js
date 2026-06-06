import { useState, useCallback } from "react";
import { getExamResults as getExamResultsApi } from "../services/dashboardService";

/**
 * هوك مخصص لجلب نتائج اختبار الطالب ومحاولاته السابقة
 * @param {number|string} examId - معرف الاختبار
 */
export const useExamResults = (examId) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * دالة تقوم بطباعة ريسبونس الـ API لمعرفة الحقول المتاحة والتعديل عليها
   */
  const logResponse = useCallback((data) => {
    console.log(`[ExamResults Hook] API Response for exam_id=${examId}:`, data);
  }, [examId]);

  const fetchResults = useCallback(async () => {
    if (!examId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getExamResultsApi(examId);
      const data = res.data;
      
      // طباعة الاستجابة في الـ console كما هو مطلوب
      logResponse(data);
      
      setResults(data);
    } catch (err) {
      console.error(`[ExamResults Hook] Failed to fetch results for exam_id=${examId}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [examId, logResponse]);

  return { results, loading, error, fetchResults };
};
