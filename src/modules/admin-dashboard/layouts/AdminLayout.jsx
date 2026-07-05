import { useTranslation } from "react-i18next";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";
import { useLocation } from "react-router-dom";
import i18next from "i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { useAdminSettings } from "../hooks/useAdminSettings";
import { useEffect } from "react";
import { useUnreadCount } from "../../../hooks/useNotifications";

const ADMIN_NAV = [
  { key: "dashboard", path: "/admin", icon: "bi-grid-1x2", end: true },
  { key: "schedule", path: "/admin/schedule", icon: "bi-calendar-week" },
  { key: "studentAttendance", path: "/admin/student-attendance", icon: "bi-clipboard-check" },
  { key: "studentResults", path: "/admin/student-results", icon: "bi-bar-chart-line" },
  { key: "categories", path: "/admin/categories", icon: "bi-list" },
  { key: "courses", path: "/admin/courses", icon: "bi-mortarboard" },
  { key: "quizzes", path: "/admin/quizzes", icon: "bi-chat-right-quote" },
  { key: "groups", path: "/admin/groups", icon: "bi-people" },
  { key: "students", path: "/admin/students", icon: "bi-people" },
  {
    key: "instructors",
    path: "/admin/instructors",
    icon: "bi-person-lines-fill",
  },
  {
    key: "orders",
    path: "/admin/orders",
    icon: "bi-cart3",
  },
  {
    key: "solutions",
    path: "/admin/solutions",
    icon: "bi-laptop",
  },
  {
    key: "messages",
    path: "/admin/messages",
    icon: "bi-chat-left-text",
  },
  {
    key: "certificates",
    path: "/admin/certificates",
    icon: "bi-award",
  },
  {
    key: "reviews",
    path: "/admin/reviews",
    icon: "bi-chat-square-text",
  },
  {
    key: "Notification",
    path: "/admin/notifications",
    icon: "bi-bell-fill",
  },
  {
    key: "settings",
    path: "/admin/settings",
    icon: "bi-gear",
  },
];

function AdminLayout() {
  const { t } = useTranslation("adminDashboard");
  const location = useLocation();
  const { user } = useAuth();
  const isArabic = i18next.language === "ar";
  const { unreadCount } = useUnreadCount();

  const { generalSettings, fetchMediaSettings } = useAdminSettings();

  useEffect(() => {
    fetchMediaSettings();
  }, [fetchMediaSettings]);

  const isMaintenanceOn =
    generalSettings?.maintenance_mode === "true" ||
    generalSettings?.maintenance_mode === true;

  const navItems = ADMIN_NAV.map((item) => {
    if (item.key === "Notification" && unreadCount > 0) {
      return { ...item, badge: unreadCount > 9 ? "9+" : unreadCount };
    }
    return item;
  });

  const HomePageTitle = isArabic
    ? `مرحبا ${user.name}`
    : `Welcome Back ${user.name}`;

  const getPageTitle = (path) => {
    switch (path) {
      case "/admin":
        return HomePageTitle;
      case "/admin/categories":
        return isArabic ? "التصنيفات" : "Categories";
      case "/admin/quizzes":
        return isArabic ? "الاختبارات" : "Quizzes";
      case "/admin/schedule":
        return isArabic ? "الجدول الزمني" : "Schedule";
      case "/admin/student-attendance":
        return isArabic ? "حضور الطلاب" : "Students Attendance";
      case "/admin/student-results":
        return isArabic ? "نتائج الطلاب" : "Students Results";
      case "/admin/groups":
        return isArabic ? "المجموعات" : "Groups";
      case "/admin/courses":
        return isArabic ? "الكورسات" : "Courses";
      case "/admin/solutions":
        return isArabic ? "الحلول البرمجية" : "Solutions";
      case "/admin/students":
        return isArabic ? "الطلاب" : "Students";
      case "/admin/instructors":
        return isArabic ? "المدربين" : "Instructors";
      case "/admin/orders":
        return isArabic ? "الطلبات / المدفوعات" : "Orders / Payments";
      case "/admin/messages":
        return isArabic ? "الرسائل" : "Messages";
      case "/admin/reviews":
        return isArabic ? "التقييمات" : "Reviews";
      case "/admin/notifications":
        return isArabic ? "الإشعارات" : "Notifications";
      case "/admin/certificates":
        return isArabic ? "الشهادات" : "Certificates";
      case "/admin/settings":
        return isArabic ? "الإعدادات" : "Settings";
      default:
        return "";
    }
  };

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
        />
      </div>
    </>
  );
}

export default AdminLayout;
