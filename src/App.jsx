import { useEffect, lazy, Suspense } from "react"
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
import AppNavbar from "./components/layout/Navbar"
import AppFooter from "./components/layout/Footer"
const Home = lazy(() => import("./pages/Home"))
const LoginPage = lazy(() => import("./pages/Login/LoginPage"))
const SignupPage = lazy(() => import("./pages/Signup/SignupPage"))
const ForgotPassword = lazy(() => import("./pages/forgot_password/ForgotPassword"))
const UpdatePassword = lazy(() => import("./pages/Update_Password/UpdatePassword"))
const Courses = lazy(() => import("./pages/CoursesPage"))
const Solutions = lazy(() => import("./pages/Solutions"))
const DetailsCourse = lazy(() => import("./pages/CourseDetails"))
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmail/VerifyEmailPage"))
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'))
// استيراد ملفات البوتستراب
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Team = lazy(() => import("./pages/Team"))
const Contact = lazy(() => import("./pages/Contact"))
const Payment = lazy(() => import("./pages/Payment"))

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import "./components/shared/ConfirmDialog/confirmDialog.css";
import ErrorBoundary from "./components/shared/ErrorBoundary";

// ── وحدة داشبورد الطالب ──
import DashboardLayout from "./modules/student-dashboard/layouts/DashboardLayout";
const DashboardHome = lazy(() => import("./modules/student-dashboard/pages/DashboardHome/DashboardHome"));
const DashboardCertificates = lazy(() => import("./modules/student-dashboard/pages/DashboardCertificates/DashboardCertificates"));
const DashboardQuizzes = lazy(() => import("./modules/student-dashboard/pages/DashboardQuizzes/DashboardQuizzes"));
const DashboardProfile = lazy(() => import("./modules/student-dashboard/pages/DashboardProfile/DashboardProfile"));
const CourseDetails = lazy(() => import("./modules/student-dashboard/pages/CourseDetails/CourseDetails"));
const NotificationsPage = lazy(() => import("./modules/shared-dashboard/Notifications/NotificationsPage"));
import QuizExamPage from "./modules/student-dashboard/pages/QuizExam/QuizExamPage";

// ── وحدة داشبورد الأدمن ──
const AdminLayout = lazy(() => import("./modules/admin-dashboard/layouts/AdminLayout"));
const AdminOverview = lazy(() => import("./modules/admin-dashboard/pages/Overview/AdminOverview"));
const AdminCourses = lazy(() => import("./modules/admin-dashboard/pages/Courses/AdminCourses"));
const AdminSolutions = lazy(() => import("./modules/admin-dashboard/pages/Solutions/AdminSolutions"));
const AdminStudents = lazy(() => import("./modules/admin-dashboard/pages/Students/AdminStudents"));
const AdminInstructors = lazy(() => import("./modules/admin-dashboard/pages/Instructors/AdminInstructors"));
const AdminOrders = lazy(() => import("./modules/admin-dashboard/pages/Orders/AdminOrders"));
const AdminAnalytics = lazy(() => import("./modules/admin-dashboard/pages/Analytics/AdminAnalytics"));
const AdminCertificates = lazy(() => import("./modules/admin-dashboard/pages/Certificates/AdminCertificates"));
const AdminReviews = lazy(() => import("./modules/admin-dashboard/pages/Reviews/AdminReviews"));
const AdminSettings = lazy(() => import("./modules/admin-dashboard/pages/Settings/AdminSettings"));
const AdminGroups = lazy(() => import("./modules/admin-dashboard/pages/Groups/AdminGroups"));
const AdminCategories = lazy(() => import("./modules/admin-dashboard/pages/Categories/AdminCategories"));
const AdminQuizzes = lazy(() => import("./modules/admin-dashboard/pages/Quizzes/AdminQuizzes"));
const ViewExam = lazy(() => import("./modules/admin-dashboard/pages/Quizzes/components/ViewExam"));
const EditExam = lazy(() => import("./modules/admin-dashboard/pages/Quizzes/components/EditExam"));
import Loading from "./Loading";
import LoadingSpiner from "./LoadingSpiner";


