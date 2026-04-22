import { useEffect } from "react";
import {
  /* HashRouter */ BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
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

// استيراد ملفات البوتستراب
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Payment from "./pages/Payment";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";

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
    <div className="min-h-screen">
      {/* إظهار النافبار فقط إذا لم نكن في صفحة اللوجين */}
      {!hideLayout && <AppNavbar isLoggedIn={!!user} userName={user?.name} role={user?.role} />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="/forgot_password" element={<ForgotPassword />} />

        <Route path="/update_password" element={<UpdatePassword />} />

        <Route path="/courses" element={<Courses />} />

        <Route path="/solutions" element={<Solutions />} />

        <Route path="/team" element={<Team />} />

        <Route path="/contact" element={<Contact />} />
        
        <Route path="/payment" element={<Navigate to="/courses" replace />} />
        <Route path="/payment/:slug" element={<Payment />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>
      </Routes>
      {/* إظهار الفوتر فقط إذا لم نكن في صفحة اللوجين */}
      {!hideLayout && <AppFooter />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <ScrollToTop />
      </Router>
    </AuthProvider>
  );
}

export default App;
