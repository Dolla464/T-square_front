import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Modal, Spinner, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { showConfirmCustom } from "../../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastWarning } from "../../../../../components/shared/Toaster/toaster";
import { useStudentAttendanceCard } from "../../../hooks/useStudentAttendanceCard";
import { extractInactiveWarning } from "../../../utils/attendanceCardApiErrors";
import AttendanceCardOneTimeModal from "./AttendanceCardOneTimeModal";
import "../StudentAttendanceCard.css";

function StudentAttendanceCardPanel({
  studentId,
  studentName,
  enrollmentNumber,
}) {
  const { t } = useTranslation("adminDashboard");
  const {
    cardStatus,
    statusLoading,
    statusLoadFailed,
    actionLoading,
    loadStatus,
    issueCard,
    reissueCard,
    revokeCard,
  } = useStudentAttendanceCard(studentId);

  const [oneTimeToken, setOneTimeToken] = useState(null);
  const [tokenStudentId, setTokenStudentId] = useState(null);
  const [oneTimeWarnings, setOneTimeWarnings] = useState([]);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeReasonError, setRevokeReasonError] = useState("");
  const tokenPresentationGenRef = useRef(0);

  const clearOneTimeToken = useCallback(() => {
    tokenPresentationGenRef.current += 1;
    setOneTimeToken(null);
    setTokenStudentId(null);
    setOneTimeWarnings([]);
    setShowTokenModal(false);
  }, []);

  useEffect(() => () => clearOneTimeToken(), [clearOneTimeToken]);

  const openIssuedToken = useCallback(
    (data, genAtStart, studentAtStart) => {
      if (!data?.plain_text_token) {
        return false;
      }
      if (genAtStart !== tokenPresentationGenRef.current) {
        return false;
      }
      if (studentAtStart !== studentId) {
        return false;
      }
      setTokenStudentId(studentId);
      setOneTimeToken(data.plain_text_token);
      setOneTimeWarnings(data.warnings ?? []);
      setShowTokenModal(true);
      return true;
    },
    [studentId],
  );

  const notifyTokenNotShownAfterSuccess = useCallback(() => {
    toastWarning(t("students_page.attendance_card.token_not_shown_after_success"));
  }, [t]);

  const handleIssue = async () => {
    const ok = await showConfirmCustom({
      title: t("students_page.attendance_card.confirm_issue_title"),
      message: t("students_page.attendance_card.confirm_issue_message"),
      icon: "question",
      variant: "primary",
      confirmText: t("students_page.attendance_card.confirm_issue_btn"),
    });
    if (!ok || actionLoading) {
      return;
    }
    clearOneTimeToken();
    const genAtStart = tokenPresentationGenRef.current;
    const studentAtStart = studentId;
    const result = await issueCard();
    if (result.outcome === "success" && result.data) {
      if (!openIssuedToken(result.data, genAtStart, studentAtStart)) {
        notifyTokenNotShownAfterSuccess();
      }
    }
  };

  const handleReissue = async () => {
    const ok = await showConfirmCustom({
      title: t("students_page.attendance_card.confirm_reissue_title"),
      message: t("students_page.attendance_card.confirm_reissue_message"),
      icon: "warning",
      variant: "danger",
      confirmText: t("students_page.attendance_card.confirm_reissue_btn"),
    });
    if (!ok || actionLoading) {
      return;
    }
    clearOneTimeToken();
    const genAtStart = tokenPresentationGenRef.current;
    const studentAtStart = studentId;
    const result = await reissueCard();
    if (result.outcome === "success" && result.data) {
      if (!openIssuedToken(result.data, genAtStart, studentAtStart)) {
        notifyTokenNotShownAfterSuccess();
      }
    }
  };

  const handleRevokeSubmit = async () => {
    const trimmed = revokeReason.trim();
    if (trimmed.length > 500) {
      setRevokeReasonError(t("students_page.attendance_card.revoke_reason_too_long"));
      return;
    }
    setRevokeReasonError("");
    if (actionLoading) {
      return;
    }
    const result = await revokeCard(trimmed || undefined);
    if (result.outcome === "success") {
      setShowRevokeModal(false);
      setRevokeReason("");
      clearOneTimeToken();
    }
  };

  const hasActiveCard = Boolean(cardStatus?.has_active_card);
  const card = cardStatus?.card;
  const busy = statusLoading || actionLoading;

  return (
    <div className="ac-table-card mt-4 attendance-card-panel no-print">
      <div className="ac-table-container">
        <div className="d-flex align-items-center justify-content-between mb-3 mt-2">
          <div className="d-flex align-items-center">
            <div
              className="bg-danger rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "40px", height: "40px" }}
            >
              <i className="bi bi-qr-code text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">
                {t("students_page.attendance_card.section_title")}
              </h5>
              <p className="text-muted small mb-0">
                {t("students_page.attendance_card.section_subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div
          className="card border-0 shadow-sm p-4"
          style={{ backgroundColor: "#f8f9fc", borderRadius: "15px" }}
        >
          {statusLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="danger" size="sm" />
              <p className="text-muted small mt-2 mb-0">
                {t("students_page.attendance_card.loading")}
              </p>
            </div>
          ) : statusLoadFailed ? (
            <Alert variant="danger" className="mb-0 border-0">
              <p className="mb-2 small">{t("students_page.attendance_card.load_failed")}</p>
              <Button
                size="sm"
                variant="outline-danger"
                disabled={actionLoading}
                onClick={() => loadStatus()}
              >
                {t("students_page.attendance_card.retry")}
              </Button>
            </Alert>
          ) : (
            <>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="text-secondary small fw-semibold text-uppercase">
                  {t("students_page.attendance_card.status_label")}
                </span>
                {hasActiveCard ? (
                  <span className="badge bg-success-subtle text-success-emphasis rounded-pill px-3 py-2">
                    <i className="bi bi-check-circle me-1" />
                    {t("students_page.attendance_card.status_active")}
                  </span>
                ) : (
                  <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-2">
                    {t("students_page.attendance_card.status_none")}
                  </span>
                )}
              </div>

              {hasActiveCard && card ? (
                <dl className="row mb-4 small">
                  <dt className="col-sm-4 text-muted">
                    {t("students_page.attendance_card.issued_at")}
                  </dt>
                  <dd className="col-sm-8 fw-medium text-dark mb-2">
                    {card.issued_at || "—"}
                  </dd>
                  <dt className="col-sm-4 text-muted">
                    {t("students_page.attendance_card.card_suffix")}
                  </dt>
                  <dd className="col-sm-8 font-monospace mb-0">
                    ••••{card.token_suffix || ""}
                  </dd>
                </dl>
              ) : (
                <p className="text-muted mb-4">
                  {t("students_page.attendance_card.no_card_hint")}
                </p>
              )}

              <p className="text-muted small mb-3">
                {t("students_page.attendance_card.cannot_retrieve_hint")}
              </p>

              <div className="d-flex flex-wrap gap-2">
                {!hasActiveCard ? (
                  <Button
                    variant="danger"
                    disabled={busy}
                    onClick={handleIssue}
                  >
                    {actionLoading ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <i className="bi bi-plus-circle me-2" />
                    )}
                    {t("students_page.attendance_card.issue_btn")}
                  </Button>
                ) : null}

                {hasActiveCard ? (
                  <Button
                    variant="outline-danger"
                    disabled={busy}
                    onClick={handleReissue}
                  >
                    {t("students_page.attendance_card.reissue_btn")}
                  </Button>
                ) : null}

                {hasActiveCard ? (
                  <Button
                    variant="outline-secondary"
                    disabled={busy}
                    onClick={() => setShowRevokeModal(true)}
                  >
                    {t("students_page.attendance_card.revoke_btn")}
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      <AttendanceCardOneTimeModal
        show={showTokenModal && tokenStudentId === studentId && Boolean(oneTimeToken)}
        plainTextToken={tokenStudentId === studentId ? oneTimeToken : null}
        studentName={studentName}
        enrollmentNumber={enrollmentNumber}
        inactiveWarning={extractInactiveWarning(oneTimeWarnings)}
        onClose={clearOneTimeToken}
      />

      <Modal
        show={showRevokeModal}
        onHide={() => !actionLoading && setShowRevokeModal(false)}
        centered
        className="no-print"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("students_page.attendance_card.revoke_modal_title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">{t("students_page.attendance_card.revoke_modal_body")}</p>
          <Form.Group>
            <Form.Label className="small fw-semibold">
              {t("students_page.attendance_card.revoke_reason_label")}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={500}
              value={revokeReason}
              onChange={(e) => {
                setRevokeReason(e.target.value);
                setRevokeReasonError("");
              }}
              placeholder={t("students_page.attendance_card.revoke_reason_placeholder")}
            />
            {revokeReasonError ? (
              <div className="text-danger small mt-1">{revokeReasonError}</div>
            ) : null}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            disabled={actionLoading}
            onClick={() => setShowRevokeModal(false)}
          >
            {t("students_page.attendance_card.cancel")}
          </Button>
          <Button variant="danger" disabled={actionLoading} onClick={handleRevokeSubmit}>
            {actionLoading ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : null}
            {t("students_page.attendance_card.revoke_confirm_btn")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StudentAttendanceCardPanel;
