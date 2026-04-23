import React from "react";
import { useTranslation } from "react-i18next";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";

// ── قائمة صفحات الأدمن — مطابقة للتصميم ──
const ADMIN_NAV = [
  { key: "dashboard", path: "/admin", icon: "bi-grid-1x2", end: true },
  { key: "courses", path: "/admin/courses", icon: "bi-mortarboard" },
  { key: "students", path: "/admin/students", icon: "bi-people" },
  { key: "instructor", path: "/admin/instructor", icon: "bi-person-badge" },
  { key: "instructors", path: "/admin/instructors", icon: "bi-person-lines-fill" },
  { key: "orders", path: "/admin/orders", icon: "bi-cart3" },
  { key: "analytics", path: "/admin/analytics", icon: "bi-bar-chart-line" },
  { key: "certificates", path: "/admin/certificates", icon: "bi-award" },
  { key: "reviews", path: "/admin/reviews", icon: "bi-chat-square-text" },
  { key: "settings", path: "/admin/settings", icon: "bi-gear" },
];

function AdminLayout() {
  const { t } = useTranslation("adminDashboard");

  // شريط البحث الخاص بالأدمن
  const searchBar = (
    <div className="admin-search-wrap" style={{ position: 'relative', width: '100%' }}>
      <i className="bi bi-search admin-search-icon" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '14px', color: '#aaa' }}></i>
      <input
        className="admin-search-input"
        placeholder={t("topbar.search_placeholder")}
        type="text"
        style={{
          width: '100%', paddingBlock: '9px', paddingInline: '38px 14px',
          border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.88rem',
          backgroundColor: '#f9fafb', outline: 'none'
        }}
      />
    </div>
  );

  return (
    <DashboardSharedLayout
      navItems={ADMIN_NAV}
      translationNs="adminDashboard"
      topbarCenter={searchBar}
      userRoleName={t("topbar.role", "Admin User")}
    />
  );
}

export default AdminLayout;
