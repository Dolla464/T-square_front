import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner, Table } from "react-bootstrap";
import { useExamGrading } from "../../hooks/useExamGrading";
import { formatExamScore } from "../../../shared-dashboard/utils/formatExamScore";
import "../../../admin-dashboard/components/shared/AdminContentPage/AdminContentPage.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";

function InstructorExamGrading() {
  const { t, i18n } = useTranslation("instructorDashboard");
  const isArabic = isArabicLocale(i18n.language);
  const { pendingAttempts, loadingList, loadPendingAttempts } = useExamGrading();

  useEffect(() => {
    loadPendingAttempts();
  }, [loadPendingAttempts]);

  return (
    <div className="admin-content-page">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">
            {t("exam_grading_page.title")}
          </h2>
          <p className="ac-subtitle text-muted mb-0">
            {t("exam_grading_page.subtitle")}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadPendingAttempts}
          disabled={loadingList}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          {t("exam_grading_page.refresh")}
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
              {t("exam_grading_page.noPending")}
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle" dir={isArabic ? "rtl" : "ltr"}>
              <thead>
                <tr>
                  <th>{t("exam_grading_page.student")}</th>
                  <th>{t("exam_grading_page.exam")}</th>
                  <th>{t("exam_grading_page.course")}</th>
                  <th>{t("exam_grading_page.partialScore")}</th>
                  <th>{t("exam_grading_page.submittedAt")}</th>
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
                        {t("exam_grading_page.grade")}
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
