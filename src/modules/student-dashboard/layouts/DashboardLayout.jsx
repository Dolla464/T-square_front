import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { useUnreadCount } from "../../../hooks/useNotifications";
import { formatNotificationBadge } from "../../../utils/notifications";
import { getStudentCourses } from "../hooks/useCourses";
import { shouldShowStudentAttendanceNav } from "../../../utils/attendanceTypes";

const STUDENT_NAV = [
  {
    key: "dashboard",
    path: "/student/dashboard",
    icon: "bi-grid-fill",
    end: true,
  },
  {
    key: "attendance",
    icon: "bi-calendar-check",
    children: [
      {
        key: "attendanceToday",
        path: "/student/attendance",
        icon: "bi-check-circle-fill",
        end: true,
      },
      {
        key: "attendanceSchedule",
        path: "/student/attendance/schedule",
        icon: "bi-calendar-week",
        end: true,
      },
      {
        key: "attendanceHistory",
        path: "/student/attendance/history",
        icon: "bi-bar-chart-line",
        end: true,
      },
    ],
  },
  {
    key: "myLearning",
    icon: "bi-book",
    children: [
      { key: "quiz", path: "/student/quizzes", icon: "bi-pencil-square" },
      {
        key: "examResults",
        path: "/student/exam-results",
        icon: "bi-bar-chart-line-fill",
      },
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
  const { t } = useTranslation("studentDashboard");
  const { user } = useAuth();
  const location = useLocation();
  const { unreadCount } = useUnreadCount();
  const { enrolledCourses, loading } = getStudentCourses();

  const showAttendanceNav = useMemo(() => {
    if (loading) {
      return true;
    }

    return shouldShowStudentAttendanceNav(enrolledCourses);
  }, [enrolledCourses, loading]);

  if (!user) return null;

  const navItems = STUDENT_NAV.filter(
    (item) => item.key !== "attendance" || showAttendanceNav,
  ).map((item) => {
    const badge = formatNotificationBadge(unreadCount);
    if (item.key === "notifications" && badge != null) {
      return { ...item, badge };
    }
    return item;
  });

  const getPageTitle = (path) => {
    if (path.includes("/attempts/") && path.endsWith("/review")) {
      return t("page_titles.answer_review");
    }
    if (path.startsWith("/student/quizzes/")) {
      return t("page_titles.quiz_exam");
    }
    if (path.startsWith("/student/exam-results/") && path !== "/student/exam-results") {
      return t("page_titles.exam_result_details");
    }
    switch (path) {
      case "/student":
      case "/student/dashboard":
        return t("topbar.welcome_back", { name: user.name });
      case "/student/quizzes":
        return t("sidebar.quiz");
      case "/student/exam-results":
        return t("sidebar.examResults");
      case "/student/attendance":
        return t("page_titles.attendance_today");
      case "/student/attendance/schedule":
        return t("page_titles.attendance_schedule");
      case "/student/attendance/history":
        return t("page_titles.attendance_history");
      case "/student/certificates":
        return t("sidebar.certificates");
      case "/student/notifications":
        return t("sidebar.notifications");
      case "/student/profile":
        return t("page_titles.my_profile");
      default:
        return "";
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <DashboardSharedLayout
      navItems={navItems}
      translationNs="studentDashboard"
      userRoleName={t("topbar.role")}
      pageTitle={pageTitle}
    />
  );
}

export default DashboardLayout;
