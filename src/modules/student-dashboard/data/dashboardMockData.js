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
      instructorInitials: "AH",
      instructorRole: "Expert Full-Stack Engineer",
      instructorBio:
        "10+ years of experience in Full-Stack development, worked with top tech companies, passionate about teaching and mentoring aspiring developers.",
      category: "Full-Stack",
      description:
        "Master React from scratch including hooks, state management, and building production-ready applications.",
      progress: 42,
      quizzesCompleted: 5,
      totalQuizzes: 12,
      lessonsCount: 48,
      completedLessons: 20,
      duration: 20,
      studentsCount: "2,150",
      status: "in_progress",
      image: courseImg,
    },
    {
      id: 2,
      title: "UI/UX Design Fundamentals",
      instructor: "Sara Ahmed",
      instructorInitials: "SA",
      instructorRole: "Expert UX Designer",
      instructorBio:
        "10+ years of experience in UX design, worked with top tech companies, passionate about teaching and mentoring aspiring designers.",
      category: "Design",
      description:
        "Master the fundamentals of UI/UX design and learn to create user-centered digital experiences.",
      progress: 8,
      quizzesCompleted: 7,
      totalQuizzes: 10,
      lessonsCount: 52,
      completedLessons: 4,
      duration: 15,
      studentsCount: "1,234",
      status: "in_progress",
      image: courseImg,
    },
    {
      id: 3,
      title: "JavaScript Essentials",
      instructor: "Eng. Ahmed Hatem",
      instructorInitials: "AH",
      instructorRole: "Expert Full-Stack Engineer",
      instructorBio:
        "10+ years of experience in Full-Stack development, worked with top tech companies, passionate about teaching and mentoring aspiring developers.",
      category: "Full-Stack",
      description:
        "Learn the core concepts of JavaScript including ES6+, async programming, and DOM manipulation.",
      progress: 100,
      quizzesCompleted: 8,
      totalQuizzes: 8,
      lessonsCount: 36,
      completedLessons: 36,
      duration: 12,
      studentsCount: "3,420",
      status: "completed",
      image: courseImg,
    },
    {
      id: 4,
      title: "Laravel Backend Development",
      instructor: "Eng. Ahmed Hatem",
      instructorInitials: "AH",
      instructorRole: "Expert Backend Engineer",
      instructorBio:
        "10+ years of experience in backend development with PHP and Laravel, building scalable enterprise applications.",
      category: "Backend",
      description:
        "Build robust backend applications with Laravel including REST APIs, authentication, and database management.",
      progress: 30,
      quizzesCompleted: 3,
      totalQuizzes: 10,
      lessonsCount: 44,
      completedLessons: 13,
      duration: 18,
      studentsCount: "1,890",
      status: "in_progress",
      image: courseImg,
    },
    {
      id: 5,
      title: "Python for Data Science",
      instructor: "Eng. Nour El-Din",
      instructorInitials: "NE",
      instructorRole: "Data Science Lead",
      instructorBio:
        "8+ years in data science and machine learning, published researcher, passionate about making AI accessible to everyone.",
      category: "Data Science",
      description:
        "Explore data science with Python including pandas, numpy, matplotlib, and machine learning fundamentals.",
      progress: 100,
      quizzesCompleted: 10,
      totalQuizzes: 10,
      lessonsCount: 40,
      completedLessons: 40,
      duration: 16,
      studentsCount: "2,780",
      status: "completed",
      image: courseImg,
    },
    {
      id: 6,
      title: "Node.js API Development",
      instructor: "Eng. Ahmed Hatem",
      instructorInitials: "AH",
      instructorRole: "Expert Backend Engineer",
      instructorBio:
        "10+ years of experience in backend development, expert in Node.js, Express, and microservices architecture.",
      category: "Backend",
      description:
        "Learn to build scalable RESTful APIs with Node.js, Express, and MongoDB from zero to deployment.",
      progress: 15,
      quizzesCompleted: 1,
      totalQuizzes: 8,
      lessonsCount: 38,
      completedLessons: 6,
      duration: 14,
      studentsCount: "1,560",
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

  // ── الكويزات ──
  quizzes: [
    {
      id: 1,
      title: "React Components Quiz",
      courseName: "React Professional Course",
      status: "completed",
      score: 92,
      totalQuestions: 12,
      correctAnswers: 11,
      createdAt: "2026-03-15",
    },
    {
      id: 2,
      title: "JavaScript Basics Quiz",
      courseName: "JavaScript Essentials",
      status: "completed",
      score: 88,
      totalQuestions: 8,
      correctAnswers: 7,
      createdAt: "2026-03-08",
    },
    {
      id: 3,
      title: "UI/UX Principles Quiz",
      courseName: "UI/UX Design Fundamentals",
      status: "pending",
      score: null,
      totalQuestions: 10,
      correctAnswers: 6,
      createdAt: "2026-03-20",
    },
    {
      id: 4,
      title: "Laravel MVC Quiz",
      courseName: "Laravel Backend Development",
      status: "pending",
      score: null,
      totalQuestions: 10,
      correctAnswers: 2,
      createdAt: "2026-03-25",
    },
    {
      id: 5,
      title: "Python Data Structures Quiz",
      courseName: "Python for Data Science",
      status: "completed",
      score: 96,
      totalQuestions: 10,
      correctAnswers: 10,
      createdAt: "2026-04-01",
    },
    {
      id: 6,
      title: "Node.js REST API Quiz",
      courseName: "Node.js API Development",
      status: "pending",
      score: null,
      totalQuestions: 8,
      correctAnswers: 0,
      createdAt: "2026-04-20",
    },
    {
      id: 7,
      title: "React Hooks Advanced Quiz",
      courseName: "React Professional Course",
      status: "pending",
      score: null,
      totalQuestions: 15,
      correctAnswers: 0,
      createdAt: "2026-04-25",
    },
    {
      id: 8,
      title: "Design Patterns Quiz",
      courseName: "UI/UX Design Fundamentals",
      status: "completed",
      score: 85,
      totalQuestions: 12,
      correctAnswers: 10,
      createdAt: "2026-04-18",
    },
  ],
};

