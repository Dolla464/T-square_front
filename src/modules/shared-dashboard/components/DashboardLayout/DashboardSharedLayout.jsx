import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../contexts/AuthContext";
import { showLogoutConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastCustom } from "../../../../components/shared/Toaster/toaster";
import logoDark from "../../../../assets/logo-dark.png";
import { NOTIFICATIONS_MOCK } from "../../../../modules/student-dashboard/data/dashboardMockData";
import "./DashboardSharedLayout.css";

function DashboardSharedLayout({
  navItems,
  translationNs,
  topbarCenter,
  userRoleName,
  pageTitle,
}) {
  const { t, i18n } = useTranslation([translationNs, "studentDashboard"]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isArabic = i18n.language?.startsWith("ar");

  const isCourseDetailsPage = location.pathname.includes("/student/course/");

  const unreadCount = NOTIFICATIONS_MOCK.filter((n) => !n.is_read).length;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  const handleNotificationsClick = () => {
    navigate("/student/notifications");
  };

  const handleLogout = async () => {
    const confirmed = await showLogoutConfirm();
    if (!confirmed) return;
    logout();
    toastCustom({
      message: isArabic ? "تم تسجيل الخروج بنجاح" : "Logged out successfully",
      type: "info",
      bsIcon: "bi-box-arrow-right",
      duration: 3000,
    });
    navigate("/");
  };

  return (
    <div className="shared-dashboard-wrapper">
      {/* Overlay للموبايل */}
      {sidebarOpen && (
        <div
          className="shared-dashboard-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {!isCourseDetailsPage && (
        <aside
          className={`shared-dashboard-sidebar ${
            sidebarOpen ? "sidebar-open" : ""
          }`}
        >
          {/* اللوجو */}
          <Link to="/" className="sidebar-logo text-decoration-none">
            <img src={logoDark} alt="T-Square" height="48" />
          </Link>

          {/* روابط التنقل */}
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link text-decoration-none ${isActive ? "sidebar-link-active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <i className={`bi ${item.icon} sidebar-link-icon`}></i>
                <span>{t(`${translationNs}:sidebar.${item.key}`)}</span>
              </NavLink>
            ))}
          </nav>

          {/* زر الخروج */}
          <div className="sidebar-footer">
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right sidebar-link-icon"></i>
              <span>{isArabic ? "تسجيل الخروج" : "Logout"}</span>
            </button>
          </div>
        </aside>
      )}

      {/* ── المنطقة الرئيسية ── */}
      <div className="shared-dashboard-main">
        {/* Topbar */}
        <header className="shared-dashboard-topbar">
          {/* Left Section */}
          <div className="topbar-left">
            {isCourseDetailsPage ? (
              <button
                className="topbar-back-btn"
                onClick={() => navigate("/student/dashboard")}
              >
                <i
                  className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
                ></i>
                {t(`${translationNs}:course.back_to_courses`)}
              </button>
            ) : (
              <button
                className="sidebar-toggle-btn"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <i className="bi bi-list"></i>
              </button>
            )}

            {/* 🔥 Page Title هنا في الشمال */}
            {pageTitle && (
              <div className="topbar-page-title d-md-block d-none dash-page-title">
                {pageTitle}
              </div>
            )}
          </div>

          {/* محتوى في المنتصف (مثل شريط البحث) */}
          {topbarCenter && (
            <div className="topbar-center-wrap">{topbarCenter}</div>
          )}

          {/* الجانب الأيمن */}
          <div className="topbar-right">
            {/* تنبيه الحساب غير مفعل (Topbar) - يظهر دائما لو اليوزر مهوش فعال */}
            {!user?.email_verified_at && (
              <div className="topbar-activation-badge">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span className="activation-text">
                  {isArabic
                    ? `الحساب غير مفعل: ${user?.email}`
                    : `Account not activated: ${user?.email}`}
                </span>
              </div>
            )}

            {/* الإشعارات */}
            <button
              className="topbar-notif-btn"
              onClick={handleNotificationsClick}
              aria-label="Notifications"
            >
              <i className="bi bi-bell"></i>
              {unreadCount > 0 && (
                <span className="notif-badge-count">{unreadCount}</span>
              )}
            </button>

            {/* أيقونة المستخدم */}
            <button
              className={`topbar-user-btn ${
                userRoleName === "Student" ? "clickable" : ""
              }`}
              onClick={() =>
                userRoleName === "Student"
                  ? navigate("/student/profile")
                  : navigate("/admin/settings")
              }
              title={userRoleName === "Student" ? "Profile & Settings" : ""}
            >
              <div className="topbar-avatar">{initials}</div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{user?.name || "User"}</span>
                <span className="topbar-user-role">{userRoleName}</span>
              </div>
            </button>
          </div>
        </header>

        {/* محتوى الصفحة */}
        <main className="shared-dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardSharedLayout;
