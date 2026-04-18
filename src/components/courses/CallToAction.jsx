import { Container, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./CallToAction.css"; // تأكد من استيراد الملف هنا

function CallToAction() {
  const { t } = useTranslation(["cta", "common"]);

  return (
    <section className="cta-section py-5 my-5">
      <Container className="cta-container text-center py-5">
        <h2 className="cta-title fw-bold text-white mb-3">{t("title")}</h2>
        <p className="cta-description text-white-50 fs-5 mb-5 mx-auto">
          {t("desc")}
        </p>
        <Button
          variant="danger"
          className="cta-btn px-5 py-3 fw-bold rounded-3"
        >
          {t("common:contact_us")}
        </Button>
      </Container>
    </section>
  );
}

export default CallToAction;
