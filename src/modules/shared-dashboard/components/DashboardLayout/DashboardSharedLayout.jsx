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
import "./DashboardSharedLayout.css";
import { resendVerificationNotification } from '../../../../services/register';
import toast from "react-hot-toast";
import { Alert, Button, Spinner } from "react-bootstrap";
import { useNotifications } from "../../notificationsServices/useNotifications";
function DashboardSharedLayout({
  navItems,
  translationNs,
  topbarCenter,
  userRoleName,
  pageTitle,
}) {
  const { t, i18n } = useTranslation([translationNs, "studentDashboard"]);
  const { user, logout } = useAuth();
  const isAdmin = user.role == "admin";
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isArabic = i18n.language?.startsWith("ar");

  const isCourseDetailsPage = location.pathname.includes("/student/course/");
  const isExmam = location.pathname.includes("/student/quizzes/");

  const { notificationsData } = useNotifications();
  // const totalNotifications = notificationsData.total;
  const unreadCount = notificationsData.unread_count;

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "US";

  const handleNotificationsClick = () => {
    isAdmin
      ? navigate("/admin/notifications")
      : navigate("/student/notifications");
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
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    try {
      setIsResending(true);
      await resendVerificationNotification();
      toast.success(t("verification_link_sent") || "تم إرسال رابط تفعيل جديد إلى بريدك الإلكتروني.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        t("resend_failed") ||
        "حدث خطأ أثناء محاولة إرسال الرابط. يرجى المحاولة لاحقاً."
      );
    } finally {
      setIsResending(false);
    }
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
          className={`shared-dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""
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
            {user &&
              user.hasOwnProperty("is_verified") &&
              String(user.is_verified) !== "true" && (
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
              className={`topbar-user-btn ${userRoleName === "Student" ? "clickable" : ""
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
        <main
          className={`shared-dashboard-content ${isExmam ? "py-1 pt-3" : ""} `}
        >
          {/* تنبيه الحساب غير مفعل */}
          {user &&
            user.hasOwnProperty("is_verified") &&
            String(user.is_verified) !== "true" && (
              <Alert className="activation-banner d-flex justify-content-between">
                <div className="d-flex align-items-center gap-2">

                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>
                    {isArabic
                      ? `الحساب غير مفعل - برجاء مراجعة البريد الإلكتروني: ${user?.email}`
                      : `Account not activated - please check your email: ${user?.email}`}
                  </span>
                </div>
                <Button
                  variant="outline-danger"
                  className="mt-2 fw-bold mb-1 btn btn-outline-danger"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      {t("sending") || "جاري الإرسال..."}
                    </>
                  ) : (
                    "Send verification link again" || "إعادة إرسال رابط التفعيل"
                  )}
                </Button>
              </Alert>
            )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardSharedLayout;
