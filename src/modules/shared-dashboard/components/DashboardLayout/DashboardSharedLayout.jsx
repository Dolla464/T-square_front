import { useState, Suspense, useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../../contexts/AuthContext";
import { showLogoutConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastCustom } from "../../../../components/shared/Toaster/toaster";
import logoDark from "../../../../assets/logo-dark.webp";
import "./DashboardSharedLayout.css";
import { resendVerificationNotification } from "../../../../services/register";
import toast from "react-hot-toast";
import { Alert, Spinner } from "react-bootstrap";
import { useUnreadCount } from "../../../../hooks/useNotifications";
import {
  getNameInitials,
  getProfileAvatarUrl,
  getProfileDisplayName,
  isDefaultAvatarUrl,
} from "../../../../utils/avatar";

function DashboardSharedLayout({
  navItems,
  translationNs,
  topbarCenter,
  userRoleName,
  pageTitle,
}) {
  const { t, i18n } = useTranslation([translationNs, "studentDashboard"]);
  const { user, logout, userProfile } = useAuth();
  const isAdmin = user?.role === "admin" || userRoleName === "Admin";
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isArabic = i18n.language?.startsWith("ar");

  useEffect(() => {
    document.body.classList.add("dashboard-active");
    return () => {
      document.body.classList.remove("dashboard-active");
    };
  }, []);

  const isCourseDetailsPage = location.pathname.includes("/student/course/");
  const isExmam = location.pathname.includes("/student/quizzes/");
  const isLeaveReviewPage = location.pathname.includes("/student/review/");
  const { unreadCount } = useUnreadCount();

  const displayName = getProfileDisplayName(user, userProfile);
  const avatarUrl = getProfileAvatarUrl(user, userProfile);
  const initials = getNameInitials(displayName);
  const showInitials = isDefaultAvatarUrl(avatarUrl);

  const handleNotificationsClick = () => {
    if (isAdmin) {
      navigate("/admin/notifications");
    } else if (userRoleName === "Instructor" || user?.role === "instructor") {
      navigate("/instructor/notifications");
    } else if (userRoleName === "Receptionist" || user?.role === "receptionist") {
      // Receptionist has no dedicated notifications page — no-op
    } else {
      navigate("/student/notifications");
    }
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
      toast.success(
        t("verification_link_sent") ||
          "تم إرسال رابط تفعيل جديد إلى بريدك الإلكتروني.",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t("resend_failed") ||
          "حدث خطأ أثناء محاولة إرسال الرابط. يرجى المحاولة لاحقاً.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="shared-dashboard-wrapper">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Overlay للموبايل */}
      {sidebarOpen && (
        <div
          className="shared-dashboard-overlay overlay-open"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      {!isCourseDetailsPage && !isLeaveReviewPage && (
        <aside
          className={`shared-dashboard-sidebar ${
            sidebarOpen ? "sidebar-open" : ""
          }`}
        >
          {/* اللوجو */}
          <Link to="/" className="sidebar-logo text-decoration-none">
            <img src={logoDark} alt="T-Square" height="50" />
          </Link>

          {/* روابط التنقل */}
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link text-decoration-none d-flex align-items-center justify-content-between ${isActive ? "sidebar-link-active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <div className="d-flex align-items-center">
                  <i className={`bi ${item.icon} sidebar-link-icon`}></i>
                  <span className="px-3 fs-6">
                    {t(`${translationNs}:sidebar.${item.key}`)}
                  </span>
                </div>
                {item.badge && (
                  <span className="badge bg-danger rounded-pill ms-2">
                    {item.badge}
                  </span>
                )}
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
            {isCourseDetailsPage || isLeaveReviewPage ? (
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

            {/* Page Title */}
            {pageTitle && (
              <div className="topbar-page-title d-md-block d-none dash-page-title">
                {pageTitle}
              </div>
            )}
          </div>

          {/* محتوى في المنتصف */}
          {topbarCenter && (
            <div className="topbar-center-wrap">{topbarCenter}</div>
          )}

          {/* الجانب الأيمن */}
          <div className="topbar-right">
            {/* تنبيه الحساب غير مفعل */}
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
              className={`topbar-user-btn ${
                ["student", "instructor"].includes(user?.role) ? "clickable" : ""
              }`}
              onClick={() => {
                if (userRoleName === "Student" || user?.role === "student") {
                  navigate("/student/profile");
                } else if (
                  userRoleName === "Instructor" ||
                  user?.role === "instructor"
                ) {
                  navigate("/instructor/profile");
                } else if (
                  userRoleName === "Receptionist" ||
                  user?.role === "receptionist"
                ) {
                  // Receptionist has no dedicated profile page — no-op
                } else {
                  navigate("/admin/settings");
                }
              }}
              title={
                userRoleName === "Student"
                  ? "Profile & Settings"
                  : userRoleName === "Instructor"
                    ? "Profile & Settings"
                    : ""
              }
            >
              <div className="topbar-avatar">
                {showInitials ? (
                  initials
                ) : (
                  <img
                    src={avatarUrl}
                    alt={displayName || user?.name}
                    className="w-100 h-100 rounded-circle"
                    style={{ objectFit: "cover" }}
                  />
                )}
              </div>
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
                <button
                  type="button"
                  className="mt-2 fw-bold mb-1 btn ac-publish-btn text-white px-3 py-2"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      {t("sending") || "جاري الإرسال..."}
                    </>
                  ) : (
                    "Send verification link again" || "إعادة إرسال رابط التفعيل"
                  )}
                </button>
              </Alert>
            )}
          <Suspense
            fallback={
              <div
                className="d-flex justify-content-center align-items-center w-100"
                style={{ minHeight: "300px" }}
              >
                <Spinner animation="border" variant="danger" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default DashboardSharedLayout;
