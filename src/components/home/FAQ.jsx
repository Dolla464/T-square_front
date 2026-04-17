import { Container, Accordion } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./FAQ.css";

function FAQ() {
  const { t } = useTranslation("faq");
  const faqData = t("questions", { returnObjects: true });

  return (
    <section className="faq-section">
      <Container>
        <div className="faq-header">
          <span>{t("badge")}</span>
          <h2>{t("title")}</h2>
        </div>

        <Accordion className="faq-accordion" defaultActiveKey="1">
          {faqData.map((item) => (
            <Accordion.Item eventKey={item.id} key={item.id}>
              <Accordion.Header>{item.question}</Accordion.Header>
              <Accordion.Body>{item.answer}</Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

export default FAQ;