// بيانات وهمية للإشعارات
export const NOTIFICATIONS_MOCK = [
  {
    id: 1,
    title: " Course Completed Successfully",
    message:
      "Congratulations! You have successfully completed the JavaScript Essentials course and earned your certificate.",
    created_at: "2026-04-27T10:30:00",
    is_read: false,
  },
  {
    id: 2,
    title: " New Course Available",
    message:
      "A new course has been added: Advanced React Patterns. Enroll now and start learning!",
    created_at: "2026-04-26T14:15:00",
    is_read: false,
  },
  {
    id: 3,
    title: " Resume Your Learning",
    message:
      "You haven’t completed the Component Lifecycle lesson in the React course. Continue learning now!",
    created_at: "2026-04-25T09:00:00",
    is_read: true,
  },
  {
    id: 4,
    title: " Quiz Result",
    message: "You scored 92% in the React Components quiz. Excellent work!",
    created_at: "2026-04-24T16:45:00",
    is_read: true,
  },
  {
    id: 5,
    title: " Top 10 Achievement",
    message:
      "Great job! You're now ranked among the top 10 students this month. Keep pushing!",
    created_at: "2026-04-23T11:20:00",
    is_read: true,
  },
  {
    id: 6,
    title: " New Instructor Reply",
    message:
      "Eng. Ahmed Hatem has replied to your question in the React course.",
    created_at: "2026-04-22T13:30:00",
    is_read: true,
  },
  {
    id: 7,
    title: " Upcoming Live Session",
    message:
      "There is a live session on 'Advanced Hooks' tomorrow at 8 PM. Don’t miss it!",
    created_at: "2026-04-21T19:00:00",
    is_read: true,
  },
  {
    id: 8,
    title: " Certificate Ready",
    message:
      "Your certificate for Python for Data Science is now ready for download.",
    created_at: "2026-04-20T10:00:00",
    is_read: true,
  },

  //  New Notifications
  {
    id: 9,
    title: " New Assignment Available",
    message:
      "A new assignment has been added to your React course. Submit it before the deadline.",
    created_at: "2026-04-27T12:00:00",
    is_read: false,
  },
  {
    id: 10,
    title: " Deadline Reminder",
    message:
      "Your assignment deadline is approaching. Make sure to submit it on time.",
    created_at: "2026-04-27T08:00:00",
    is_read: false,
  },
  {
    id: 11,
    title: " Recommended for You",
    message:
      "Based on your progress, we recommend the 'Node.js Fundamentals' course.",
    created_at: "2026-04-26T18:30:00",
    is_read: false,
  },
  {
    id: 12,
    title: " Weekly Progress Report",
    message:
      "You’ve completed 5 lessons this week. Keep up the great momentum!",
    created_at: "2026-04-26T09:00:00",
    is_read: true,
  },
  {
    id: 13,
    title: " New Quiz Available",
    message: "A new quiz is available in your course. Test your knowledge now.",
    created_at: "2026-04-25T15:45:00",
    is_read: false,
  },
  {
    id: 14,
    title: " Security Alert",
    message: "A new login to your account was detected from a new device.",
    created_at: "2026-04-24T20:10:00",
    is_read: true,
  },
{
    id: 15,
    title: " Feature Update",
    message:
      "Weve added new dashboard features to improve your learning experience.",
    created_at: "2026-04-23T17:00:00",
    is_read: true,
  },
];

