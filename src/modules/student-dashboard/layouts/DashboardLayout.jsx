import React from "react";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import i18next from "i18next";
import { useUnreadCount } from "../../../hooks/useNotifications";

const STUDENT_NAV = [
  {
    key: "dashboard",
    path: "/student/dashboard",
    icon: "bi-grid-fill",
    end: true,
  },
  {
    key: "myLearning",
    icon: "bi-book",
    children: [
      { key: "quiz", path: "/student/quizzes", icon: "bi-pencil-square" },
      { key: "attendance", path: "/student/attendance", icon: "bi-calendar-check" },
      { key: "certificates", path: "/student/certificates", icon: "bi-award-fill" },
    ],
  },
  {
    key: "notifications",
    path: "/student/notifications",
    icon: "bi-bell-fill",
  },
  { key: "profile", path: "/student/profile", icon: "bi-person-fill" },
];

function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isArabic = i18next.language === "ar";
  const { unreadCount } = useUnreadCount();

  if (!user) return null;

  const navItems = STUDENT_NAV.map((item) => {
    if (item.key === "notifications" && unreadCount > 0) {
      return { ...item, badge: unreadCount > 9 ? "9+" : unreadCount };
    }
    return item;
  });

  const HomePageTitle =
    user.role === "student"
      ? isArabic
        ? `مرحبا ${user.name}`
        : `Welcome Back ${user.name}`
      : user.role === "instructor"
        ? isArabic
          ? `مرحبا ${user.name}`
          : `Welcome Back ${user.name}`
        : isArabic
          ? `مرحبا ${user.name}`
          : `Welcome Back ${user.name}`;

  const getPageTitle = (path) => {
    if (path.includes("/attempts/") && path.endsWith("/review")) {
      return isArabic ? "مراجعة الإجابات" : "Answer Review";
    }
    if (path.startsWith("/student/quizzes/")) {
      return isArabic ? "اختبار الكويز" : "Quiz Exam";
    }
    switch (path) {
      case "/student/dashboard":
        return HomePageTitle;
      case "/student/quizzes":
        return isArabic ? "الأختبارات" : "Quizzes";
      case "/student/attendance":
        return isArabic ? "الحضور" : "Attendance";
      case "/student/certificates":
        return isArabic ? "الشهادات" : "Certificates";
      case "/student/notifications":
        return isArabic ? "الإشعارات" : "Notifications";
      case "/student/profile":
        return isArabic ? "الملف الشخصي" : "My Profile";
      default:
        return "";
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <DashboardSharedLayout
      navItems={navItems}
      translationNs="studentDashboard"
      userRoleName="Student"
      pageTitle={pageTitle}
    />
  );
}

export default DashboardLayout;
