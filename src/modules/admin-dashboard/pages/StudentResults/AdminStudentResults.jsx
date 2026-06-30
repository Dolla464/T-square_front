import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useAdminExamResults } from "../../hooks/useAdminExamResults";
import StudentExamResultsModal from "./StudentExamResultsModal";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

function ExportBar({ onExport, loading, disabled }) {
  return (
    <div className="d-flex gap-2 flex-wrap">
      <Button
        variant="outline-danger"
        size="sm"
        onClick={() => onExport("pdf")}
        disabled={loading || disabled}
      >
        <i className="bi bi-file-earmark-pdf me-1"></i>PDF
      </Button>
      <Button
        variant="outline-success"
        size="sm"
        onClick={() => onExport("excel")}
        disabled={loading || disabled}
      >
        <i className="bi bi-file-earmark-spreadsheet me-1"></i>Excel
      </Button>
    </div>
  );
}

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
      <div className="ac-page-header mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {t("studentResults.title", "Students Results")}
          </h4>
          <p className="text-muted mb-0 small">
            {t(
              "studentResults.subtitle",
              "View exam results by group and exam"
            )}
          </p>
        </div>
      </div>

      <div className="ac-filters-bar mb-4">
        <Row className="align-items-end g-3">
          <Col xs={12} md={5}>
            <Form.Label className="fw-semibold small text-muted mb-1">
              <i className="bi bi-people me-1"></i>
              {t("studentResults.selectGroup", "Select Group")}
            </Form.Label>
            <Form.Select
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
            </Form.Select>
          </Col>

          <Col xs={12} md={5}>
            <Form.Label className="fw-semibold small text-muted mb-1">
              <i className="bi bi-journal-text me-1"></i>
              {t("studentResults.selectExam", "Select Exam")}
            </Form.Label>
            <Form.Select
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
            </Form.Select>
          </Col>
        </Row>
      </div>

      {!selectedGroupId && (
        <Alert variant="light" className="border text-center py-4">
          <i className="bi bi-funnel fs-3 text-muted d-block mb-2"></i>
          {t("studentResults.emptyGroup", "Select a group to get started.")}
        </Alert>
      )}

      {selectedGroupId && !selectedExamId && loadingExams && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      )}

      {selectedGroupId &&
        !selectedExamId &&
        !loadingExams &&
        exams.length === 0 && (
          <Alert variant="light" className="border text-center py-4">
            <i className="bi bi-journal-x fs-3 text-muted d-block mb-2"></i>
            {t("studentResults.noExams", "No exams found for this group's course.")}
          </Alert>
        )}

      {selectedGroupId &&
        !selectedExamId &&
        !loadingExams &&
        exams.length > 0 && (
          <Alert variant="light" className="border text-center py-4">
            <i className="bi bi-journal-check fs-3 text-muted d-block mb-2"></i>
            {t("studentResults.emptyExam", "Select an exam to view results.")}
          </Alert>
        )}

      {loadingResults && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      )}

      {selectedExamId && !loadingResults && examResults && (
        <>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h6 className="fw-bold mb-1">
                {examResults.group_name}
                {examResults.course_title && (
                  <span className="text-muted fw-normal">
                    {" "}
                    — {examResults.course_title}
                  </span>
                )}
              </h6>
              <div className="text-muted small">
                {examResults.exam_title}
                {examResults.total_marks != null && (
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

          {students.length === 0 ? (
            <Alert variant="info">
              {t("studentResults.noStudents", "No students enrolled in this group.")}
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
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
                      <td className="text-muted">{idx + 1}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
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
              </Table>
            </div>
          )}
        </>
      )}

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
