import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { Link } from 'react-router-dom';

// استيراد اللوجوهات (تأكد من وجود الصور في assets)
import logoWhite from '../../assets/logo-white.png'; // اللوجو الأبيض للخلفية السوداء
import logoDark from '../../assets/logo-dark.png';   // اللوجو الملون للخلفية البيضاء

function AppNavbar({ isLoggedIn, userName }) {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  // تحديد الـ Theme بناءً على حالة تسجيل الدخول
  const navBg = isLoggedIn ? "white" : "transparent";
  const navVariant = isLoggedIn ? "light" : "dark";
  const logo = isLoggedIn ? logoDark : logoWhite;

  return (
    <Navbar 
      bg={navBg} 
      variant={navVariant} 
      expand="lg" 
      className={`py-3 shadow-sm sticky-top ${isLoggedIn ? 'navbar-light' : 'navbar-dark'}`}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="Square Logo" height="60" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto fw-medium">
            <Nav.Link as={Link} to="/" className={isLoggedIn ? "" : "text-white"}>{t('home')}</Nav.Link>
            <Nav.Link as={Link} to="/courses">{t('courses')}</Nav.Link>
            <Nav.Link as={Link} to="/solutions">{t('solutions')}</Nav.Link>
            <Nav.Link as={Link} to="/team">{t('team')}</Nav.Link>
            <Nav.Link as={Link} to="/contact">{t('contact')}</Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-3">
            {/* زر تغيير اللغة */}
            <div 
              className={`d-flex align-items-center cursor-pointer ${isLoggedIn ? 'text-dark' : 'text-white'}`}
              onClick={toggleLanguage} 
              style={{ cursor: 'pointer' }}
            >
              <HiOutlineGlobeAlt size={17} className="mx-1" />
              <span className="fw-normal">{i18n.language === 'ar' ? 'EN' : 'AR'}</span>
            </div>

            {!isLoggedIn ? (
              <div className="d-flex gap-2">
                <Button variant="outline-light" className="px-4 fw-bold rounded-3">
                  Log in
                </Button>
                <Button variant="danger" className="px-4 fw-bold rounded-3" style={{ backgroundColor: '#c51c24' }}>
                  Sign up
                </Button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 border-start ps-3 border-secondary">
                <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '35px', height: '35px' }}>
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <NavDropdown title={userName} id="user-dropdown" align="start" className="fw-bold">
                  <NavDropdown.Item as={Link} to="/profile">{t('profile')}</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/courses">{t('my_courses')}</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item className="text-danger">{t('logout')}</NavDropdown.Item>
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