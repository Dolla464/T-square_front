import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useUnreadCount } from "../../../hooks/useNotifications";
import { formatNotificationBadge } from "../../../utils/notifications";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";


const RECEPTIONIST_NAV = [
  { key: "dashboard", path: "/receptionist", icon: "bi-grid-1x2", end: true },
  {
    key: "attendance",
    path: "/receptionist/attendance",
    icon: "bi-person-check-fill",
  },
  {
    key: "groups",
    icon: "bi-collection",
    children: [
      { key: "learningGroups", path: "/receptionist/groups", icon: "bi-diagram-3-fill" },
      {
        key: "studentAttendance",
        path: "/receptionist/student-attendance",
        icon: "bi-clipboard-data-fill",
      },
    ],
  },
  { key: "students", path: "/receptionist/students", icon: "bi-people" },
  { key: "orders", path: "/receptionist/orders", icon: "bi-cart3" },
  {
    key: "Notification",
    path: "/receptionist/notifications",
    icon: "bi-bell-fill",
  },
];

function ReceptionistLayout() {
  const { t } = useTranslation("receptionistDashboard");
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useUnreadCount();

  const getPageTitle = (path) => {
    switch (path) {
      case "/receptionist":
        return t("topbar.welcome_back", { name: user?.name });
      case "/receptionist/attendance":
        return t("sidebar.attendance");
      case "/receptionist/student-attendance":
        return t("sidebar.studentAttendance");
      case "/receptionist/groups":
        return t("sidebar.learningGroups");
      case "/receptionist/students":
        return t("sidebar.students");
      case "/receptionist/orders":
        return t("sidebar.orders");
      case "/receptionist/orders/create":
        return t("orders_page.create_title");
      case "/receptionist/notifications":
        return t("sidebar.Notification");
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
      RECEPTIONIST_NAV.map((item) => {
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
      translationNs="receptionistDashboard"
      topbarCenter={null}
      pageTitle={pageTitle}
      userRoleName={t("topbar.role")}
    />
  );
}

export default ReceptionistLayout;
