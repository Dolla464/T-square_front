import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner, Table } from "react-bootstrap";
import { useExamGrading } from "../../hooks/useExamGrading";
import { formatExamScore } from "../../../shared-dashboard/utils/formatExamScore";
import "../../../admin-dashboard/components/shared/AdminContentPage/AdminContentPage.css";

function InstructorExamGrading() {
  const { i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language === "ar";
  const { pendingAttempts, loadingList, loadPendingAttempts } = useExamGrading();

  useEffect(() => {
    loadPendingAttempts();
  }, [loadPendingAttempts]);

  return (
    <div className="admin-content-page">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">
            {isArabic ? "تصحيح الامتحانات" : "Exam Grading"}
          </h2>
          <p className="ac-subtitle text-muted mb-0">
            {isArabic
              ? "محاولات تحتوي على أسئلة مقالية بانتظار التصحيح"
              : "Attempts with essay answers awaiting your grading"}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadPendingAttempts}
          disabled={loadingList}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          {isArabic ? "تحديث" : "Refresh"}
        </button>
      </div>

      <div className="ac-table-card">
        <div className="ac-rounded-table p-3 p-md-0">
          {loadingList ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : pendingAttempts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-check2-circle fs-1 d-block mb-3" />
              {isArabic
                ? "لا توجد محاولات بانتظار التصحيح حالياً"
                : "No attempts are pending grading"}
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>{isArabic ? "الطالب" : "Student"}</th>
                  <th>{isArabic ? "الامتحان" : "Exam"}</th>
                  <th>{isArabic ? "الكورس" : "Course"}</th>
                  <th>{isArabic ? "الدرجة الجزئية" : "Partial Score"}</th>
                  <th>{isArabic ? "تاريخ التسليم" : "Submitted At"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pendingAttempts.map((item) => (
                  <tr key={item.attempt_id}>
                    <td>
                      <div className="fw-semibold">{item.student_name}</div>
                      <div className="small text-muted">{item.student_email}</div>
                    </td>
                    <td>{item.exam_title}</td>
                    <td>{item.course_title}</td>
                    <td>{formatExamScore(item.score ?? 0)}</td>
                    <td>{item.finished_at || "—"}</td>
                    <td className="text-end">
                      <Link
                        to={`/instructor/exam-grading/${item.attempt_id}`}
                        className="btn btn-sm btn-danger"
                      >
                        {isArabic ? "تصحيح" : "Grade"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorExamGrading;