// Exam questions for each quiz (by quiz id)
// quizId: { id, title, courseName, totalQuestions } exists in quizzes array
export const QUIZ_EXAMS = {
  3: {
    quizId: 3,
    title: "UI/UX Principles Quiz",
    courseName: "UI/UX Design Fundamentals",
    questions: [
      {
        id: 1,
        question: "What does UX stand for?",
        options: ["User Experience", "User Exchange", "Universal Experience", "Unified Experience"],
        correctAnswerIndex: 0,
      },
      {
        id: 2,
        question: "Which of these is a core principle of UX design?",
        options: ["Accessibility", "Complexity", "Inconsistency", "Speed"],
        correctAnswerIndex: 0,
      },
      {
        id: 3,
        question: "What is a user persona?",
        options: ["A fictional character representing target users", "A real user", "A developer", "A manager"],
        correctAnswerIndex: 0,
      },
      {
        id: 4,
        question: "What is the purpose of wireframing?",
        options: ["To plan layout and structure", "To add colors", "To write code", "To test performance"],
        correctAnswerIndex: 0,
      },
      {
        id: 5,
        question: "What does heuristic evaluation assess?",
        options: ["Usability principles", "Code quality", "Server speed", "Database design"],
        correctAnswerIndex: 0,
      },
    ],
  },
  4: {
    quizId: 4,
    title: "Laravel MVC Quiz",
    courseName: "Laravel Backend Development",
    questions: [
      {
        id: 1,
        question: "What does MVC stand for in Laravel?",
        options: ["Model View Controller", "Main View Code", "Module View Component", "Multiple View Controller"],
        correctAnswerIndex: 0,
      },
      {
        id: 2,
        question: "Where are Laravel routes defined?",
        options: ["routes/web.php", "app/models", "database/migrations", "config/app.php"],
        correctAnswerIndex: 0,
      },
      {
        id: 3,
        question: "What is Eloquent in Laravel?",
        options: ["ORM for database", "Routing system", "Template engine", "Cache system"],
        correctAnswerIndex: 0,
      },
      {
        id: 4,
        question: "Which command creates a new controller?",
        options: ["php artisan make:controller", "php artisan create controller", "php new controller", "php make controller"],
        correctAnswerIndex: 0,
      },
      {
        id: 5,
        question: "What is a migration in Laravel?",
        options: ["Database schema version control", "Code backup", "File transfer", "Cache clear"],
        correctAnswerIndex: 0,
      },
      {
        id: 6,
        question: "What is Blade in Laravel?",
        options: ["Template engine", "Database", "Router", "Middleware"],
        correctAnswerIndex: 0,
      },
],
  },
};
