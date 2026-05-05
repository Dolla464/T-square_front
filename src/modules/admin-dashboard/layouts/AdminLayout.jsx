import { useTranslation } from "react-i18next";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";
import { useLocation } from "react-router-dom";
import i18next from "i18next";
import { useAuth } from "../../../contexts/AuthContext";

// ── قائمة صفحات الأدمن — مطابقة للتصميم ──
const ADMIN_NAV = [
  {
    key: "dashboard",
    path: "/admin",
    icon: "bi-grid-1x2",
    end: true,
  },
  {
    key: "courses",
    path: "/admin/courses",
    icon: "bi-mortarboard",
  },
  {
    key: "solutions",
    path: "/admin/solutions",
    icon: "bi-laptop",
  },
  {
    key: "students",
    path: "/admin/students",
    icon: "bi-people",
  },
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
    key: "analytics",
    path: "/admin/analytics",
    icon: "bi-bar-chart-line",
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
  const HomePageTitle = isArabic
    ? `مرحبا ${user.name}`
    : `Welcome Back ${user.name}`;

  const getPageTitle = (path) => {
    // admin routes
    switch (path) {
      case "/admin":
        return HomePageTitle;
      case "/admin/courses":
        return isArabic ? "الكورسات" : "Courses";
      case "/admin/solutions":
        return isArabic ? "الحلول البرمجية" : "Solutions";
      case "/admin/students":
        return isArabic ? "الطلاب" : "Students";
      case "/admin/instructors":
      case "/admin/instructors/add":
      case "/admin/instructors/show":
      case "/admin/instructors/edit":
        return isArabic ? "المدربين" : "Instructors";
      case "/admin/orders":
        return isArabic ? "الطلبات / المدفوعات" : "Orders / Payments";
      case "/admin/analytics":
        return isArabic ? "الإحصائيات" : "Analytics";
      case "/admin/reviews":
        return isArabic ? "التقييمات" : "Reviews";
      case "/admin/notifications":
        return isArabic ? "الإشعارات" : "Notifications";
      case "/admin/certificates":
        return isArabic ? "الشهادات" : "Certificates";
      case "/admin/notifications":
        return isArabic ? "الاشعارات" : "Notification";
      case "/admin/settings":
        return isArabic ? "الإعدادات" : "Settings";

      default:
        return "";
    }
  };
  const pageTitle = getPageTitle(location.pathname);

  // شريط البحث الخاص بالأدمن
  // const searchBar = (
  //   <div className="admin-search-wrap" style={{ position: 'relative', width: '100%' }}>
  //     <i className="bi bi-search admin-search-icon" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '14px', color: '#aaa' }}></i>
  //     <input
  //       className="admin-search-input"
  //       placeholder={t("topbar.search_placeholder")}
  //       type="text"
  //       style={{
  //         width: '100%', paddingBlock: '9px', paddingInline: '38px 14px',
  //         border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem',
  //         backgroundColor: '#f9fafb', outline: 'none'
  //       }}
  //     />
  //   </div>
  // );

  return (
    <DashboardSharedLayout
      navItems={ADMIN_NAV}
      translationNs="adminDashboard"
      topbarCenter={null}
      pageTitle={pageTitle}
      userRoleName={t("topbar.role", "Admin User")}
    />
  );
}

export default AdminLayout;
