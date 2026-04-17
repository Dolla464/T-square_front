import { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import "./Navbar.css";

import logoWhite from "../../assets/logo-white.png";
import logoDark from "../../assets/logo-dark.png";

function AppNavbar({ isLoggedIn, userName }) {
  const { t, i18n } = useTranslation(["navbar", "common", "user"]);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
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

  /**
   * المنطق الجديد بناءً على طلبك:
   * 1. لو مسجل دخول (isLoggedIn) -> الخلفية دائماً بيضاء (White) واللوجو دائماً ملون (logoDark).
   * 2. لو زائر (Logout) -> الخلفية شفافة (Transparent) وتتحول لأسود (Black) عند السكرول.
   */
  const isHome = location.pathname === "/";
  const isHomeLoggedIn = isLoggedIn && isHome;
  const isGuest = !isLoggedIn;
  const isGuestHome = isGuest && isHome;
  const isDarkMode = isHomeLoggedIn
    ? scrolled
    : isLoggedIn || (!isHome && !isLoggedIn);

  const textColorClass = isDarkMode ? "text-dark" : "text-light";
  // 1. تحديد لون الخلفية
  const getBgColor = () => {
    // Home + Logged in
    if (isHomeLoggedIn) {
      return scrolled ? "white" : "transparent";
    }

    // Logged in + any page else
    if (isLoggedIn) {
      return "white";
    }

    if (!isHome) {
      return "black";
    }

    if (!isHomeLoggedIn) {
      return scrolled ? "black" : "transparent";
    }
  };
  const navTextColor = isHomeLoggedIn
    ? scrolled
      ? "text-dark"
      : "text-light"
    : isLoggedIn
      ? "text-dark"
      : "text-light";
  // 2. تحديد اللوجو والـ Variant
  const logo = isGuest
    ? logoWhite
    : isHomeLoggedIn
      ? scrolled
        ? logoDark
        : logoWhite
      : isLoggedIn
        ? logoDark
        : logoDark;
  const navVariant = isLoggedIn ? "light" : "dark";
  return (
    <Navbar
      expand="lg"
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

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto fw-medium">
            {["home", "courses", "solutions", "team", "contact"].map((item) => (
              <Nav.Link
                key={item}
                as={NavLink}
                to={item === "home" ? "/" : `/${item}`}
                className="nav-link"
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
              className={`d-flex align-items-center cursor-pointer ${
                isGuest ? "text-light" : textColorClass
              }`}
              onClick={toggleLanguage}
              style={{ cursor: "pointer" }}
            >
              <HiOutlineGlobeAlt size={17} className="mx-1" />
              <span className="fw-normal">
                {i18n.language === "ar" ? "EN" : "AR"}
              </span>
            </div>

            {!isLoggedIn ? (
              <div className="d-flex gap-2">
                <Button
                  variant="outline-light"
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
                className={`d-flex align-items-center gap-2 border-start ps-3 ${
                  isDarkMode ? "border-dark" : "border-light"
                }`}
              >
                {" "}
                <div
                  className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: "35px", height: "35px" }}
                >
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <NavDropdown
                  title={<span className={textColorClass}>{userName}</span>}
                  id="user-dropdown"
                  align="end"
                  className={`fw-bold ${textColorClass}`}
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    {t("user:profile")}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/courses">
                    {t("user:my_courses")}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item className="text-danger">
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
