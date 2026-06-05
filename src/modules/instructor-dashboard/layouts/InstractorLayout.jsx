import { useTranslation } from "react-i18next";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";
import { useLocation } from "react-router-dom";
import i18next from "i18next";
import { useAuth } from "../../../contexts/AuthContext";

// ── قائمة صفحات الأدمن ──
const INSTRUCTOR_NAV = [
  { key: "dashboard", path: "/instructor", icon: "bi-grid-1x2", end: true },
  {
    key: "Notification",
    path: "/instructor/notifications",
    icon: "bi-bell-fill",
  },


];

function InstructorLayout() {
  const { t } = useTranslation("adminDashboard");
  const location = useLocation();
  const { user } = useAuth();
  const isArabic = i18next.language === "ar";



  const HomePageTitle = isArabic
    ? `مرحبا ${user.name}`
    : `Welcome Back ${user.name}`;

  const getPageTitle = (path) => {
    switch (path) {
      case "/instructor":
        return HomePageTitle;
      case "/instructor/notifications":
        return isArabic ? "الإشعارات" : "Notifications";

      default:
        return "";
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <>

      <div>
        <DashboardSharedLayout
          navItems={INSTRUCTOR_NAV}
          translationNs="adminDashboard"
          topbarCenter={null}
          pageTitle={pageTitle}
          userRoleName={isArabic ? "مدرب" : "Instructor"}
        />
      </div>
    </>
  );
}

export default InstructorLayout;
