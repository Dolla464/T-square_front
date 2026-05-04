import { useState, useEffect } from "react";
import { DASHBOARD_MOCK } from "../data/dashboardMockData";
import { getStudentCourses as studentCoursesApi } from "../services/dashboardService"; // فعّل عند توفر الـ API

/**
 * هوك بيانات الداشبورد الرئيسية
 * حالياً يجلب من الموك — جاهز للتحول للـ API
 *
 * لما الـ API يكون جاهز:
 * 1. فك التعليق عن fetchFromAPI
 * 2. احذف fetchFromMock
 * 3. عدّل الـ keys لو أسماء الحقول اختلفت
 */
export const getStudentCourses = () => {
  const [stats, setStats] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [continueLearning, setContinueLearning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ── TODO: استبدل بالكود ده لما الـ API يكون جاهز ──
    const fetchFromAPI = async () => {
      try {
        const res = await studentCoursesApi();
        const data = res.data.data;

        setStats(data.stats);

        // فلترة الكورسات لعرض الكورسات المسجل فيها فقط
        const allCourses = data.courses || [];
        const enrolled = allCourses.filter(course => course.enrollment !== null);

        setEnrolledCourses(enrolled);
        setContinueLearning(data.continue_learning);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFromAPI();

    // // ── بيانات وهمية مؤقتة ──
    // setTimeout(() => {
    //   setStats(DASHBOARD_MOCK.stats);
    //   setEnrolledCourses(DASHBOARD_MOCK.enrolledCourses);
    //   setContinueLearning(DASHBOARD_MOCK.continueLearning);
    //   setLoading(false);
    // }, 300);
  }, []);

  return { stats, enrolledCourses, continueLearning, loading, error };
};
