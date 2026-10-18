import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { showConfirmCustom } from "../../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastError } from "../../../../../components/shared/Toaster/toaster";
import { getApiErrorMessage } from "../../../../../utils/apiErrors";
import { isAbortError } from "../../../../../utils/apiErrors";
import { getGroupAttendanceCardsPreview } from "../../../services/learningGroupServices";
import {
  BULK_UI_STATES,
  useGroupAttendanceCardBulk,
} from "../hooks/useGroupAttendanceCardBulk";
import { BULK_CARD_MODES } from "../bulkCardModes";
import GroupAttendanceCardsBulkPrint from "./GroupAttendanceCardsBulkPrint";
import "./GroupAttendanceCardsBulk.css";

function GroupAttendanceCardsPreviewPanel({ groupId, isArabic }) {
  const { t } = useTranslation("adminDashboard");
  const ns = "groups_page.attendance_cards_preview";

  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState(BULK_CARD_MODES.ISSUE_NEW_ONLY);
  const [selectedPrintIds, setSelectedPrintIds] = useState(() => new Set());
  const [printAllMode, setPrintAllMode] = useState(false);
  const abortRef = useRef(null);
  const groupIdRef = useRef(groupId);
  const bulkNs = "groups_page.attendance_cards_bulk";
  const tRef = useRef(t);
  useLayoutEffect(() => {
    tRef.current = t;
  }, [t]);

  const {
    uiState,
    setUiState,
    operationMeta,
    batchMeta,
    studentOutcomes,
    lastError,
    tokensByStudentId,
    modeNeedsReissueConfirm,
    clearTokens,
    resetOperation,
    beginNewOperation,
    runBatch,
    recoverFromStatus,
  } = useGroupAttendanceCardBulk(groupId);

  useLayoutEffect(() => {
    groupIdRef.current = groupId;
  }, [groupId]);

  const loadPreview = useCallback(async () => {
    const forGroupId = groupId;
    if (!forGroupId) {
      setPreview(null);
      setLoadFailed(false);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setLoadFailed(false);

    try {
      const res = await getGroupAttendanceCardsPreview(forGroupId, {
        signal: controller.signal,
      });
      if (forGroupId !== groupIdRef.current) {
        return;
      }
      setPreview(res?.data ?? null);
      setLoadFailed(false);
    } catch (err) {
      if (isAbortError(err)) {
        return;
      }
      if (forGroupId !== groupIdRef.current) {
        return;
      }
      setPreview(null);
      setLoadFailed(true);
      toastError(getApiErrorMessage(err, tRef.current(`${ns}.load_failed`)));
    } finally {
      if (forGroupId === groupIdRef.current) {
        setLoading(false);
      }
    }
  }, [groupId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch preview when groupId changes
    loadPreview();
    return () => abortRef.current?.abort();
  }, [loadPreview]);

  const counts = preview?.counts ?? {};
  const students = useMemo(
    () => (groupId ? (preview?.students ?? []) : []),
    [groupId, preview?.students],
  );
  const batchMax = preview?.future_batch_max ?? 50;
  const inactiveCount = counts.inactive_students ?? 0;
  const isExecuting = uiState === BULK_UI_STATES.RUNNING_BATCH;

  const previewStudentById = useMemo(() => {
    const map = new Map();
    students.forEach((row) => map.set(row.student_id, row));
    return map;
  }, [students]);

  const printableCards = useMemo(() => {
    return studentOutcomes
      .filter((row) => row.status === "success")
      .map((row) => {
        const previewRow = previewStudentById.get(row.student_id);
        const token = tokensByStudentId.get(row.student_id) ?? null;
        return {
          ...row,
          full_name: previewRow?.full_name ?? `#${row.student_id}`,
          enrollment_number: previewRow?.enrollment_number,
          token,
        };
      });
  }, [previewStudentById, studentOutcomes, tokensByStudentId]);

  if (!groupId) {
    return null;
  }

  const handleExecute = async () => {
    if (!preview || isExecuting) {
      return;
    }

    const needsConfirm = modeNeedsReissueConfirm(mode, preview);
    if (needsConfirm) {
      const ok = await showConfirmCustom({
        title: t(`${bulkNs}.confirm_reissue_title`),
        message: t(`${bulkNs}.confirm_reissue_message`),
        icon: "warning",
        variant: "danger",
        confirmText: t(`${bulkNs}.confirm_reissue_btn`),
      });
      if (!ok) {
        return;
      }
    }

    beginNewOperation();
    clearTokens();
    setSelectedPrintIds(new Set());

    await runBatch({
      mode,
      confirmReissue: needsConfirm,
      preview,
      batchMax: batchMax,
    });
  };

  const handleRecoverStatus = async () => {
    await recoverFromStatus();
  };

  const handlePrintSelected = () => {
    if (printableCards.some((c) => c.token && selectedPrintIds.has(c.student_id))) {
      setPrintAllMode(false);
      setUiState(BULK_UI_STATES.PRINT);
      window.setTimeout(() => window.print(), 50);
    }
  };

  const handlePrintAll = () => {
    if (printableCards.some((c) => c.token)) {
      setPrintAllMode(true);
      setUiState(BULK_UI_STATES.PRINT);
      window.setTimeout(() => window.print(), 50);
    }
  };

  const handleFinish = () => {
    clearTokens();
    resetOperation();
    loadPreview();
  };

  return (
    <div className="ac-table-card mt-4">
      <div className="ac-table-container">
        <div className="d-flex align-items-center mb-3 mt-2">
          <div
            className="bg-danger rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="bi bi-qr-code text-white" />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark">{t(`${ns}.section_title`)}</h5>
            <p className="text-muted small mb-0">{t(`${ns}.section_subtitle`)}</p>
          </div>
        </div>

        <div
          className="card border-0 shadow-sm p-4"
          style={{ backgroundColor: "#f8f9fc", borderRadius: "15px" }}
        >
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="danger" size="sm" />
              <p className="text-muted small mt-2 mb-0">{t(`${ns}.loading`)}</p>
            </div>
          ) : loadFailed ? (
            <Alert variant="danger" className="mb-0 border-0">
              <p className="mb-2 small">{t(`${ns}.load_failed`)}</p>
              <Button size="sm" variant="outline-danger" onClick={loadPreview}>
                {t(`${ns}.retry`)}
              </Button>
            </Alert>
          ) : preview ? (
            <>
              <Alert variant="info" className="border-0 small">
                {t(`${ns}.online_excluded_notice`, {
                  count: counts.excluded_online ?? 0,
                })}
              </Alert>
              <Alert variant="secondary" className="border-0 small">
                {t(`${ns}.batch_max_notice`, { max: batchMax })}
              </Alert>
              {inactiveCount > 0 ? (
                <Alert variant="warning" className="border-0 small">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  {t(`${ns}.inactive_scan_notice`)}
                </Alert>
              ) : null}
              <Alert variant="warning" className="border-0 small">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {t(`${ns}.reissue_warning`)}
              </Alert>

              <div className="row g-2 mb-4">
                {[
                  ["counts_total", counts.total_enrollments],
                  ["counts_eligible", counts.eligible],
                  ["counts_excluded_online", counts.excluded_online],
                  ["counts_active_card", counts.with_active_card],
                  ["counts_no_card", counts.without_active_card],
                  ["counts_inactive", counts.inactive_students],
                ].map(([key, value]) => (
                  <div className="col-6 col-md-4 col-lg-2" key={key}>
                    <div className="bg-white rounded-3 p-2 text-center shadow-sm h-100">
                      <div className="fw-bold text-dark">{value ?? 0}</div>
                      <div className="text-muted small">{t(`${ns}.${key}`)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Form className="mb-4">
                <div className="d-flex flex-column gap-3">
                  <Form.Check
                    type="radio"
                    id="bulk-card-mode-issue-new"
                    name="bulkCardMode"
                    checked={mode === BULK_CARD_MODES.ISSUE_NEW_ONLY}
                    onChange={() => setMode(BULK_CARD_MODES.ISSUE_NEW_ONLY)}
                    label={
                      <>
                        <span className="fw-medium">{t(`${ns}.mode_issue_new`)}</span>
                        <div className="text-muted small">{t(`${ns}.mode_issue_new_hint`)}</div>
                      </>
                    }
                  />
                  <Form.Check
                    type="radio"
                    id="bulk-card-mode-reissue"
                    name="bulkCardMode"
                    checked={mode === BULK_CARD_MODES.REISSUE_ACTIVE_ONLY}
                    onChange={() => setMode(BULK_CARD_MODES.REISSUE_ACTIVE_ONLY)}
                    label={
                      <>
                        <span className="fw-medium">{t(`${ns}.mode_reissue_active`)}</span>
                        <div className="text-muted small">
                          {t(`${ns}.mode_reissue_active_hint`)}
                        </div>
                      </>
                    }
                  />
                  <Form.Check
                    type="radio"
                    id="bulk-card-mode-all"
                    name="bulkCardMode"
                    checked={mode === BULK_CARD_MODES.ISSUE_ALL}
                    onChange={() => setMode(BULK_CARD_MODES.ISSUE_ALL)}
                    label={
                      <>
                        <span className="fw-medium">{t(`${ns}.mode_issue_all`)}</span>
                        <div className="text-muted small">{t(`${ns}.mode_issue_all_hint`)}</div>
                      </>
                    }
                  />
                </div>
              </Form>

              <div className="table-responsive mb-4">
                <table className="table mb-0 align-middle" dir={isArabic ? "rtl" : "ltr"}>
                  <thead>
                    <tr>
                      <th>{t("groups_page.student")}</th>
                      <th>{t(`${ns}.col_enrollment_number`)}</th>
                      <th>{t(`${ns}.col_student_status`)}</th>
                      <th>{t(`${ns}.col_enrollment_status`)}</th>
                      <th>{t(`${ns}.col_card_status`)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          {t("groups_page.no_students_in_group")}
                        </td>
                      </tr>
                    ) : (
                      students.map((row) => (
                        <tr key={row.student_id}>
                          <td className="fw-medium">
                            {row.full_name}
                            {row.student_status === "inactive" ? (
                              <div className="text-warning-emphasis small mt-1">
                                {t(`${ns}.inactive_row_hint`)}
                              </div>
                            ) : null}
                          </td>
                          <td className="font-monospace small">
                            {row.enrollment_number || "—"}
                          </td>
                          <td>
                            {row.student_status === "inactive" ? (
                              <span className="badge bg-warning-subtle text-warning-emphasis">
                                {t(`${ns}.inactive_badge`)}
                              </span>
                            ) : (
                              <span className="text-muted small">
                                {t(`${ns}.student_active`)}
                              </span>
                            )}
                          </td>
                          <td>
                            {row.enrollment?.is_completed
                              ? t("groups_page.student_status_completed")
                              : t("groups_page.student_status_in_progress")}
                          </td>
                          <td>
                            {row.has_active_card ? (
                              <span className="badge bg-success-subtle text-success-emphasis">
                                {t(`${ns}.card_active`)}
                                {row.card?.token_suffix
                                  ? ` ••••${row.card.token_suffix}`
                                  : ""}
                              </span>
                            ) : (
                              <span className="text-muted small">{t(`${ns}.card_none`)}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {uiState === BULK_UI_STATES.UNCERTAIN_BATCH ? (
                <Alert variant="warning" className="border-0 small">
                  {t(`${bulkNs}.uncertain_message`)}
                  {lastError ? (
                    <div className="mt-2 text-muted">{getApiErrorMessage(lastError)}</div>
                  ) : null}
                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline-dark" onClick={handleRecoverStatus}>
                      {t(`${bulkNs}.check_status_btn`)}
                    </Button>
                  </div>
                </Alert>
              ) : null}

              {operationMeta ? (
                <Alert variant="secondary" className="border-0 small">
                  {t(`${bulkNs}.operation_status`, {
                    status: operationMeta.status,
                    batch: (batchMeta?.batch_index ?? 0) + 1,
                  })}
                </Alert>
              ) : null}

              {studentOutcomes.length > 0 ? (
                <div className="table-responsive mb-4 group-attendance-cards-bulk-no-print">
                  <h6 className="fw-bold">{t(`${bulkNs}.results_title`)}</h6>
                  <table className="table mb-0 align-middle" dir={isArabic ? "rtl" : "ltr"}>
                    <thead>
                      <tr>
                        <th>{t("groups_page.student")}</th>
                        <th>{t(`${bulkNs}.col_result`)}</th>
                        <th>{t(`${bulkNs}.col_print`)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentOutcomes.map((row) => {
                        const previewRow = previewStudentById.get(row.student_id);
                        const hasToken = tokensByStudentId.has(row.student_id);
                        return (
                          <tr key={row.sequence}>
                            <td>{previewRow?.full_name ?? row.student_id}</td>
                            <td>
                              <span className="small">{row.status}</span>
                              {row.result_code ? (
                                <span className="text-muted small ms-1">({row.result_code})</span>
                              ) : null}
                              {row.status === "success" && !hasToken ? (
                                <div className="text-warning-emphasis small">
                                  {t(`${bulkNs}.token_unavailable`)}
                                </div>
                              ) : null}
                            </td>
                            <td>
                              {row.status === "success" && hasToken ? (
                                <Form.Check
                                  type="checkbox"
                                  checked={selectedPrintIds.has(row.student_id)}
                                  onChange={(e) => {
                                    setSelectedPrintIds((prev) => {
                                      const next = new Set(prev);
                                      if (e.target.checked) {
                                        next.add(row.student_id);
                                      } else {
                                        next.delete(row.student_id);
                                      }
                                      return next;
                                    });
                                  }}
                                  label={t(`${bulkNs}.select_print`)}
                                />
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <div className="d-flex flex-wrap gap-2 group-attendance-cards-bulk-no-print">
                <Button
                  variant="danger"
                  disabled={isExecuting || (counts.eligible ?? 0) === 0}
                  onClick={handleExecute}
                >
                  {isExecuting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {t(`${bulkNs}.running`)}
                    </>
                  ) : (
                    t(`${bulkNs}.execute_btn`)
                  )}
                </Button>
                {printableCards.some((c) => c.token) ? (
                  <>
                    <Button variant="outline-primary" onClick={handlePrintSelected}>
                      {t(`${bulkNs}.print_selected`)}
                    </Button>
                    <Button variant="outline-secondary" onClick={handlePrintAll}>
                      {t(`${bulkNs}.print_all`)}
                    </Button>
                  </>
                ) : null}
                {studentOutcomes.length > 0 ? (
                  <Button variant="light" onClick={handleFinish}>
                    {t(`${bulkNs}.clear_btn`)}
                  </Button>
                ) : null}
              </div>

              <GroupAttendanceCardsBulkPrint
                cards={printableCards}
                courseTitle={preview.course_title}
                groupName={preview.group_name}
                isArabic={isArabic}
                selectedStudentIds={selectedPrintIds}
                printAll={printAllMode}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default GroupAttendanceCardsPreviewPanel;
