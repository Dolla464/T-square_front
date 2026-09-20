import { useState, useEffect, useCallback } from "react";
import { getStudentExams } from "../services/dashboardService";

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getStudentExams();
      const quizzesData = res.data?.data || [];

      setQuizzes(quizzesData);

      const completed = quizzesData.filter((quiz) => quiz.is_locked).length;
      const pending = quizzesData.filter((quiz) => !quiz.is_locked).length;

      setStats({
        total: quizzesData.length,
        completed,
        pending,
        open: pending,
        avgScore: 0,
      });
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { quizzes, stats, loading, error, refetch };
};
