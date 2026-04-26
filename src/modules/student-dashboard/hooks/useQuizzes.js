import { useState, useEffect } from "react";
import { DASHBOARD_MOCK } from "../data/dashboardMockData";
// import { getStudentQuizzes } from "../services/dashboardService"; // فعّل عند توفر الـ API

/**
 * هوك بيانات كويزات الداشبورد
 * حالياً يجلب من الموك — جاهز للتحول للـ API
 *
 * لما الـ API يكون جاهز:
 * 1. فك التعليق عن fetchFromAPI
 * 2. احذف fetchFromMock
 * 3. عدّل الـ keys لو أسماء الحقول اختلفت
 */
export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ── TODO: استبدل بالكود ده لما الـ API يكون جاهز ──
    // const fetchFromAPI = async () => {
    //     try {
    //         const res = await getStudentQuizzes();
    //         setQuizzes(res.data.data.quizzes);
    //         setStats(res.data.data.stats);
    //     } catch (err) { setError(err); }
    //     finally { setLoading(false); }
    // };
    // fetchFromAPI();

    // ── بيانات وهمية مؤقتة ──
    setTimeout(() => {
      setQuizzes(DASHBOARD_MOCK.quizzes);

      // حساب الإحصائيات من الكويزات
      const completed = DASHBOARD_MOCK.quizzes.filter(
        (q) => q.status === "completed",
      ).length;
      const inProgress = DASHBOARD_MOCK.quizzes.filter(
        (q) => q.status === "in_progress",
      ).length;
      const total = DASHBOARD_MOCK.quizzes.length;

      // حساب متوسط النتيجة
      const completedQuizzes = DASHBOARD_MOCK.quizzes.filter(
        (q) => q.score !== null,
      );
      const avgScore =
        completedQuizzes.length > 0
          ? Math.round(
              completedQuizzes.reduce((sum, q) => sum + q.score, 0) /
                completedQuizzes.length,
            )
          : 0;

      setStats({
        total,
        completed,
        inProgress,
        avgScore,
      });

      setLoading(false);
    }, 300);
  }, []);

  return { quizzes, stats, loading, error };
};
