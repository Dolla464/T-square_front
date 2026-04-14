import { useEffect } from "react";
import {
  BrowserRouter as Router,
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
import Courses from "./pages/CoursesPage";

// استيراد ملفات البوتستراب
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.rtl.min.css";

// مكون فرعي للتحكم في عرض الـ Layout
function AppContent() {
  const { i18n } = useTranslation();
  const location = useLocation();

  // تحديد الصفحات التي سيتم إخفاء النافبار والفوتر فيها
  const hideLayout =
    location.pathname === "/login" || location.pathname === "/signup";

  useEffect(() => {
    const dir = i18n.dir();
    document.body.dir = dir;
    document.body.lang = i18n.language;
    document.getElementsByTagName("html")[0].setAttribute("dir", dir);
  }, [i18n, i18n.language]);

  return (
    <div className="min-h-screen">
      {/* إظهار النافبار فقط إذا لم نكن في صفحة اللوجين */}
      {!hideLayout && <AppNavbar isLoggedIn={false} userName="Ahmed Hassan" />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="/courses" element={<Courses />} />
      </Routes>

      {/* إظهار الفوتر فقط إذا لم نكن في صفحة اللوجين */}
      {!hideLayout && <AppFooter />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
