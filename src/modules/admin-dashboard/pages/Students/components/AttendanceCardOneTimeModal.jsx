import { Modal, Button } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { isArabicLocale } from "../../../../../utils/isArabicLocale";
import "../StudentAttendanceCard.css";

function AttendanceCardOneTimeModal({
  show,
  onClose,
  plainTextToken,
  studentName,
  enrollmentNumber,
  inactiveWarning,
}) {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = isArabicLocale(i18n.language);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    onClose();
  };

  if (!plainTextToken) {
    return null;
  }

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="lg"
        className="attendance-card-onetime-modal"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="border-0 pb-0 no-print">
          <Modal.Title className="fw-bold">
            {t("students_page.attendance_card.one_time_title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <div className="alert alert-warning border-0 rounded-3 mb-4 no-print">
            <i className="bi bi-exclamation-triangle-fill me-2" />
            {t("students_page.attendance_card.one_time_warning")}
          </div>

          {inactiveWarning ? (
            <div className="alert alert-danger-subtle text-danger-emphasis border-0 rounded-3 mb-4 no-print">
              {inactiveWarning.message ||
                t("students_page.attendance_card.inactive_scan_warning")}
            </div>
          ) : null}

          <div
            id="attendance-card-print-root"
            className="attendance-card-print-area mx-auto text-center"
          >
            <p className="text-muted small mb-1">
              {t("students_page.attendance_card.print_label")}
            </p>
            <h5 className="fw-bold mb-1">{studentName}</h5>
            {enrollmentNumber ? (
              <p className="text-secondary mb-3">
                {t("students_page.table_enrollment")}: {enrollmentNumber}
              </p>
            ) : null}
            <div className="attendance-card-qr-frame d-inline-block p-3 bg-white border rounded-4 shadow-sm">
              <QRCodeSVG
                value={plainTextToken}
                size={240}
                level="M"
                includeMargin
              />
            </div>
            <p className="small text-muted mt-3 mb-0 px-3">
              {t("students_page.attendance_card.print_instructions")}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2 no-print">
          <Button variant="outline-secondary" onClick={handleClose}>
            {t("students_page.attendance_card.done")}
          </Button>
          <Button variant="danger" onClick={handlePrint}>
            <i className="bi bi-printer me-2" />
            {t("students_page.attendance_card.print")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Screen-only hint for RTL */}
      <span className="visually-hidden" lang={isArabic ? "ar" : "en"} />
    </>
  );
}

export default AttendanceCardOneTimeModal;
