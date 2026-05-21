import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuizzes } from "../../../hooks/useQuizzes";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toastError } from "../../../../../components/shared/Toaster/toaster";
import "../../../../student-dashboard/styles/dashboardShared.css";

/**
 * EditExam — Admin exam question editor & creator
 * Supports two modes:
 * 1. isEdit: Edit an existing question (PUT /admin/questions/:id)
 * 2. isAdd: Add a new question (POST /admin/questions)
 */
function EditExam() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["adminDashboard"]);
  const isArabic = i18n.language?.startsWith("ar");
  const { getQuestionById, getQuizById, createQuestion, updateQuestion, loading } = useQuizzes();

  const isAdd = id === "new";
  const isEdit = !isAdd;
  const examIdParam = searchParams.get("exam_id");
  const examId = isAdd ? parseInt(examIdParam) : null;

  const [exam, setExam] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [marks, setMarks] = useState(1.0);
  const [choices, setChoices] = useState([
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false }
  ]);
  const [saving, setSaving] = useState(false);
  const [fetchingQuestion, setFetchingQuestion] = useState(false);

  // Load question and/or exam data
  useEffect(() => {
    const loadData = async () => {
      if (isAdd) {
        if (examId) {
          const examData = await getQuizById(examId);
          if (examData) setExam(examData);
        }
      } else {
        setFetchingQuestion(true);
        const questionData = await getQuestionById(id);
        setFetchingQuestion(false);
        if (questionData) {
          setQuestionText(questionData.question_text || "");
          setMarks(questionData.marks || 1.0);

          let choicesData = questionData.choices || [];
          if (choicesData.length === 0) {
            choicesData = [
              { choice_text: "", is_correct: false },
              { choice_text: "", is_correct: false },
              { choice_text: "", is_correct: false },
              { choice_text: "", is_correct: false }
            ];
          }
          setChoices(choicesData);

          if (questionData.exam_id) {
            const examData = await getQuizById(questionData.exam_id);
            if (examData) setExam(examData);
          }
        }
      }
    };
    loadData();
  }, [id, examId, isAdd]);

  // --- Handlers ---

  const handleQuestionTextChange = (value) => {
    setQuestionText(value);
  };

  const handleChoiceTextChange = (index, value) => {
    setChoices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], choice_text: value };
      return updated;
    });
  };

  const handleCorrectAnswerChange = (index) => {
    setChoices((prev) =>
      prev.map((choice, idx) => ({
        ...choice,
        is_correct: idx === index,
      }))
    );
  };

  const handleMarksChange = (value) => {
    setMarks(parseFloat(value) || 0);
  };

  const validateQuestion = () => {
    if (!questionText.trim()) {
      toastError(isArabic ? "من فضلك اكتب نص السؤال" : "Please enter the question text");
      return false;
    }

    const hasCorrect = choices.some((c) => c.is_correct);
    if (!hasCorrect) {
      toastError(
        isArabic
          ? "من فضلك حدد إجابة واحدة صحيحة على الأقل"
          : "Please select at least one correct answer"
      );
      return false;
    }

    const allHaveText = choices.every((c) => c.choice_text.trim() !== "");
    if (!allHaveText) {
      toastError(isArabic ? "من فضلك املأ جميع الاختيارات" : "Please fill in all choice options");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    const activeExamId = examId || exam?.id;
    if (!activeExamId) return;

    // In isAdd mode, check if form is completely clean/empty to allow exiting without saving
    if (isAdd) {
      const isBlank =
        !questionText.trim() &&
        choices.every((c) => !c.choice_text.trim());
      if (isBlank) {
        navigate(`/admin/quizzes/view-exam/${activeExamId}`);
        return;
      }
    }

    if (!validateQuestion()) return;

    setSaving(true);
    let success = false;
    const payload = {
      exam_id: activeExamId,
      question_text: questionText,
      marks: marks,
      choices: choices.map((c) => ({
        choice_text: c.choice_text,
        is_correct: !!c.is_correct,
      })),
    };

    if (isEdit) {
      success = await updateQuestion(id, payload);
    } else {
      success = await createQuestion(payload);
    }

    setSaving(false);
    if (success) {
      navigate(`/admin/quizzes/view-exam/${activeExamId}`);
    }
  };

  const handleNext = async () => {
    const activeExamId = examId || exam?.id;
    if (!activeExamId) return;

    if (!validateQuestion()) return;

    setSaving(true);
    const payload = {
      exam_id: activeExamId,
      question_text: questionText,
      marks: marks,
      choices: choices.map((c) => ({
        choice_text: c.choice_text,
        is_correct: !!c.is_correct,
      })),
    };

    const success = await createQuestion(payload);
    setSaving(false);

    if (success) {
      // Clear form inputs for the next question
      setQuestionText("");
      setMarks(1.0);
      setChoices([
        { choice_text: "", is_correct: false },
        { choice_text: "", is_correct: false },
        { choice_text: "", is_correct: false },
        { choice_text: "", is_correct: false },
      ]);
    }
  };

  const handleBack = () => {
    const activeExamId = examId || exam?.id;
    if (activeExamId) {
      navigate(`/admin/quizzes/view-exam/${activeExamId}`);
    } else {
      navigate("/admin/quizzes");
    }
  };

  // --- Loading / Error ---
  if (fetchingQuestion || (loading && !exam)) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="quiz-exam-page">
        <div className="quiz-exam-container">
          <div className="quiz-exam-placeholder">
            <i className="bi bi-exclamation-circle placeholder-icon"></i>
            <h5>{isArabic ? "الاختبار غير موجود" : "Exam not found"}</h5>
            <button className="btn-continue" onClick={() => navigate("/admin/quizzes")}>
              <i className="bi bi-arrow-left me-1"></i>
              {isArabic ? "العودة" : "Back"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <button
            className="ac-back-btn ps-3 border-0 bg-transparent d-flex align-items-center"
            onClick={handleBack}
          >
            <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} fs-4 text-dark`}></i>
            <span className="ms-2 me-2 fs-5 fw-bold text-dark">
              {isEdit
                ? (isArabic ? `تعديل سؤال - ${exam.title}` : `Edit Question - ${exam.title}`)
                : (isArabic ? `إضافة سؤال جديد - ${exam.title}` : `Add New Question - ${exam.title}`)}
            </span>
          </button>
        </div>
        {isAdd && (
          <div>

            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleSave}
              disabled={saving}
              style={{
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              {saving ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <i className="bi bi-check2-all"></i>
              )}
              <span>
                {isArabic ? "حفظ" : "Save"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Quiz Exam Editor */}
      <div className="quiz-exam-page">
        <div className="quiz-exam-container">

          {/* Header Role Indicator */}
          {!isEdit && (
            <div className="quiz-progress mb-4">
              <span className="fw-bold text-secondary">
                {isArabic ? "إضافة سؤال جديد للاختبار" : "Adding new question to exam"}
              </span>
            </div>
          )}

          <div className="row">
            <div className="col-md-9">
              {/* Question Text Input */}
              <div className="quiz-question h-75 d-flex align-items-center">
                <input
                  type="text"
                  className="form-control border-0 bg-transparent fw-bold"
                  style={{
                    fontSize: "1.1rem",
                    color: "#1a1a1a",
                  }}
                  placeholder={
                    isArabic
                      ? "اكتب نص السؤال هنا..."
                      : "Type question text here..."
                  }
                  value={questionText}
                  onChange={(e) => {
                    let value = e.target.value;

                    // يمنع تكرار علامة الاستفهام
                    value = value.replace(/\?+$/, "");

                    handleQuestionTextChange(`${value}?`);
                  }}
                />
                <div
                  className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: "40px", height: "40px", flexShrink: 0 }}
                  title="لا تضع علامة استفهام يتم وضعها بشكل تلقائي"
                >
                  <i className="bi bi-question-lg text-white"></i>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              {/* Question Mark Input */}
              <div className="d-flex align-items-center h-75 gap-3 mb-4 p-3 bg-light rounded-3">
                <div
                  className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: "40px", height: "40px", flexShrink: 0 }}
                >
                  <i className="bi bi-star-fill text-white"></i>
                </div>
                <div className="flex-grow-1">
                  <label className="form-label fw-bold text-dark mb-1" style={{ fontSize: "0.85rem" }}>
                    {isArabic ? "درجة السؤال" : "Question Mark"}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control border-0 bg-white rounded-3 p-2"
                    value={marks}
                    onChange={(e) => handleMarksChange(e.target.value)}
                    min="0.5"
                    style={{ maxWidth: "120px" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Answer Options with Radio Buttons */}
          <div className="quiz-options">
            {choices.map((choice, idx) => (
              <div
                key={idx}
                className={`quiz-option ${choice.is_correct ? "selected" : ""}`}
                style={{ cursor: "default" }}
              >
                {/* Letter prefix */}
                <span className="option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>

                {/* Editable answer text */}
                <input
                  type="text"
                  className="form-control border-0 bg-transparent flex-grow-1"
                  style={{
                    fontSize: "0.95rem",
                    color: choice.is_correct ? "#fff" : "#333",
                  }}
                  placeholder={`${isArabic ? "الإجابة" : "Answer"} ${String.fromCharCode(65 + idx)}`}
                  value={choice.choice_text}
                  onChange={(e) => handleChoiceTextChange(idx, e.target.value)}
                />

                {/* Radio button for correct answer */}
                <div className="form-check mb-0 ms-2">
                  <input
                    className="form-check-input border-2"
                    type="radio"
                    name="correct-answer-radio"
                    checked={!!choice.is_correct}
                    onChange={() => handleCorrectAnswerChange(idx)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      borderColor: choice.is_correct ? "#fff" : "#be1522",
                      accentColor: "#be1522",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>



          {/* Footer Actions */}
          <div className="d-flex justify-content-end align-items-center gap-2 mt-4">
            {isAdd ? (
              <button
                className="btn btn-danger ac-add-btn"
                onClick={handleNext}
                disabled={saving}
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                {saving ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <i className={`bi ${isArabic ? "bi-arrow-left" : "bi-arrow-right"}`}></i>
                )}
                <span>
                  {isArabic ? "حفظ وإضافة سؤال جديد" : "Save and add new question"}
                </span>
              </button>
            ) : (
              <button
                className="btn btn-danger ac-add-btn"
                onClick={handleSave}
                disabled={saving}
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                {saving ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <i className="bi bi-check2-all"></i>
                )}
                <span>
                  {isArabic ? "حفظ" : "Save"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default EditExam;