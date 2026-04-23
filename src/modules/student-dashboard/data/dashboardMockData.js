// بيانات وهمية واقعية للداشبورد
import courseImg from "../../../assets/about1.png";
import certImg from "../../../assets/certificat.jpeg";

export const DASHBOARD_MOCK = {
  // ── إحصائيات ──
  stats: {
    allCourses: 6,
    inProgress: 4,
    completedCourses: 2,
    purchasedCourses: 6,
  },

  // ── الكورس الذي يكمل منه ──
  continueLearning: {
    id: 1,
    title: "React Professional Course",
    lessonInfo: "Quiz 5 of 12 · Component Lifecycle",
    progress: 42,
    quizzesCompleted: 5,
    totalQuizzes: 12,
  },

  // ── الكورسات المشترك بها ──
  enrolledCourses: [
    {
      id: 1,
      title: "React Professional Course",
      instructor: "Eng. Ahmed Hatem",
      category: "Frontend",
      progress: 42,
      quizzesCompleted: 5,
      totalQuizzes: 12,
      status: "in_progress",
      image: courseImg,
    },
    {
      id: 2,
      title: "UI/UX Design Fundamentals",
      instructor: "Eng. Ahmed Hatem",
      category: "Design",
      progress: 65,
      quizzesCompleted: 7,
      totalQuizzes: 10,
      status: "in_progress",
      image: courseImg,
    },
    {
      id: 3,
      title: "JavaScript Essentials",
      instructor: "Eng. Ahmed Hatem",
      category: "Frontend",
      progress: 100,
      quizzesCompleted: 8,
      totalQuizzes: 8,
      status: "completed",
      image: courseImg,
    },
    {
      id: 4,
      title: "Laravel Backend Development",
      instructor: "Eng. Ahmed Hatem",
      category: "Backend",
      progress: 30,
      quizzesCompleted: 3,
      totalQuizzes: 10,
      status: "in_progress",
      image: courseImg,
    },
    {
      id: 5,
      title: "Python for Data Science",
      instructor: "Eng. Nour El-Din",
      category: "Data Science",
      progress: 100,
      quizzesCompleted: 10,
      totalQuizzes: 10,
      status: "completed",
      image: courseImg,
    },
    {
      id: 6,
      title: "Node.js API Development",
      instructor: "Eng. Ahmed Hatem",
      category: "Backend",
      progress: 15,
      quizzesCompleted: 1,
      totalQuizzes: 8,
      status: "in_progress",
      image: courseImg,
    },
  ],

  // ── إحصائيات الشهادات ──
  certStats: {
    earned: 2,
    inProgress: 4,
    enrolled: 6,
  },

  // ── الشهادات المكتسبة ──
  certificates: [
    {
      id: 1,
      courseTitle: "JavaScript Essentials",
      completedDate: "Mar 10, 2026",
      certificateNum: "TSQR-2026-JS-001",
      image: certImg,
    },
    {
      id: 2,
      courseTitle: "Python for Data Science",
      completedDate: "Apr 05, 2026",
      certificateNum: "TSQR-2026-PY-002",
      image: certImg,
    },
  ],
};
