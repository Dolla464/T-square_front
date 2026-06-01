import { useTranslation } from "react-i18next";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";
import { useLocation } from "react-router-dom";
import i18next from "i18next";
import { useAuth } from "../../../contexts/AuthContext";
import { useAdminSettings } from "../hooks/useAdminSettings"; // تأكدنا من صحة المسار هنا بعد حل مشكلة الفايل
import { useEffect } from "react";

// ── قائمة صفحات الأدمن ──
const ADMIN_NAV = [
  { key: "dashboard", path: "/admin", icon: "bi-grid-1x2", end: true },
  { key: "categories", path: "/admin/categories", icon: "bi-list" },
  { key: "courses", path: "/admin/courses", icon: "bi-mortarboard" },
  { key: "Quzies", path: "/admin/quizzes", icon: "bi-chat-right-quote" },
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
    key: "analytics",
    path: "/admin/analytics",
    icon: "bi-bar-chart-line",
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

  // 1. جلب السيتينج ودالة الفيتش من الهوك
  const { generalSettings, fetchMediaSettings } = useAdminSettings();

  // 2. تشغيل الفيتش فور دخول الأدمن للوحة التحكم عشان نقرأ الحالة الحقيقية من الباك إند
  useEffect(() => {
    fetchMediaSettings();
  }, [fetchMediaSettings]);

  // 3. فحص دقيق للحالة (سواء رجعت كـ String "true" أو Boolean true)
  const isMaintenanceOn =
    generalSettings?.maintenance_mode === "true" ||
    generalSettings?.maintenance_mode === true;

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
        return isArabic ? "الاختبارات" : "Quzzies";
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
      case "/admin/analytics":
        return isArabic ? "الإحصائيات" : "Analytics";
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
      {/* 🚨 4. شريط التنبيه العلوي اللاصق يظهر هنا فوق الـ Layout بالكامل */}
      {isMaintenanceOn && (
        <div
          className="alert alert-danger text-center border-0 rounded-0 m-0 py-3 shadow-sm"
          style={{
            position: "fixed", // خليناها fixed عشان تضمن تظهر فوق أي مكون مشترك
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999, // أعلى z-index ممكن عشان يعلى فوق الـ Navbar والـ Sidebar بتاعة الـ Layout
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

      {/* إضافة padding علوي خفيف للـ Layout بأكمله فقط في حالة ظهور الشريط لكي لا يغطي على الهيدر */}
      <div style={{ paddingTop: isMaintenanceOn ? "55px" : "0px" }}>
        <DashboardSharedLayout
          navItems={ADMIN_NAV}
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
