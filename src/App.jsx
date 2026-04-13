import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScrollToTop from './components/shared/ScrollToTop';
import AppNavbar from './components/layout/Navbar';
import AppFooter from './components/layout/Footer';
import Home from "./pages/Home";
import Courses from "./pages/CoursesPage";

// استيراد ملفات البوتستراب
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.rtl.min.css';






function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.dir();
    document.body.dir = dir;
    document.body.lang = i18n.language;
    document.getElementsByTagName('html')[0].setAttribute('dir', dir);
  }, [i18n, i18n.language]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen">
        <AppNavbar isLoggedIn={false} userName="Ahmed Hassan" />

        <Routes>
          {/* الصفحة الرئيسية: الـ Hero بره الـ container عشان ياخد العرض الكامل */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
        </Routes>
      </div>
      <AppFooter />
    </Router>
  );
}

export default App;