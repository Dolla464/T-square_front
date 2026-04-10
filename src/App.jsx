import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppNavbar from './components/layout/Navbar';
import AppFooter from './components/layout/Footer';
import Home from "./pages/Home";

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
  }, [i18n.language]);

  return (
    <Router>
      <div className="min-h-screen">
        <AppNavbar isLoggedIn={false} userName="Ahmed Hassan" />

        <Routes>
          {/* الصفحة الرئيسية: الـ Hero بره الـ container عشان ياخد العرض الكامل */}
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
      <AppFooter />
    </Router>
  );
}

export default App;