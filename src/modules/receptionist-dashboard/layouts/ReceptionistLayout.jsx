import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import i18next from "i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { useUnreadCount } from "../../../hooks/useNotifications";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";

const RECEPTIONIST_NAV = [
  { key: "dashboard",  path: "/receptionist",            icon: "bi-grid-1x2",         end: true },
  { key: "attendance", path: "/receptionist/attendance", icon: "bi-person-check-fill" },
];

function ReceptionistLayout() {
  useTranslation("receptionistDashboard");
  const location   = useLocation();
  const { user }   = useAuth();
  const { unreadCount } = useUnreadCount();
  const isArabic   = i18next.language === "ar";

  const HomePageTitle = useMemo(
    () => (isArabic ? `مرحبا ${user?.name}` : `Welcome Back ${user?.name}`),
    [isArabic, user?.name]
  );

  const getPageTitle = (path) => {
    switch (path) {
      case "/receptionist":
        return HomePageTitle;
      case "/receptionist/attendance":
        return isArabic ? "الحضور والغياب" : "Attendance";
      default:
        return "";
    }
  };

  const pageTitle = useMemo(
    () => getPageTitle(location.pathname),
    [location.pathname, HomePageTitle] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const navItems = useMemo(
    () =>
      RECEPTIONIST_NAV.map((item) => {
        if (item.key === "Notification" && unreadCount > 0) {
          return { ...item, badge: unreadCount > 9 ? "9+" : unreadCount };
        }
        return item;
      }),
    [unreadCount]
  );

  return (
    <DashboardSharedLayout
      navItems={navItems}
      translationNs="receptionistDashboard"
      topbarCenter={null}
      pageTitle={pageTitle}
      userRoleName={isArabic ? "موظف استقبال" : "Receptionist"}
    />
  );
}

export default ReceptionistLayout;
