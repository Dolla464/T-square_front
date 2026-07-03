import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useAdminExamResults } from "../../hooks/useAdminExamResults";
import ExportBar from "../../components/shared/ExportBar";
import { selectClass } from "../../components/shared/adminUiStyles";
import StudentExamResultsModal from "./StudentExamResultsModal";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

function ResultStatusBadge({ student, t }) {
  if (!student.has_attempts) {
    return (
      <span className="badge rounded-pill px-2 py-1 bg-secondary-subtle text-secondary">
        {t("studentResults.noAttemptsShort", "No attempts")}
      </span>
    );
  }

  const passed = student.is_passed;
  return (
    <span
      className={`badge rounded-pill px-2 py-1 ${
        passed ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
      }`}
    >
      <i
        className={`bi ${passed ? "bi-check-circle-fill" : "bi-x-circle-fill"} me-1`}
      ></i>
      {passed
        ? t("studentResults.passed", "Passed")
        : t("studentResults.failed", "Failed")}
    </span>
  );
}

function AdminStudentResults() {
  const { t } = useTranslation("adminDashboard");

  const {
    selectionGroups,
    exams,
    examResults,
    loadingGroups,
    loadingExams,
    loadingResults,
    exportLoading,
    loadGroups,
    loadExams,
    loadExamResults,
    handleExportResults,
    resetExamData,
  } = useAdminExamResults();

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [modalStudent, setModalStudent] = useState(null);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!selectedGroupId) {
      resetExamData();
      setSelectedExamId("");
      return;
    }

    setSelectedExamId("");
    setModalStudent(null);
    loadExams(selectedGroupId);
  }, [selectedGroupId, loadExams, resetExamData]);

  useEffect(() => {
    if (!selectedGroupId || !selectedExamId) return;
    loadExamResults(selectedGroupId, selectedExamId);
  }, [selectedGroupId, selectedExamId, loadExamResults]);

  const students = examResults?.students ?? [];
  const canExport = Boolean(
    selectedGroupId && selectedExamId && students.length
  );

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
    setSelectedExamId("");
    setModalStudent(null);
  };

  const handleExamChange = (e) => {
    setSelectedExamId(e.target.value);
    setModalStudent(null);
  };

  const openStudentModal = (student) => {
    setModalStudent({
      studentId: student.student_id,
      studentName: student.full_name,
      email: student.email,
    });
  };

  const formatHighestScore = (student) => {
    if (!student.has_attempts || student.highest_score == null) return "—";
    const total = examResults?.total_marks;
    return total != null
      ? `${student.highest_score} / ${total}`
      : String(student.highest_score);
  };

  return (
    <div className="admin-content-page">
      {/* Header */}
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">
            {t("studentResults.title", "Students Results")}
          </h2>
          <p className="ac-subtitle text-muted mb-0">
            {t(
              "studentResults.subtitle",
              "View exam results by group and exam"
            )}
          </p>
        </div>
      </div>

      <div className="ac-table-card">
        <div className="ac-rounded-table p-3 p-md-0">
          <div className="ac-filters-bar d-flex flex-column gap-3 mb-3">
            <div className="d-flex flex-column flex-md-row align-items-end gap-3 flex-wrap">
              {/* Select Group */}
              <div>
                <label className="fw-semibold small text-muted mb-1 d-block">
                  <i className="bi bi-people me-1"></i>
                  {t("studentResults.selectGroup", "Select Group")}
                </label>
                <select
                  className={selectClass(!!selectedGroupId)}
                  value={selectedGroupId}
                  onChange={handleGroupChange}
                  disabled={loadingGroups}
                >
                  <option value="">
                    {t("studentResults.chooseGroup", "Choose a group…")}
                  </option>
                  {selectionGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Exam */}
              <div>
                <label className="fw-semibold small text-muted mb-1 d-block">
                  <i className="bi bi-journal-text me-1"></i>
                  {t("studentResults.selectExam", "Select Exam")}
                </label>
                <select
                  className={selectClass(!!selectedExamId)}
                  value={selectedExamId}
                  onChange={handleExamChange}
                  disabled={!selectedGroupId || loadingExams}
                >
                  <option value="">
                    {selectedGroupId
                      ? t("studentResults.chooseExam", "Choose an exam…")
                      : t("studentResults.selectGroupFirst", "Select a group first")}
                  </option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!selectedGroupId && (
            <div className="text-center py-5">
              <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64, background: "#f3f4f6", color: "#6b7280" }}>
                <i className="bi bi-people" style={{ fontSize: "2rem" }}></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">{t("studentResults.selectGroup", "Select Group")}</h5>
              <p className="small text-muted mb-0">{t("studentResults.emptyGroup", "Select a group to get started.")}</p>
            </div>
          )}

          {selectedGroupId && !selectedExamId && loadingExams && (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {selectedGroupId &&
            !selectedExamId &&
            !loadingExams &&
            exams.length === 0 && (
              <div className="text-center py-5">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64, background: "#fff1f2", color: "#be1522" }}>
                  <i className="bi bi-journal-x" style={{ fontSize: "2rem" }}></i>
                </div>
                <h5 className="fw-bold text-dark mb-1">No Exams Found</h5>
                <p className="small text-muted mb-0">{t("studentResults.noExams", "No exams found for this group's course.")}</p>
              </div>
            )}

          {selectedGroupId &&
            !selectedExamId &&
            !loadingExams &&
            exams.length > 0 && (
              <div className="text-center py-5">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64, background: "#f3f4f6", color: "#6b7280" }}>
                  <i className="bi bi-journal-check" style={{ fontSize: "2rem" }}></i>
                </div>
                <h5 className="fw-bold text-dark mb-1">{t("studentResults.selectExam", "Select Exam")}</h5>
                <p className="small text-muted mb-0">{t("studentResults.emptyExam", "Select an exam to view results.")}</p>
              </div>
            )}

          {selectedExamId && (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 px-3 px-md-4">
                <div>
                  <h6 className="fw-bold mb-1">
                    {examResults?.group_name || "..."}
                    {examResults?.course_title && (
                      <span className="text-muted fw-normal">
                        {" "}
                        — {examResults.course_title}
                      </span>
                    )}
                  </h6>
                  <div className="text-muted small">
                    {examResults?.exam_title || "..."}
                    {examResults?.total_marks != null && (
                      <span>
                        {" "}
                        | {t("studentResults.totalMarks", "Total")}:{" "}
                        {examResults.total_marks}
                      </span>
                    )}
                  </div>
                </div>
                <ExportBar
                  onExport={(format) =>
                    handleExportResults(selectedGroupId, selectedExamId, format)
                  }
                  loading={exportLoading}
                  disabled={!canExport}
                />
              </div>

              {loadingResults || !examResults ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-danger text-center" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64, background: "#fff1f2", color: "#be1522" }}>
                    <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-1">No Students Found</h5>
                  <p className="small text-muted mb-0">{t("studentResults.noStudents", "No students enrolled in this group.")}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>#</th>
                        <th>{t("studentResults.studentName", "Student Name")}</th>
                        <th>{t("studentResults.highestScore", "Highest Score")}</th>
                        <th>{t("studentResults.status", "Status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => (
                        <tr key={student.student_id}>
                          <td className="text-muted small">{idx + 1}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-decoration-none fw-semibold text-dark"
                              style={{ fontSize: "0.9rem" }}
                              onClick={() => openStudentModal(student)}
                            >
                              {student.full_name}
                            </button>
                            {student.email && (
                              <div className="text-muted small">{student.email}</div>
                            )}
                          </td>
                          <td>
                            <span className="fw-semibold">
                              {formatHighestScore(student)}
                            </span>
                            {student.attempts_count > 0 && (
                              <div className="text-muted small">
                                {t("studentResults.attemptsCount", {
                                  count: student.attempts_count,
                                  defaultValue: `${student.attempts_count} attempt(s)`,
                                })}
                              </div>
                            )}
                          </td>
                          <td>
                            <ResultStatusBadge student={student} t={t} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <StudentExamResultsModal
        show={Boolean(modalStudent)}
        groupId={selectedGroupId}
        examId={selectedExamId}
        studentId={modalStudent?.studentId}
        studentName={modalStudent?.studentName}
        examTitle={examResults?.exam_title}
        totalMarks={examResults?.total_marks}
        onHide={() => setModalStudent(null)}
      />
    </div>
  );
}

export default AdminStudentResults;
