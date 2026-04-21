import { Container, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation("user");

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
      <Button as={Link} to="/" variant="danger" className="mb-3 px-4 py-2 fw-bold rounded-pill">
        Go back (T-Square)
      </Button>
      {/* رسالة في حالة عدم التفعيل */}
      {user && !user.email_verified_at && (
        <Alert variant="warning" className="text-center mb-4 w-100 shadow-sm" style={{ maxWidth: '600px', borderRadius: '10px' }}>
          <Alert.Heading className="mb-3 text-danger"><i className="bi bi-exclamation-triangle-fill me-2"></i>{t("not_activated")}</Alert.Heading>
          <p className="fs-5">{t("not_activated_msg")}</p>

        </Alert>
      )}

      <div style={{ backgroundColor: '#ffcccc', border: '2px solid red', padding: '2rem', borderRadius: '10px', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <h1 style={{ color: 'red', margin: 0 }}>Student Dashboard</h1>
      </div>
    </Container>
  );
};

export default StudentDashboard;
