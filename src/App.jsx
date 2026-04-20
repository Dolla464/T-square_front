import { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
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

// مكون فرعي للتحكم في عرض الـ Layout
function AppContent() {
  const { i18n } = useTranslation("common");
  const location = useLocation();

  // تحديد الصفحات التي سيتم إخفاء النافبار والفوتر فيها
  const hideLayout =
    location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/forgot_password" || location.pathname === "/update_password";

  useEffect(() => {
    const dir = i18n.dir();
    const lang = i18n.language;

    // Update document attributes
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.body.dir = dir;
    document.body.lang = lang;

    // Persist language to localStorage
    localStorage.setItem("i18nextLng", lang);
  }, [i18n, i18n.language]);

  return (
    <div className="min-h-screen">
      {/* إظهار النافبار فقط إذا لم نكن في صفحة اللوجين */}
      {!hideLayout && <AppNavbar isLoggedIn={false} userName="Ahmed Hassan" />}

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
      </Routes>
      {/* إظهار الفوتر فقط إذا لم نكن في صفحة اللوجين */}
      {!hideLayout && <AppFooter />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <ScrollToTop />
    </Router>
  );
}

export default App;
