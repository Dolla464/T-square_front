import { useState, useEffect, useMemo } from "react";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

import logoWhite from "../../assets/logo-white.webp";
import logoDark from "../../assets/logo-dark.webp";

function AppNavbar({ isLoggedIn, userName }) {
  const { t, i18n } = useTranslation(["navbar", "common", "user"]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isHome = location.pathname === "/";

  // 1. حساب حالة الشفافية (صححنا الخطأ هنا)
  const isTransparent = useMemo(() => {
    return isHome && !scrolled && !mobileMenuOpen && !isLoggedIn;
  }, [isHome, scrolled, mobileMenuOpen, isLoggedIn]);

  // 2. تحديد الثيم (ضيف أو مشترك)
  const navThemeClass = isLoggedIn
    ? "nav-white-bg"
    : isTransparent
      ? "nav-transparent"
      : "nav-black-bg";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
      await logout();
    navigate("/");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);
    const newDir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = newDir;
    document.documentElement.lang = newLang;
  };

  return (
    <Navbar
      expand="lg"
      expanded={mobileMenuOpen}
      onToggle={setMobileMenuOpen}
      fixed="top"
      className={`py-1 transition-all ${navThemeClass} ${!isTransparent && "shadow-sm"}`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            // تبديل اللوجو: أبيض للمشترك، أسود للضيف (في الشفافية فقط)
            src={isLoggedIn ? logoDark : logoWhite}
            alt="T-Square Logo"
            height="55"
            fetchPriority="high"
            loading="eager"
          />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="custom-toggler border-0 shadow-none"
        >
          <span
            className={`hamburger ${isLoggedIn ? "text-dark" : "text-white"}`}
          >
            ☰
          </span>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-lg-auto fw-medium text-center">
            {["home", "courses", "solutions", "team", "contact"].map((item) => (
              <Nav.Link
                key={item}
                as={NavLink}
                to={item === "home" ? "/" : `/${item}`}
                className="nav-link-custom px-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(`navbar:${item}`)}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center justify-content-center gap-3">
            <div
              className={`d-flex align-items-center cursor-pointer lang-switch ${isTransparent ? (isLoggedIn ? "text-white" : "text-dark") : "text-dark"}`}
              onClick={toggleLanguage}
            >
              <HiOutlineGlobeAlt size={20} className="me-1" />
              <span className="fw-semibold">
                {i18n.language === "ar" ? "EN" : "AR"}
              </span>
            </div>

            {!isLoggedIn ? (
              <div className="d-flex gap-2">
                <Button
                  variant={isTransparent ? "outline-light" : "outline-light"}
                  className="px-4 fw-bold rounded-3"
                  as={Link}
                  to="/login"
                >
                  {t("common:login")}
                </Button>
                <Button
                  variant="danger"
                  className="px-4 fw-bold rounded-3 border-0"
                  style={{ backgroundColor: "#c51c24" }}
                  as={Link}
                  to="/signup"
                >
                  {t("common:signup")}
                </Button>
              </div>
            ) : (
              <div
                className={`d-flex align-items-center gap-2 border-start ps-lg-3 ${isTransparent ? "border-light" : "border-dark"}`}
              >
                <div
                  className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: "38px", height: "38px" }}
                >
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>

                <NavDropdown
                  title={
                    <span
                      className={isTransparent ? "text-white" : "text-dark"}
                    >
                      {userName}
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                  className="fw-bold"
                >
                  <NavDropdown.Item as={Link} to="/student">
                    {t("user:profile")}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/student/my-courses">
                    {t("user:my_courses")}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    className="text-danger"
                    onClick={handleLogout}
                  >
                    {t("user:logout")}
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
