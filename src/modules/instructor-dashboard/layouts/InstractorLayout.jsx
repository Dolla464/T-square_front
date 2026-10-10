import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useUnreadCount } from "../../../hooks/useNotifications";
import { formatNotificationBadge } from "../../../utils/notifications";


const INSTRUCTOR_NAV = [
  { key: "dashboard", path: "/instructor", icon: "bi-grid-1x2", end: true },
  {
    key: "schedule",
    path: "/instructor/schedule",
    icon: "bi-calendar-week",
  },
  {
    key: "classManagement",
    icon: "bi-easel",
    children: [
      {
        key: "attendance",
        path: "/instructor/attendance",
        icon: "bi-qr-code-scan",
      },
      {
        key: "studentResults",
        path: "/instructor/student-results",
        icon: "bi-bar-chart-line-fill",
      },
    ],
  },
  {
    key: "exams",
    icon: "bi-journal-check",
    children: [
      {
        key: "examActivation",
        path: "/instructor/exam-activation",
        icon: "bi-toggle-on",
      },
      { key: "quizzes", path: "/instructor/quizzes", icon: "bi-journal-text" },
      {
        key: "examGrading",
        path: "/instructor/exam-grading",
        icon: "bi-check2-square",
      },
    ],
  },
  {
    key: "Notification",
    path: "/instructor/notifications",
    icon: "bi-bell-fill",
  },
  { key: "profile", path: "/instructor/profile", icon: "bi-person-fill" },
];

function InstructorLayout() {
  const { t } = useTranslation("adminDashboard");
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useUnreadCount();

  const getPageTitle = (path) => {
    if (path.startsWith("/instructor/exam-grading")) {
      return t("sidebar.examGrading");
    }

    switch (path) {
      case "/instructor":
        return t("topbar.welcome_back", { name: user?.name });
      case "/instructor/attendance":
        return t("sidebar.attendance");
      case "/instructor/schedule":
        return t("sidebar.schedule");
      case "/instructor/student-results":
        return t("sidebar.studentResults");
      case "/instructor/exam-activation":
        return t("sidebar.examActivation");
      case "/instructor/quizzes":
        return t("sidebar.quizzes");
      case "/instructor/notifications":
        return t("sidebar.Notification");
      case "/instructor/profile":
        return t("profile_page.title");
      default:
        return "";
    }
  };

  const pageTitle = useMemo(
    () => getPageTitle(location.pathname),
    [location.pathname, t, user?.name],
  );

  const navItems = useMemo(
    () =>
      INSTRUCTOR_NAV.map((item) => {
        const badge = formatNotificationBadge(unreadCount);
        if (item.key === "Notification" && badge != null) {
          return { ...item, badge };
        }
        return item;
      }),
    [unreadCount],
  );

  return (
    <DashboardSharedLayout
      navItems={navItems}
      translationNs="adminDashboard"
      topbarCenter={null}
      pageTitle={pageTitle}
      userRoleName={t("history.roles.instructor")}
    />
  );
}

export default InstructorLayout;
