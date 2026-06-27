import { useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
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

const LoginPage = lazy(() => import("./pages/Login/LoginPage"));
const SignupPage = lazy(() => import("./pages/Signup/SignupPage"));
const ForgotPassword = lazy(
  () => import("./pages/forgot_password/ForgotPassword"),
);
const UpdatePassword = lazy(
  () => import("./pages/Update_Password/UpdatePassword"),
);
const Courses = lazy(() => import("./pages/CoursesPage"));
const Solutions = lazy(() => import("./pages/Solutions"));
const DetailsCourse = lazy(() => import("./pages/CourseDetails"));
const VerifyEmailPage = lazy(
  () => import("./pages/VerifyEmail/VerifyEmailPage"),
);
const NotFoundPage = lazy(() => import("./pages/NotFound/NotFoundPage"));

// استيراد ملفات البوتستراب
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Team = lazy(() => import("./pages/Team"));
const Contact = lazy(() => import("./pages/Contact"));
const Payment = lazy(() => import("./pages/Payment"));

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { getRouteByRole } from "./config/routes";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import "./components/shared/ConfirmDialog/confirmDialog.css";
import ErrorBoundary from "./components/shared/ErrorBoundary";

// ── وحدة داشبورد الطالب ──
import DashboardLayout from "./modules/student-dashboard/layouts/DashboardLayout";
const DashboardHome = lazy(
  () => import("./modules/student-dashboard/pages/DashboardHome/DashboardHome"),
);
const DashboardCertificates = lazy(
  () =>
    import("./modules/student-dashboard/pages/DashboardCertificates/DashboardCertificates"),
);
const DashboardQuizzes = lazy(
  () =>
    import("./modules/student-dashboard/pages/DashboardQuizzes/DashboardQuizzes"),
);
const DashboardProfile = lazy(
  () =>
    import("./modules/student-dashboard/pages/DashboardProfile/DashboardProfile"),
);
const CourseDetails = lazy(
  () => import("./modules/student-dashboard/pages/CourseDetails/CourseDetails"),
);
const LeaveReview = lazy(
  () => import("./modules/student-dashboard/pages/LeaveReview/LeaveReview"),
);
const NotificationsPage = lazy(
  () => import("./modules/shared-dashboard/Notifications/NotificationsPage"),
);
import QuizExamPage from "./modules/student-dashboard/pages/QuizExam/QuizExamPage";

// ── وحدة داشبورد الأدمن ──
import { AdminSettingsProvider } from "./modules/admin-dashboard/hooks/useAdminSettings";
const AdminLayout = lazy(
  () => import("./modules/admin-dashboard/layouts/AdminLayout"),
);
const AdminOverview = lazy(
  () => import("./modules/admin-dashboard/pages/Overview/AdminOverview"),
);
const AdminCourses = lazy(
  () => import("./modules/admin-dashboard/pages/Courses/AdminCourses"),
);
const AdminSolutions = lazy(
  () => import("./modules/admin-dashboard/pages/Solutions/AdminSolutions"),
);
const AdminStudents = lazy(
  () => import("./modules/admin-dashboard/pages/Students/AdminStudents"),
);
const AdminInstructors = lazy(
  () => import("./modules/admin-dashboard/pages/Instructors/AdminInstructors"),
);
const AdminOrders = lazy(
  () => import("./modules/admin-dashboard/pages/Orders/AdminOrders"),
);

const AdminCertificates = lazy(
  () =>
    import("./modules/admin-dashboard/pages/Certificates/AdminCertificates"),
);
const AdminReviews = lazy(
  () => import("./modules/admin-dashboard/pages/Reviews/AdminReviews"),
);
const AdminSettings = lazy(
  () => import("./modules/admin-dashboard/pages/Settings/AdminSettings"),
);
const AdminGroups = lazy(
  () => import("./modules/admin-dashboard/pages/Groups/AdminGroups"),
);
const AdminCategories = lazy(
  () => import("./modules/admin-dashboard/pages/Categories/AdminCategories"),
);
const AdminQuizzes = lazy(
  () => import("./modules/admin-dashboard/pages/Quizzes/AdminQuizzes"),
);
const ViewExam = lazy(
  () => import("./modules/admin-dashboard/pages/Quizzes/components/ViewExam"),
);
const EditExam = lazy(
  () => import("./modules/admin-dashboard/pages/Quizzes/components/EditExam"),
);
import LoadingSpiner from "./LoadingSpiner";
const AdminMessages = lazy(
  () => import("./modules/admin-dashboard/pages/Messages/AdminMessages"),
);
const MaintenancePage = lazy(
  () => import("./pages/Maintenance/MaintenancePage"),
);
const InstructorOverview = lazy(
  () =>
    import("./modules/instructor-dashboard/pages/Overview/InstructorOverview"),
);
const InstructorLayout = lazy(
  () => import("./modules/instructor-dashboard/layouts/InstractorLayout"),
);
const InstructorAttendance = lazy(
  () =>
    import("./modules/instructor-dashboard/pages/Attendance/InstructorAttendance"),
);

// مكون فرعي للتحكم في عرض الـ Layout والتوجيه
function AppContent() {
  const { t, i18n } = useTranslation("common");
  const location = useLocation();
  const { user, isMaintenance, loading } = useAuth();

  // تحديد الصفحات التي سيتم إخفاء النافبار والفوتر فيها
  const validRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot_password",
    "/update_password",
    "/verify-email",
    "/password-reset",
    "/courses",
    "/solutions",
    "/team",
    "/contact",
  ];
  const isValidRoute =
    validRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/courses/course_details/") ||
    location.pathname.startsWith("/payment/") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/instructor") ||
    location.pathname.startsWith("/receptionist");

  // إذا كان الموقع قيد الصيانة والمستخدم ليس أدمن، نقوم بإخفاء الهيكل العام (Navbar/Footer) تلقائياً
  const isEffectiveMaintenance =
    !loading && isMaintenance && user?.role !== "admin";

  const hideLayout =
    isEffectiveMaintenance ||
    !isValidRoute ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot_password" ||
    location.pathname === "/update_password" ||
    location.pathname.includes("/verify-email") ||
    location.pathname.includes("password-reset") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/instructor") ||
    location.pathname.startsWith("/receptionist");

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
          content="LMS Egypt, LMS Saudi Arabia, منصة تعليمية, كورسات برمجة اونلاين, تعلم البرمجة من الصفر, software solutions Egypt, digital solutions Saudi Arabia, web development courses, frontend courses, backend courses, full stack courses, programming learning platform"
        />
        <meta name="author" content="T-Square" />
        <link rel="icon" href="/favicon-32x32.webp" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta
          property="og:title"
          content="Professional LMS & Digital Solutions Platform"
        />
        <meta
          property="og:description"
          content="Learn modern tech skills and build real-world projects. نقدم كورسات تقنية وحلول رقمية للأفراد والشركات في مصر والسعودية."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* Open Graph */}
        <meta property="og:url" content="https://tsquarecenter.com/" />
        <meta property="og:site_name" content="T-Square" />
        <meta property="og:locale" content="ar_AR" />

        <meta
          property="og:image"
          content="https://tsquarecenter.com/og-image.jpg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="T-Square LMS & Digital Solutions"
        />

        {/* Twitter */}
        <meta
          name="twitter:title"
          content="Professional LMS & Digital Solutions Platform"
        />
        <meta
          name="twitter:description"
          content="Learn modern tech skills and build real-world projects. نقدم كورسات تقنية وحلول رقمية للأفراد والشركات في مصر والسعودية."
        />
        <meta
          name="twitter:image"
          content="https://tsquarecenter.com/og-image.jpg"
        />
        <meta name="twitter:site" content="@tsquare" />
        {/* iOS / Safari */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="T-Square" />

        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        <meta name="theme-color" content="#2e0202ff" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#1f0101ff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#000000"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* إظهار النافبار بناءً على الشروط الديناميكية */}
        {!hideLayout && (
          <AppNavbar
            isLoggedIn={!!user}
            userName={user?.name}
            role={user?.role}
          />
        )}

        <Suspense fallback={<LoadingSpiner />}>
          <Routes>
            {/* المسارات المتاحة دائماً تحت أي ظرف للمسؤولين ولعرض شاشة الصيانة */}
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route
              path="/login"
              element={
                loading ? (
                  <LoadingSpiner />
                ) : user ? (
                  <Navigate to={getRouteByRole(user.role)} replace />
                ) : (
                  <LoginPage />
                )
              }
            />

            {/* قفل الشاشة وحقن التوجيه الإجباري إذا كانت الصيانة نشطة والمستخدم ليس أدمن */}
            {isEffectiveMaintenance ? (
              <Route
                path="*"
                element={<Navigate to="/maintenance" replace />}
              />
            ) : (
              // المسارات الطبيعية للموقع تعمل عندما يكون الوضع طبيعياً أو عندما يكون المستخدم Admin
              <>
                {/* ADMIN */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                  <Route
                    path="/admin"
                    element={
                      <AdminSettingsProvider>
                        <AdminLayout />
                      </AdminSettingsProvider>
                    }
                  >
                    <Route index element={<AdminOverview />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="quizzes" element={<AdminQuizzes />} />
                    <Route
                      path="quizzes/view-exam/:id"
                      element={<ViewExam />}
                    />
                    <Route
                      path="quizzes/edit-exam/:id"
                      element={<EditExam />}
                    />
                    <Route path="groups" element={<AdminGroups />} />
                    <Route path="solutions" element={<AdminSolutions />} />
                    <Route path="students" element={<AdminStudents />} />
                    <Route path="instructors" element={<AdminInstructors />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route
                      path="certificates"
                      element={<AdminCertificates />}
                    />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="messages" element={<AdminMessages />} />
                    <Route
                      path="notifications"
                      element={<NotificationsPage />}
                    />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                {/* INSTRUCTOR */}
                <Route
                  element={<ProtectedRoute allowedRoles={["instructor"]} />}
                >
                  <Route path="/instructor" element={<InstructorLayout />}>
                    <Route index element={<InstructorOverview />} />
                    <Route
                      path="attendance"
                      element={<InstructorAttendance />}
                    />
                    <Route
                      path="notifications"
                      element={<NotificationsPage />}
                    />
                  </Route>
                </Route>

                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot_password" element={<ForgotPassword />} />
                <Route
                  path="/password-reset/:token"
                  element={<UpdatePassword />}
                />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/courses" element={<Courses />} />
                <Route
                  path="/courses/course_details/:slug"
                  element={<DetailsCourse />}
                />

                <Route
                  path="/payment"
                  element={<Navigate to="/courses" replace />}
                />
                <Route path="/payment/:slug" element={<Payment />} />

                <Route path="/solutions" element={<Solutions />} />
                <Route path="/team" element={<Team />} />
                <Route path="/contact" element={<Contact />} />

                {/* STUDENT */}
                <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                  <Route path="/student" element={<DashboardLayout />}>
                    <Route
                      index
                      element={<Navigate to="dashboard" replace />}
                    />
                    <Route path="dashboard" element={<DashboardHome />} />
                    <Route
                      path="certificates"
                      element={<DashboardCertificates />}
                    />
                    <Route path="quizzes" element={<DashboardQuizzes />} />
                    <Route path="quizzes/:quizId" element={<QuizExamPage />} />
                    <Route path="profile" element={<DashboardProfile />} />
                    <Route
                      path="notifications"
                      element={<NotificationsPage />}
                    />
                    <Route
                      path="course/:courseId"
                      element={<CourseDetails />}
                    />
                    <Route path="review/:courseId" element={<LeaveReview />} />
                  </Route>
                </Route>

                {/* 404 NotFound */}
                <Route path="*" element={<NotFoundPage />} />
              </>
            )}
          </Routes>
        </Suspense>

        {/* إظهار الفوتر بناءً على الشروط الديناميكية */}
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
          {/* مكون الإشعارات العالمي */}
          <Toaster position="top-center" reverseOrder={false} />
          <AppContent />
          <ScrollToTop />
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
