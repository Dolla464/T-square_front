import { Container, Card, Form, Button, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import tsquareLogo from "../../assets/logo-dark.webp"; // تأكد من مسار اللوجو
import "./Login.css"; // ملف الـ CSS المرفق في الأسفل

function LoginPage() {
  return (
    <div className="login-wrapper">
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Card className="login-card shadow border-0 p-4">
          <Card.Body className="text-center p-0">
            {/* اللوجو */}
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="login-logo mb-3"
                title="Back to Home"
              />
            </Link>

            {/* العنوان */}
            <Card.Title className="fw-bold fs-4 mb-4 text-dark login-title">
              Login
            </Card.Title>

            <Form>
              {/* حقل الإيميل */}
              <Form.Group className="mb-3 text-end login-form-group">
                <Form.Label className="login-label">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="admin@example.com"
                  className="login-input"
                />
              </Form.Group>

              {/* حقل الباسورد */}
              <Form.Group className="mb-2 text-end login-form-group">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label className="login-label">Password</Form.Label>
                  <Nav.Link
                    as={Link}
                    to="/forgot-password"
                    className="forgot-link p-0 login-accent-text"
                  >
                    Forgot password?
                  </Nav.Link>
                </div>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  className="login-input"
                />
              </Form.Group>

              {/* Remember me */}
              <Form.Group className="mb-4 text-start login-remember-group d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  id="remember-me"
                  label="Remember me"
                  className="d-flex align-items-center gap-2"
                />
              </Form.Group>

              {/* زر الدخول */}
              <Button
                type="submit"
                className="login-btn btn-lg w-100 fs-6 fw-bold"
              >
                Sign In
              </Button>
            </Form>

            {/* تسجيل حساب جديد */}
            <Card.Footer className="bg-transparent text-center border-0 mt-3 p-0 login-footer-text">
              <span className="text-muted">Don't have an account? </span>
              <Nav.Link
                as={Link}
                to="/signup"
                className="d-inline p-0 text-danger login-accent-text"
              >
                Sign up now
              </Nav.Link>
            </Card.Footer>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default LoginPage;
