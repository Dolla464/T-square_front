import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { useExamActivation } from "../../hooks/useExamActivation";
import { selectClass } from "../../../admin-dashboard/components/shared/adminUiStyles";
import "../../../admin-dashboard/components/shared/AdminContentPage/AdminContentPage.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";

function InstructorExamActivation() {
  const { t, i18n } = useTranslation("instructorDashboard");
  const isArabic = isArabicLocale(i18n.language);

  const {
    selectionGroups,
    exams,
    loadingGroups,
    loadingExams,
    togglingExamId,
    loadGroups,
    loadExams,
    handleToggleActivation,
    resetExamData,
  } = useExamActivation();

  const [selectedGroupId, setSelectedGroupId] = useState("");

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!selectedGroupId) {
      resetExamData();
      return;
    }
    loadExams(selectedGroupId);
  }, [selectedGroupId, loadExams, resetExamData]);

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
  };

  return (
    <div className="admin-content-page">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">
            {t("examActivation.title")}
          </h2>
          <p className="ac-subtitle text-muted mb-0">
            {t("examActivation.subtitle")}
          </p>
        </div>
      </div>

      <div className="ac-table-card">
        <div className="ac-rounded-table p-3 p-md-0">
          <div className="ac-filters-bar d-flex flex-column gap-3 mb-3">
            <section className="d-flex flex-column flex-md-row align-items-end gap-3 flex-wrap w-100">
              <div className="w-100 w-md-auto">
                <label className="fw-semibold small text-muted mb-1 d-block">
                  <i className="bi bi-people me-1"></i>
                  {t("examActivation.selectGroup")}
                </label>
                <select
                  className={`w-100 w-md-auto ${selectClass(!!selectedGroupId)}`}
                  value={selectedGroupId}
                  onChange={handleGroupChange}
                  disabled={loadingGroups}
                  style={{ minWidth: "11rem", flex: "0 0 auto" }}
                >
                  <option value="">
                    {t("examActivation.chooseGroup")}
                  </option>
                  {selectionGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          </div>

          {!selectedGroupId && (
            <div className="text-center py-5 text-muted">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 64,
                  height: 64,
                  background: "#f3f4f6",
                  color: "#6b7280",
                }}
              >
                <i className="bi bi-people fs-3"></i>
              </div>
              <p className="mb-0">
                {t("examActivation.selectGroupHint")}
              </p>
            </div>
          )}

          {selectedGroupId && loadingExams && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          )}

          {selectedGroupId && !loadingExams && exams.length === 0 && (
            <div className="text-center py-5 text-muted">
              <p className="mb-0">
                {t("examActivation.noExams")}
              </p>
            </div>
          )}

          {selectedGroupId && !loadingExams && exams.length > 0 && (
            <Table responsive hover className="align-middle mb-0" dir={isArabic ? "rtl" : "ltr"}>
              <thead>
                <tr>
                  <th>{t("examActivation.examTitle")}</th>
                  <th>{t("examActivation.globalStatus")}</th>
                  <th className="text-center">
                    {t("examActivation.groupActivation")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => {
                  const canToggle = exam.is_active;
                  const isToggling = togglingExamId === exam.id;

                  return (
                    <tr key={exam.id}>
                      <td>
                        <div className="fw-semibold">{exam.title}</div>
                        <small className="text-muted">
                          {exam.total_marks != null
                            ? `${exam.total_marks} ${t("examActivation.marksUnit")}`
                            : ""}
                        </small>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill px-2 py-1 ${
                            exam.is_active
                              ? "bg-success-subtle text-success"
                              : "bg-secondary-subtle text-secondary"
                          }`}
                        >
                          {exam.is_active
                            ? t("examActivation.active")
                            : t("examActivation.inactive")}
                        </span>
                      </td>
                      <td className="text-center">
                        <Form.Check
                          type="switch"
                          id={`exam-activation-${exam.id}`}
                          checked={!!exam.is_activated_for_group}
                          disabled={!canToggle || isToggling}
                          onChange={() =>
                            handleToggleActivation(selectedGroupId, exam)
                          }
                          title={
                            !canToggle
                              ? t("examActivation.enableGlobalFirst")
                              : ""
                          }
                        />
                        {isToggling && (
                          <Spinner
                            animation="border"
                            size="sm"
                            className="ms-2"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorExamActivation;
