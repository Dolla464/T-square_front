import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";
import { useLocation, useNavigate } from "react-router-dom";
import i18next from "i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { useAdminSettings } from "../hooks/useAdminSettings";
import { useUnreadCount } from "../../../hooks/useNotifications";
import { formatNotificationBadge } from "../../../utils/notifications";
import { showPasswordDialog } from "../../../components/shared/ConfirmDialog/confirmDialog";
import { toastError } from "../../../components/shared/Toaster/toaster";
import { isArabicLocale } from "../../../utils/isArabicLocale";

import {
  getStoredActivityLogToken,
  storeActivityLogToken,
  verifyActivityLogPassword,
} from "../services/activityLogService";

const ADMIN_NAV = [
  { key: "dashboard", path: "/admin", icon: "bi-grid-1x2", end: true },
  { key: "schedule", path: "/admin/schedule", icon: "bi-calendar-week" },
  { key: "categories", path: "/admin/categories", icon: "bi-list" },
  { key: "courses", path: "/admin/courses", icon: "bi-mortarboard" },
  {
    key: "googleStorage",
    path: "/admin/google-storage-accounts",
    icon: "bi-cloud-arrow-up",
  },
  {
    key: "instructors",
    path: "/admin/instructors",
    icon: "bi-person-lines-fill",
  },
  {
    key: "studentsInfo",
    icon: "bi-person-vcard",
    children: [
      { key: "students", path: "/admin/students", icon: "bi-people-fill" },
      { key: "certificates", path: "/admin/certificates", icon: "bi-award-fill" },
      { key: "reviews", path: "/admin/reviews", icon: "bi-star-fill" },
    ],
  },
  {
    key: "groups",
    icon: "bi-collection",
    children: [
      { key: "learningGroups", path: "/admin/groups", icon: "bi-diagram-3-fill" },
      {
        key: "studentAttendance",
        path: "/admin/student-attendance",
        icon: "bi-clipboard-data-fill",
      },
      {
        key: "studentResults",
        path: "/admin/student-results",
        icon: "bi-bar-chart-line-fill",
      },
      {
        key: "attendanceQrCards",
        path: "/admin/attendance-qr-cards",
        icon: "bi-qr-code",
      },
    ],
  },
  { key: "quizzes", path: "/admin/quizzes", icon: "bi-chat-right-quote" },
  { key: "orders", path: "/admin/orders", icon: "bi-cart3" },
  { key: "messages", path: "/admin/messages", icon: "bi-chat-left-text" },
  { key: "tags", path: "/admin/tags", icon: "bi-tags" },
  { key: "solutions", path: "/admin/solutions", icon: "bi-laptop" },
  { key: "Notification", path: "/admin/notifications", icon: "bi-bell-fill" },
  {
    key: "history",
    path: "/admin/history",
    icon: "bi-clock-history",
    requiresPassword: true,
  },
  { key: "settings", path: "/admin/settings", icon: "bi-gear" },
];

function AdminLayout() {
  const { t } = useTranslation("adminDashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isArabic = isArabicLocale(i18next.language);
  const { unreadCount } = useUnreadCount();

  const { generalSettings, fetchMediaSettings } = useAdminSettings();

  useEffect(() => {
    fetchMediaSettings();
  }, [fetchMediaSettings]);

  const isMaintenanceOn =
    generalSettings?.maintenance_mode === "true" ||
    generalSettings?.maintenance_mode === true;

  const navItems = ADMIN_NAV.map((item) => {
    const badge = formatNotificationBadge(unreadCount);
    if (item.key === "Notification" && badge != null) {
      return { ...item, badge };
    }
    return item;
  });

  const getPageTitle = (path) => {
    switch (path) {
      case "/admin":
        return t("topbar.welcome_back", { name: user.name });
      case "/admin/categories":
        return t("categories_page.title");
      case "/admin/tags":
        return t("tags_page.title");
      case "/admin/quizzes":
        return t("quizzes_page.title");
      case "/admin/schedule":
        return t("schedule_page.title");
      case "/admin/student-attendance":
        return t("sidebar.studentAttendance");
      case "/admin/attendance-devices":
        return t("sidebar.attendanceDevices");
      case "/admin/student-results":
        return t("studentResults.title");
      case "/admin/attendance-qr-cards":
        return t("attendanceQrCardsPage.title");
      case "/admin/groups":
        return t("sidebar.learningGroups");
      case "/admin/courses":
        return t("courses_page.title");
      case "/admin/google-storage-accounts":
        return t("google_storage_page.title");
      case "/admin/solutions":
        return t("sidebar.solutions");
      case "/admin/students":
        return t("students_page.title");
      case "/admin/instructors":
        return t("instructors_page.title");
      case "/admin/orders":
        return t("sidebar.orders");
      case "/admin/messages":
        return t("sidebar.messages");
      case "/admin/reviews":
        return t("reviews_page.title");
      case "/admin/notifications":
        return t("sidebar.Notification");
      case "/admin/certificates":
        return t("certificates_page.title");
      case "/admin/history":
        return t("history.title");
      case "/admin/settings":
        return t("sidebar.settings");
      default:
        return "";
    }
  };

  const handlePasswordProtectedNavigate = useCallback(
    async (path) => {
      if (getStoredActivityLogToken()) {
        navigate(path);
        return;
      }

      const password = await showPasswordDialog({
        title: t("history.password_title", "Verify Admin Password"),
        message: t(
          "history.password_message",
          "Enter your admin password to access the activity history.",
        ),
        confirmText: t("history.password_confirm", "Verify"),
        icon: "question",
        variant: "primary",
      });

      if (!password) {
        return;
      }

      try {
        const response = await verifyActivityLogPassword(password);
        const token = response?.data?.token;
        const expiresAt = response?.data?.expires_at;

        if (!token || !expiresAt) {
          throw new Error("Invalid verification response");
        }

        storeActivityLogToken(token, expiresAt);
        navigate(path);
      } catch (err) {
        const message =
          err?.response?.data?.errors?.password?.[0] ||
          err?.response?.data?.message ||
          t("history.verify_failed", "Password verification failed.");
        toastError(message);
      }
    },
    [navigate, t],
  );

  const pageTitle = getPageTitle(location.pathname);

  return (
    <>
      {isMaintenanceOn && (
        <div
          className="alert alert-danger text-center border-0 rounded-0 m-0 py-3 shadow-sm"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999,
            fontSize: "1rem",
            backgroundColor: "#dc3545",
            color: "#fff",
            direction: isArabic ? "rtl" : "ltr",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill mx-2 animate-pulse"></i>
          <strong>
            {isArabic
              ? "تنبيه هام: المنصة الآن في وضع الصيانة ومحجوبة تماماً عن الطلاب والمعلمين!"
              : "Important Alert: The platform is currently under maintenance and hidden from users!"}
          </strong>
        </div>
      )}

      <div style={{ paddingTop: isMaintenanceOn ? "55px" : "0px" }}>
        <DashboardSharedLayout
          navItems={navItems}
          translationNs="adminDashboard"
          topbarCenter={null}
          pageTitle={pageTitle}
          userRoleName={t("topbar.role", "Admin User")}
          onPasswordProtectedNavigate={handlePasswordProtectedNavigate}
        />
      </div>
    </>
  );
}

export default AdminLayout;
