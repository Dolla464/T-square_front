import { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { Link } from "react-router-dom";

import logoWhite from "../../assets/logo-white.png";
import logoDark from "../../assets/logo-dark.png";

function AppNavbar({ isLoggedIn, userName }) {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

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
  };

  /**
   * المنطق الجديد بناءً على طلبك:
   * 1. لو مسجل دخول (isLoggedIn) -> الخلفية دائماً بيضاء (White) واللوجو دائماً ملون (logoDark).
   * 2. لو زائر (Logout) -> الخلفية شفافة (Transparent) وتتحول لأسود (Black) عند السكرول.
   */

  // 1. تحديد لون الخلفية
  const getBgColor = () => {
    if (isLoggedIn) return "white"; // لو مسجل دخول، أبيض على طول
    return scrolled ? "black" : "transparent"; // لو زائر، شفاف بيقلب أسود
  };

  // 2. تحديد اللوجو والـ Variant
  const logo = isLoggedIn ? logoDark : scrolled ? logoWhite : logoWhite;
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
        borderBottom: isLoggedIn ? "1px solid #eee" : "none", // خط خفيف في حالة الأبيض عشان يفصل عن الصفحة
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="Square Logo" height="60" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto fw-medium">
            {/* اللينكات: لو مسجل دخول تكون سوداء، لو زائر تكون بيضاء */}
            {["home", "courses", "solutions", "team", "contact"].map((item) => (
              <Nav.Link
                key={item}
                as={Link}
                to={item === "home" ? "/" : `/${item}`}
                className={isLoggedIn ? "text-dark" : "text-white"}
              >
                {t(item)}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-3">
            <div
              className={`d-flex align-items-center cursor-pointer ${isLoggedIn ? "text-dark" : "text-white"}`}
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
                >
                  Log in
                </Button>
                <Button
                  variant="danger"
                  className="px-4 fw-bold rounded-3 border-0"
                  style={{ backgroundColor: "#c51c24" }}
                >
                  Sign up
                </Button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 border-start ps-3 border-dark">
                <div
                  className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: "35px", height: "35px" }}
                >
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <NavDropdown
                  title={<span className="text-dark">{userName}</span>}
                  id="user-dropdown"
                  align="end"
                  className="fw-bold"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    {t("profile")}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/courses">
                    {t("my_courses")}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item className="text-danger">
                    {t("logout")}
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
