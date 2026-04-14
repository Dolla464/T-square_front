import { Container, Card, Form, Button, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import tsquareLogo from "../../assets/logo-dark.webp";
import "./Signup.css";

function SignupPage() {
  return (
    <div className="signup-wrapper">
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Card className="signup-card shadow border-0 p-4">
          <Card.Body className="text-center p-0">
            {/* اللوجو */}
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="signup-logo mb-3"
                title="Back to Home"
              />
            </Link>

            {/* العنوان */}
            <Card.Title className="fw-bold fs-4 mb-4 text-dark signup-title">
              Sign up
            </Card.Title>

            <Form>
              {/* حقل الاسم */}
              <Form.Group className="mb-3 text-end signup-form-group">
                <Form.Label className="signup-label">Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Your full name"
                  className="signup-input"
                />
              </Form.Group>

              {/* حقل رقم الهاتف */}
              <Form.Group className="mb-3 text-end signup-form-group">
                <Form.Label className="signup-label">Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="+20 |"
                  className="signup-input"
                />
              </Form.Group>

              {/* حقل الإيميل */}
              <Form.Group className="mb-3 text-end signup-form-group">
                <Form.Label className="signup-label">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="admin@example.com"
                  className="signup-input"
                />
              </Form.Group>

              {/* حقل الباسورد */}
              <Form.Group className="mb-4 text-end signup-form-group">
                <Form.Label className="signup-label">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  className="signup-input"
                />
              </Form.Group>

              {/* زر التسجيل */}
              <Button
                type="submit"
                className="signup-btn btn-lg w-100 fs-6 fw-bold"
              >
                Sign up
              </Button>
            </Form>

            {/* العودة لتسجيل الدخول */}
            <Card.Footer className="bg-transparent text-center border-0 mt-3 p-0 signup-footer-text">
              <span className="text-muted">Already have an account? </span>
              <Nav.Link
                as={Link}
                to="/login"
                className="d-inline p-0 text-danger signup-accent-text"
              >
                Sign in
              </Nav.Link>
            </Card.Footer>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default SignupPage;
