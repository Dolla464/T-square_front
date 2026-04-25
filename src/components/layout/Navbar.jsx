import { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { useAuth } from "../../contexts/AuthContext";
import { showLogoutConfirm } from "../shared/ConfirmDialog/confirmDialog";
import { toastCustom } from "../shared/Toaster/toaster";
import "./Navbar.css";

import logoWhite from "../../assets/logo-white.png";
import logoDark from "../../assets/logo-dark.png";

function AppNavbar({ isLoggedIn, userName }) {
  const { t, i18n } = useTranslation(["navbar", "common", "user"]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    // عرض نافذة التأكيد قبل تسجيل الخروج
    const confirmed = await showLogoutConfirm();
    if (!confirmed) return;

    // تسجيل الخروج وعرض إشعار الوداع
    logout();
    toastCustom({
      message: i18n.language === "ar" ? "تم تسجيل الخروج بنجاح" : "Logged out successfully",
      type: "info",
      bsIcon: "bi-box-arrow-right",
      duration: 3000,
    });
    navigate('/');
  };



  // Reset mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setScrolled(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);

    // Persist language selection to localStorage
    localStorage.setItem("i18nextLng", newLang);

    // Update DOM immediately

    const newDir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = newDir;
    document.documentElement.lang = newLang;
    document.body.dir = newDir;
    document.body.lang = newLang;
  };

  const isHome = location.pathname === "/";
  const isHomeLoggedIn = isLoggedIn && isHome;
  const isGuest = !isLoggedIn;
  const isGuestHome = isGuest && isHome;
  const isDarkMode = isHomeLoggedIn
    ? scrolled
    : isLoggedIn || (!isHome && !isLoggedIn);

  const textColorClass =
    isHomeLoggedIn && !scrolled
      ? "light"
      : mobileMenuOpen && !scrolled && isHomeLoggedIn
        ? "text-dark"
        : isDarkMode
          ? "text-dark"
          : "text-light"; // 1. تحديد لون الخلفية
  const getBgColor = () => {
    // Home + Logged in
    if (isHomeLoggedIn) {
      return mobileMenuOpen || scrolled ? "white" : "transparent";
    }

    // Logged in + any page else
    if (isLoggedIn) {
      return "white";
    }

    if (!isHome) {
      return "black";
    }

    if (!isHomeLoggedIn) {
      return mobileMenuOpen || scrolled ? "black" : "transparent";
    }
  };
  const navTextColor = isHomeLoggedIn
    ? mobileMenuOpen || scrolled
      ? "text-dark"
      : "text-light"
    : isLoggedIn
      ? "text-dark"
      : "text-light";
  // 2. تحديد اللوجو والـ Variant
  const logo = isGuest
    ? logoWhite
    : isHomeLoggedIn
      ? mobileMenuOpen || scrolled
        ? logoDark
        : logoWhite
      : isLoggedIn
        ? logoDark
        : logoDark;

  const Tbtn =
    isLoggedIn && !scrolled && mobileMenuOpen
      ? "dark"
      : isLoggedIn && scrolled
        ? "dark"
        : !scrolled && isHome
          ? "light"
          : scrolled || isGuest
            ? "light"
            : "";

  const navVariant = getBgColor() === "transparent" ? "dark" : "light";
  const handleToggle = (expanded) => {
    setMobileMenuOpen(expanded);
  };

  const handleNavLinkClick = () => {
    setMobileMenuOpen(false);
  };
  return (
    <Navbar
      expand="lg"
      expanded={mobileMenuOpen}
      onToggle={handleToggle}
      fixed="top"
      variant={navVariant}
      className={`py-1 transition-all ${scrolled || isLoggedIn ? "shadow-sm" : ""}`}
      style={{
        backgroundColor: getBgColor(),
        transition: "background-color 0.4s ease-in-out, padding 0.4s ease",
        borderBottom: isLoggedIn ? "1px solid #eee" : "none",
        // خط خفيف في حالة الأبيض عشان يفصل عن الصفحة
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="Square Logo" height="60" />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="custom-toggler"
        >
          <span className={`hamburger ${Tbtn} `}>☰</span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-lg-auto fw-medium text-center">
            {" "}
            {["home", "courses", "solutions", "team", "contact"].map((item) => (
              <Nav.Link
                key={item}
                as={NavLink}
                to={item === "home" ? "/" : `/${item}`}
                className="nav-link"
                onClick={handleNavLinkClick}
                style={({ isActive }) => ({
                  color: isActive
                    ? "red"
                    : isGuestHome
                      ? "white"
                      : navTextColor === "text-dark"
                        ? "black"
                        : "white",
                  fontWeight: isActive ? "700" : "500",
                })}
              >
                {t(`navbar:${item}`)}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-3">
            <div
              className={`d-flex align-items-center cursor-pointer lang-switch ${Tbtn
                }`}
              onClick={toggleLanguage}
            >
              <HiOutlineGlobeAlt size={20} className="me-1" />

              <span className="fw-semibold fs-6">
                {i18n.language === "ar" ? "EN" : "AR"}
              </span>
            </div>

            {!isLoggedIn ? (
              <div className="d-flex gap-2">
                <Button
                  variant={"outline-light"}
                  className="px-4 fw-bold rounded-3 login-custom"
                  as={Link}
                  to="/login"
                >
                  {t("common:login")}
                </Button>
                <Button
                  variant="danger"
                  className="px-4 fw-bold rounded-3 border-0 "
                  style={{ backgroundColor: "#c51c24" }}
                  as={Link}
                  to="/signup"
                >
                  {t("common:signup")}
                </Button>
              </div>
            ) : (
              <div
                className={`d-flex align-items-center gap-2 border-start ps-md-3 ${isDarkMode ? "border-dark" : "border-light"
                  }`}
              >
                <div
                  className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: "35px", height: "35px" }}
                >
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>

                {/* الإشعار لو الحساب مش متفعل */}
                {user && !user.email_verified_at && (
                  <i
                    className="bi bi-exclamation-circle-fill text-warning fs-5"
                    title={t("user:not_activated")}
                    style={{ cursor: "help" }}
                  ></i>
                )}
                <NavDropdown
                  title={<span className={Tbtn}>{userName}</span>}
                  id="user-dropdown"
                  align="end"
                  className={`fw-bold ${Tbtn}`}
                >
                  <NavDropdown.Item as={Link} to="/student">
                    {t("user:profile")}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/student">
                    {t("user:my_courses")}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item className="text-danger" onClick={handleLogout}>
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