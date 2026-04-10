import { Container, Accordion } from "react-bootstrap";
import "./FAQ.css";

const faqData = [
  {
    id: "0",
    question: "What device specifications do I need?",
    answer:
      "Simply browse our courses, choose a program, and enroll online. You can also take our free career assessment quiz to find the best path for you, or book a free consultation with our advisors.",
  },
  {
    id: "1",
    question: "Is this field in demand in the job market?",
    answer:
      "Simply browse our courses, choose a program, and enroll online. You can also take our free career assessment quiz to find the best path for you, or book a free consultation with our advisors.",
  },
  {
    id: "2",
    question: "How can I start?",
    answer:
      "Simply browse our courses, choose a program, and enroll online. You can also take our free career assessment quiz to find the best path for you, or book a free consultation with our advisors.",
  },
  {
    id: "3",
    question: "What are the required device specifications?",
    answer:
      "Simply browse our courses, choose a program, and enroll online. You can also take our free career assessment quiz to find the best path for you, or book a free consultation with our advisors.",
  },
];

function FAQ() {
  return (
    <section className="faq-section">
      <Container>
        <div className="faq-header">
          <span>Frequently asked questions</span>
          <h2>Most Common Question?</h2>
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
