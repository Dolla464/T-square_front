import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import AttemptAnswerReview from "../../../shared-dashboard/components/AttemptAnswerReview/AttemptAnswerReview";
import { useExamGrading } from "../../hooks/useExamGrading";
import { formatExamScore } from "../../../shared-dashboard/utils/formatExamScore";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import "../../../shared-dashboard/components/AttemptAnswerReview/attemptReview.css";
import "../../../admin-dashboard/components/shared/AdminContentPage/AdminContentPage.css";

function GradeAttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language === "ar";

  const {
    loadingAttempt,
    submitting,
    loadAttemptForGrading,
    gradeAttempt,
  } = useExamGrading();

  const [review, setReview] = useState(null);
  const [gradingValues, setGradingValues] = useState({});

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await loadAttemptForGrading(attemptId);
      if (!active) return;
      setReview(data);

      const initial = {};
      (data?.questions ?? []).forEach((question) => {
        if (
          question.type === "essay" &&
          question.result_status === "pending_grading" &&
          question.answer_id
        ) {
          initial[question.answer_id] = "";
        }
      });
      setGradingValues(initial);
    };

    load();

    return () => {
      active = false;
    };
  }, [attemptId, loadAttemptForGrading]);

  const pendingEssayAnswers = useMemo(
    () =>
      (review?.questions ?? []).filter(
        (question) =>
          question.type === "essay" &&
          question.result_status === "pending_grading" &&
          question.answer_id,
      ),
    [review],
  );

  const handleGradingChange = (answerId, value) => {
    setGradingValues((prev) => ({
      ...prev,
      [answerId]: value,
    }));
  };

  const handleSubmitGrades = async () => {
    const answers = pendingEssayAnswers.map((question) => {
      const raw = gradingValues[question.answer_id];
      return {
        answer_id: question.answer_id,
        marks_earned: parseFloat(raw),
      };
    });

    const invalid = answers.some(
      (item) =>
        Number.isNaN(item.marks_earned) ||
        item.marks_earned < 0 ||
        item.marks_earned >
          parseFloat(
            pendingEssayAnswers.find((q) => q.answer_id === item.answer_id)
              ?.marks ?? 0,
          ),
    );

    if (invalid || answers.length === 0) {
      toastError(
        isArabic
          ? "يرجى إدخال درجة صحيحة لكل إجابة مقالية"
          : "Please enter a valid mark for each essay answer",
      );
      return;
    }

    try {
      await gradeAttempt(attemptId, answers);
      navigate("/instructor/exam-grading");
    } catch {
      // toast handled in hook
    }
  };

  if (loadingAttempt && !review) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="admin-content-page">
        <div className="alert alert-warning">
          {isArabic
            ? "تعذر تحميل المحاولة أو أنها ليست بانتظار التصحيح."
            : "Could not load this attempt or it is not awaiting grading."}
        </div>
        <Link to="/instructor/exam-grading" className="btn btn-outline-secondary">
          {isArabic ? "العودة" : "Back"}
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-content-page">
      <div className="ac-header mb-4">
        <Link
          to="/instructor/exam-grading"
          className="text-decoration-none text-muted small d-inline-block mb-2"
        >
          <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} me-1`} />
          {isArabic ? "العودة إلى قائمة التصحيح" : "Back to grading queue"}
        </Link>
        <h2 className="ac-title mb-1">{review.exam_title}</h2>
        <p className="ac-subtitle text-muted mb-0">
          {isArabic ? "الدرجة الحالية:" : "Current score:"}{" "}
          <strong>
            {formatExamScore(review.score ?? 0)} /{" "}
            {formatExamScore(review.attempt_max_marks ?? review.total_marks ?? 0)}
          </strong>
        </p>
      </div>

      <div className="ac-table-card p-3 p-md-4">
        <AttemptAnswerReview
          review={review}
          gradingMode
          essayOnly
          gradingValues={gradingValues}
          onGradingChange={handleGradingChange}
        />
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleSubmitGrades}
          disabled={submitting || pendingEssayAnswers.length === 0}
        >
          {submitting ? (
            <Spinner animation="border" size="sm" className="me-2" />
          ) : (
            <i className="bi bi-check2-all me-2" />
          )}
          {isArabic ? "اعتماد التصحيح" : "Finalize Grading"}
        </button>
      </div>
    </div>
  );
}

export default GradeAttemptPage;
