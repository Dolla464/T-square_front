import { useEffect } from "react";
import {
  /* HashRouter */ BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import ScrollToTop from "./components/shared/ScrollToTop";
import AppNavbar from "./components/layout/Navbar";
import AppFooter from "./components/layout/Footer";
import Home from "./pages/Home";
import LoginPage from "./pages/Login/LoginPage";
import SignupPage from "./pages/Signup/SignupPage";
import ForgotPassword from "./pages/forgot_password/ForgotPassword";
import UpdatePassword from "./pages/Update_Password/UpdatePassword";
import Courses from "./pages/CoursesPage";
import Solutions from "./pages/Solutions";
import DetailsCourse from "./pages/CourseDetails";

// استيراد ملفات البوتستراب
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Payment from "./pages/Payment";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import "./components/shared/ConfirmDialog/confirmDialog.css";
import ErrorBoundary from "./components/shared/ErrorBoundary";

// ── وحدة داشبورد الطالب ──
import DashboardLayout from "./modules/student-dashboard/layouts/DashboardLayout";
import DashboardHome from "./modules/student-dashboard/pages/DashboardHome/DashboardHome";
import DashboardCertificates from "./modules/student-dashboard/pages/DashboardCertificates/DashboardCertificates";
import DashboardQuizzes from "./modules/student-dashboard/pages/DashboardQuizzes/DashboardQuizzes";
import DashboardProfile from "./modules/student-dashboard/pages/DashboardProfile/DashboardProfile";
import CourseDetails from "./modules/student-dashboard/pages/CourseDetails/CourseDetails";

// ── وحدة داشبورد الأدمن ──
import AdminLayout from "./modules/admin-dashboard/layouts/AdminLayout";
import AdminOverview from "./modules/admin-dashboard/pages/Overview/AdminOverview";
import AdminCourses from "./modules/admin-dashboard/pages/Courses/AdminCourses";
import AdminStudents from "./modules/admin-dashboard/pages/Students/AdminStudents";
import AdminInstructor from "./modules/admin-dashboard/pages/Instructor/AdminInstructor";
import AdminInstructors from "./modules/admin-dashboard/pages/Instructors/AdminInstructors";
import AdminOrders from "./modules/admin-dashboard/pages/Orders/AdminOrders";
import AdminAnalytics from "./modules/admin-dashboard/pages/Analytics/AdminAnalytics";
import AdminCertificates from "./modules/admin-dashboard/pages/Certificates/AdminCertificates";
import AdminReviews from "./modules/admin-dashboard/pages/Reviews/AdminReviews";
import AdminSettings from "./modules/admin-dashboard/pages/Settings/AdminSettings";

// مكون فرعي للتحكم في عرض الـ Layout
function AppContent() {
  const { t, i18n } = useTranslation("common");
  const location = useLocation();
  const { user } = useAuth();

  // تحديد الصفحات التي سيتم إخفاء النافبار والفوتر فيها
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot_password" ||
    location.pathname === "/update_password" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/student");

  useEffect(() => {
    const dir = i18n.dir();
    const lang = i18n.language;

    // Update document attributes
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.body.dir = dir;
    document.body.lang = lang;

    document.title = t("site_title") || "T-Square";

    // Persist language to localStorage
    localStorage.setItem("i18nextLng", lang);
  }, [i18n, i18n.language, t]);

  return (
    <>
      <Helmet>
        {/* Primary Meta */}
        <title>T-Square</title>

        <meta
          name="description"
          content="منصة تعليمية متخصصة في الكورسات التقنية والحلول الرقمية في مصر والسعودية. نقدم مسارات تدريبية عملية، تطوير مواقع وتطبيقات، وحلول برمجية تساعد الأفراد والشركات على النمو الرقمي بثقة. | A professional LMS platform providing technical courses and digital solutions in Egypt and Saudi Arabia."
        />

        <meta
          name="keywords"
          content="
            LMS Egypt,
            LMS Saudi Arabia,
            منصة تعليمية,
            كورسات برمجة اونلاين,
            تعلم البرمجة من الصفر,
            software solutions Egypt,
            digital solutions Saudi Arabia,
            web development courses,
            frontend courses,
            backend courses,
            full stack courses,
            programming learning platform
          "
        />

        <meta name="author" content="T-Square" />
        <link rel="icon" href="/favicon-32x32.png" />

        {/* Theme Color (Mobile UI) */}
        <meta name="theme-color" content="#000000" />

        {/* Safari iOS Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />

        {/* Open Graph (Facebook / WhatsApp / LinkedIn) */}
        <meta
          property="og:title"
          content="Professional LMS & Digital Solutions Platform"
        />

        <meta
          property="og:description"
          content="Learn modern tech skills and build real-world projects. نقدم كورسات تقنية وحلول رقمية للأفراد والشركات في مصر والسعودية."
        />

        <meta property="og:type" content="website" />

        <meta
          property="og:url"
          // content="https://yourdomain.com"
        />

        <meta
          property="og:image"
          // content="https://yourdomain.com/preview.png"
        />

        {/* Twitter Preview */}
        <meta name="twitter:card" content="summary_large_image" />

        <meta
          name="twitter:title"
          // content="LMS Platform | Programming Courses & Digital Solutions"
        />

        <meta
          name="twitter:description"
          content="Tech learning paths and digital transformation solutions for students and companies in Egypt & Saudi Arabia."
        />

        <meta
          name="twitter:image"
          // content="https://yourdomain.com/preview.png"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* إظهار النافبار فقط فاللاندينج بيدج */}
        {!hideLayout && (
          <AppNavbar
            isLoggedIn={!!user}
            userName={user?.name}
            role={user?.role}
          />
        )}

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/signup" element={<SignupPage />} />

          <Route path="/forgot_password" element={<ForgotPassword />} />

          <Route path="/update_password" element={<UpdatePassword />} />

          <Route path="/courses" element={<Courses />} />

          <Route path="/course_details" element={<DetailsCourse />} />
          
          <Route path="/solutions" element={<Solutions />} />

          <Route path="/team" element={<Team />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/payment" element={<Navigate to="/courses" replace />} />
          <Route path="/payment/:slug" element={<Payment />} />

          {/* Protected Routes — Admin Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="instructor" element={<AdminInstructor />} />
              <Route path="instructors" element={<AdminInstructors />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="certificates" element={<AdminCertificates />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Protected Routes — Student Dashboard (nested) */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<DashboardLayout />}>
              {/* الصفحة الرئيسية */}
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardHome />} />
              {/* Flat sub-pages — بدون /dashboard في المسار */}
              <Route path="certificates" element={<DashboardCertificates />} />
              <Route path="quizzes" element={<DashboardQuizzes />} />
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="course/:id" element={<CourseDetails />} />
              {/* Aliases — لو جه من رابط قديم بـ /dashboard/xxx */}
              <Route
                path="dashboard/certificates"
                element={<Navigate to="/student/certificates" replace />}
              />
              <Route
                path="dashboard/quizzes"
                element={<Navigate to="/student/quizzes" replace />}
              />
              <Route
                path="dashboard/profile"
                element={<Navigate to="/student/profile" replace />}
              />
            </Route>
          </Route>
        </Routes>
        {/* إظهار الفوتر فقط إذا لم نكن في صفحة اللوجين */}
        {!hideLayout && <AppFooter />}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          {/* مكون الإشعارات العالمي - يجب أن يكون على مستوى الـ App */}
          <Toaster position="top-center" reverseOrder={false} />
          <AppContent />
          <ScrollToTop />
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
