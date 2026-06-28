import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";
import { useLocation } from "react-router-dom";
import i18next from "i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { useUnreadCount } from "../../../hooks/useNotifications";

const INSTRUCTOR_NAV = [
  { key: "dashboard", path: "/instructor", icon: "bi-grid-1x2", end: true },
  {
    key: "attendance",
    path: "/instructor/attendance",
    icon: "bi-person-check-fill",
  },
  {
    key: "schedule",
    path: "/instructor/schedule",
    icon: "bi-calendar-week",
  },
  {
    key: "Notification",
    path: "/instructor/notifications",
    icon: "bi-bell-fill",
  },
];

function InstructorLayout() {
  useTranslation("adminDashboard");
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useUnreadCount();
  const isArabic = i18next.language === "ar";

  const HomePageTitle = useMemo(
    () => (isArabic ? `مرحبا ${user?.name}` : `Welcome Back ${user?.name}`),
    [isArabic, user?.name],
  );

  const getPageTitle = (path) => {
    switch (path) {
      case "/instructor":
        return HomePageTitle;
      case "/instructor/attendance":
        return isArabic ? "الحضور والغياب" : "Attendance";
      case "/instructor/schedule":
        return isArabic ? "الجدول الزمني" : "My Schedule";
      case "/instructor/notifications":
        return isArabic ? "الإشعارات" : "Notifications";
      default:
        return "";
    }
  };

  const pageTitle = useMemo(
    () => getPageTitle(location.pathname),
    [location.pathname, HomePageTitle], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const navItems = useMemo(
    () =>
      INSTRUCTOR_NAV.map((item) => {
        if (item.key === "Notification" && unreadCount > 0) {
          return {
            ...item,
            badge: unreadCount > 9 ? "9+" : unreadCount,
          };
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
      userRoleName={isArabic ? "مدرب" : "Instructor"}
    />
  );
}

export default InstructorLayout;
