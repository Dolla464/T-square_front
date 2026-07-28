import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useInstructorQuizzes } from "../../../hooks/useInstructorQuizzes";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { toastError } from "../../../../../components/shared/Toaster/toaster";
import QuestionEditorFields from "../../../../shared-dashboard/components/QuestionEditorFields/QuestionEditorFields";
import {
  buildQuestionPayload,
  hasQuestionContent,
  isQuestionFormBlank,
  resetQuestionRichFields,
} from "../../../../shared-dashboard/utils/questionFormHelpers";
import "../../../../shared-dashboard/components/QuestionContent/questionContent.css";
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
  const { i18n } = useTranslation(["adminDashboard"]);
  const isArabic = i18n.language?.startsWith("ar");
  const { getQuestionById, getQuizById, createQuestion, updateQuestion, uploadQuestionImage, loading } = useInstructorQuizzes();

  const isAdd = id === "new";
  const isEdit = !isAdd;
  const examIdParam = searchParams.get("exam_id");
  const examId = isAdd ? parseInt(examIdParam) : null;

  const [exam, setExam] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [questionImagePath, setQuestionImagePath] = useState("");
  const [questionImagePreview, setQuestionImagePreview] = useState("");
  const [questionCode, setQuestionCode] = useState("");
  const [questionCodeLanguage, setQuestionCodeLanguage] = useState("php");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [marks, setMarks] = useState(1.0);
  const [choices, setChoices] = useState([
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false },
    { choice_text: "", is_correct: false }
  ]);
  const [saving, setSaving] = useState(false);
  const [fetchingQuestion, setFetchingQuestion] = useState(false);
  const [storedExamId, setStoredExamId] = useState(null);

  // Load question and/or exam data
  useEffect(() => {
    const loadData = async () => {
      if (isAdd) {
        if (examId) {
          setStoredExamId(examId);
          const examData = await getQuizById(examId);
          if (examData) setExam(examData);
        }
      } else {
        setFetchingQuestion(true);
        const questionData = await getQuestionById(id);
        setFetchingQuestion(false);
        if (questionData) {
          setQuestionText((questionData.question_text || "").replace(/\?+$/, ""));
          setQuestionImagePath(questionData.question_image || "");
          setQuestionImagePreview(
            questionData.question_image_url || questionData.question_image || "",
          );
          setQuestionCode(questionData.question_code || "");
          setQuestionCodeLanguage(questionData.question_code_language || "php");
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
            setStoredExamId(questionData.exam_id);
            const examData = await getQuizById(questionData.exam_id);
            if (examData) setExam(examData);
          }
        }
      }
    };
    loadData();
  }, [id, examId, isAdd, getQuestionById, getQuizById]);

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

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const upload = await uploadQuestionImage(file);
    setUploadingImage(false);

    if (upload?.path) {
      setQuestionImagePath(upload.path);
      setQuestionImagePreview(upload.url || upload.path);
    }

    event.target.value = "";
  };

  const handleImageRemove = () => {
    setQuestionImagePath("");
    setQuestionImagePreview("");
  };

  const buildPayload = () =>
    buildQuestionPayload({
      examId: examId || exam?.id || storedExamId,
      questionText,
      questionImagePath,
      questionCode,
      questionCodeLanguage,
      marks,
      choices,
    });

  const validateQuestion = () => {
    if (
      !hasQuestionContent({
        questionText,
        questionImage: questionImagePath,
        questionCode,
      })
    ) {
      toastError(
        isArabic
          ? "أضف نص السؤال أو صورة أو كود على الأقل"
          : "Add question text, an image, or code at minimum",
      );
      return false;
    }

    if (!marks || isNaN(marks) || marks < 0.5) {
      toastError(
        isArabic
          ? "من فضلك أدخل درجة صحيحة (0.5 على الأقل)"
          : "Please enter a valid mark (minimum 0.5)"
      );
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

  const resolveActiveExamId = () => examId || exam?.id || storedExamId;

  const handleSave = async () => {
    const activeExamId = resolveActiveExamId();
    if (!activeExamId) {
      toastError(
        isArabic ? "تعذر تحديد الاختبار. ارجع وحاول مرة أخرى." : "Could not resolve the exam. Go back and try again.",
      );
      return;
    }

    // In isAdd mode, check if form is completely clean/empty to allow exiting without saving
    if (isAdd) {
      const isBlank = isQuestionFormBlank({
        questionText,
        questionImagePath,
        questionCode,
        choices,
      });
      if (isBlank) {
        navigate(`/instructor/quizzes/view-exam/${activeExamId}`);
        return;
      }
    }

    if (!validateQuestion()) return;

    setSaving(true);
    try {
      const payload = buildPayload();
      const success = isEdit
        ? await updateQuestion(id, payload)
        : await createQuestion(payload);

      if (success) {
        navigate(`/instructor/quizzes/view-exam/${activeExamId}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const activeExamId = resolveActiveExamId();
    if (!activeExamId) {
      toastError(
        isArabic ? "تعذر تحديد الاختبار. ارجع وحاول مرة أخرى." : "Could not resolve the exam. Go back and try again.",
      );
      return;
    }

    if (!validateQuestion()) return;

    setSaving(true);
    try {
      const payload = buildPayload();
      const success = await createQuestion(payload);

      if (success) {
        resetQuestionRichFields({
          setQuestionText,
          setQuestionImagePath,
          setQuestionImagePreview,
          setQuestionCode,
          setQuestionCodeLanguage,
          setMarks,
          setChoices,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const activeExamId = resolveActiveExamId();
    if (activeExamId) {
      navigate(`/instructor/quizzes/view-exam/${activeExamId}`);
    } else {
      navigate("/instructor/quizzes");
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
      <div className="quiz-exam-editor">
        <div className="quiz-exam-container">
          <div className="quiz-exam-placeholder">
            <i className="bi bi-exclamation-circle placeholder-icon"></i>
            <h5>{isArabic ? "الاختبار غير موجود" : "Exam not found"}</h5>
            <button type="button" className="btn-continue" onClick={() => navigate("/instructor/quizzes")}>
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
            type="button"
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
      </div>

      {/* Quiz Exam Editor */}
      <div className="quiz-exam-editor">
        <div className="quiz-exam-container" style={{ maxWidth: "1050px" }}>

          {/* Header Role Indicator */}
          {!isEdit && (
            <div className="quiz-progress mb-4">
              <span className="fw-bold text-secondary">
                {isArabic ? "إضافة سؤال جديد للاختبار" : "Adding new question to exam"}
              </span>
            </div>
          )}

          <QuestionEditorFields
            isArabic={isArabic}
            questionText={questionText}
            onQuestionTextChange={handleQuestionTextChange}
            marks={marks}
            onMarksChange={handleMarksChange}
            questionImagePreview={questionImagePreview}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            uploadingImage={uploadingImage}
            questionCode={questionCode}
            onQuestionCodeChange={setQuestionCode}
            questionCodeLanguage={questionCodeLanguage}
            onQuestionCodeLanguageChange={setQuestionCodeLanguage}
          />

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
              <div className="d-flex flex-wrap gap-2 w-100 justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold"
                  onClick={handleBack}
                  style={{ fontSize: "0.9rem" }}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  {isArabic ? "خروج دون حفظ" : "Exit without saving"}
                </button>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-success px-4 py-2 rounded-3 fw-bold text-white d-flex align-items-center gap-2"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ fontSize: "0.9rem" }}
                  >
                    {saving ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <i className="bi bi-check2-circle"></i>
                    )}
                    {isArabic ? "حفظ وإنهاء" : "Save and Exit"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger ac-add-btn m-0"
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
                      {isArabic ? "حفظ وإضافة سؤال آخر" : "Save and add another question"}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
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