// مكون فرعي للتحكم في عرض الـ Layout
function AppContent() {
  const { t, i18n } = useTranslation("common");
  const location = useLocation();
  const { user } = useAuth();

  // تحديد الصفحات التي سيتم إخفاء النافبار والفوتر فيها
  const validRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot_password",
    "/update_password",
    "/verify-email",
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
    location.pathname.startsWith("/student");

  const hideLayout =
    !isValidRoute ||
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot_password" ||
    location.pathname === "/update_password" ||
    location.pathname.startsWith("/verify-email") ||
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
          <Route path="/"
            element={
              <Suspense fallback={<Loading />}>
                {<Home />}
              </Suspense>
            } />

          <Route path="/login" element={
            <Suspense fallback={<Loading />}>
              <LoginPage />
            </Suspense>} />

          <Route path="/signup" element={
            <Suspense fallback={<Loading />}>
              <SignupPage />
            </Suspense>} />

          <Route path="/forgot_password" element={
            <Suspense fallback={<LoadingSpiner />}>
              <ForgotPassword />
            </Suspense>

          } />

          <Route path="/update_password" element={
            <Suspense fallback={<LoadingSpiner />}>
              <UpdatePassword />
            </Suspense>
          } />

          <Route path="/verify-email" element={
            <Suspense fallback={<LoadingSpiner />}>
              <VerifyEmailPage />
            </Suspense>
          } />

          <Route path="/courses" element={
            <Suspense fallback={<LoadingSpiner />}>
              <Courses />
            </Suspense>
          } />

          <Route
            path="/courses/course_details/:slug"
            element={<Suspense fallback={<LoadingSpiner />}>
              <DetailsCourse />
            </Suspense>}
          />

          <Route path="/payment" element={<Navigate to="/courses" replace />} />
          <Route path="/payment/:slug" element={<Suspense fallback={<LoadingSpiner />}>
            <Payment />
          </Suspense>} />

          <Route path="/solutions" element={
            <Suspense fallback={<LoadingSpiner />}>
              <Solutions />
            </Suspense>
          } />

          <Route path="/team" element={
            <Suspense fallback={<LoadingSpiner />}>
              <Team />
            </Suspense>
          } />

          <Route path="/contact" element={
            <Suspense fallback={<LoadingSpiner />}>
              <Contact />
            </Suspense>
          } />

          {/* Protected Routes — Admin Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={
                <Suspense fallback={<Loading />}>
                  {<AdminOverview />}
                </Suspense>} />
              <Route path="courses" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminCourses />
                </Suspense>} />
              <Route path="categories" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminCategories />
                </Suspense>} />
              <Route path="quizzes" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminQuizzes />
                </Suspense>} />
              <Route path="quizzes/view-exam/:id" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <ViewExam />
                </Suspense>} />
              <Route path="quizzes/edit-exam/:id" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <EditExam />
                </Suspense>} />
              <Route path="groups" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminGroups />
                </Suspense>} />
              <Route path="solutions" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminSolutions />
                </Suspense>} />
              <Route path="students" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminStudents />
                </Suspense>} />
              <Route path="instructors" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminInstructors />
                </Suspense>} />

              <Route path="orders" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminOrders />
                </Suspense>} />
              <Route path="analytics" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminAnalytics />
                </Suspense>} />
              <Route path="certificates" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminCertificates />
                </Suspense>} />
              <Route path="reviews" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminReviews />
                </Suspense>} />
              <Route path="notifications" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <NotificationsPage />
                </Suspense>} />
              <Route path="settings" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <AdminSettings />
                </Suspense>} />
            </Route>
          </Route>

          {/* Protected Routes — Student Dashboard (nested) */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student" element={<DashboardLayout />}>
              {/* الصفحة الرئيسية */}
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={
                <Suspense fallback={<Loading />}>
                  {<DashboardHome />}
                </Suspense>} />
              {/* Flat sub-pages — بدون /dashboard في المسار */}
              <Route path="certificates" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <DashboardCertificates />
                </Suspense>} />
              <Route path="quizzes" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <DashboardQuizzes />
                </Suspense>} />
              <Route path="quizzes/:quizId" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <QuizExamPage />
                </Suspense>} />
              <Route path="profile" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <DashboardProfile />
                </Suspense>} />
              <Route path="notifications" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <NotificationsPage />
                </Suspense>} />
              <Route path="course/:id" element={
                <Suspense fallback={<LoadingSpiner />}>
                  <CourseDetails />
                </Suspense>} />
              {/* Aliases — لو جه من رابط قديم بـ /dashboard/xxx */}
              <Route
                path="dashboard/certificates"
                element={
                  <Suspense fallback={<LoadingSpiner />}>
                    <Navigate to="/student/certificates" replace />
                  </Suspense>
                }
              />
              <Route
                path="dashboard/quizzes"
                element={
                  <Suspense fallback={<LoadingSpiner />}>
                    <Navigate to="/student/quizzes" replace />
                  </Suspense>
                }
              />
              <Route
                path="dashboard/profile"
                element={
                  <Suspense fallback={<LoadingSpiner />}>
                    <Navigate to="/student/profile" replace />
                  </Suspense>
                }
              />
            </Route>
          </Route>

          {/* Catch-all route for undefined paths */}
          <Route path="*" element={
            <Suspense fallback={<LoadingSpiner />}>
              <NotFoundPage />
            </Suspense>
          } />
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
