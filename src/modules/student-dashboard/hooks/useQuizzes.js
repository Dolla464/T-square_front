import { useState, useEffect } from "react";
import { getStudentExams } from "../services/dashboardService";

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFromAPI = async () => {
      try {
        setLoading(true);

        const res = await getStudentExams();
        const quizzesData = res.data?.data || [];

        setQuizzes(quizzesData);

        const completed = quizzesData.filter(
          (quiz) => quiz.has_attempt
        ).length;

        const pending = quizzesData.filter(
          (quiz) => !quiz.has_attempt
        ).length;

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
    };

    fetchFromAPI();
  }, []);

  return { quizzes, stats, loading, error };
};
