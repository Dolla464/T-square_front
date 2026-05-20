import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuizzes } from "../../../hooks/useQuizzes";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../../../../student-dashboard/styles/dashboardShared.css";

/**
 * EditExam — Admin exam question editor
 * Mirrors the student QuizExamPage design but with editable inputs,
 * radio buttons for correct answer selection, and add/delete question actions.
 */
function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["adminDashboard"]);
  const isArabic = i18n.language?.startsWith("ar");
  const { getQuizById, saveQuizQuestions, loading } = useQuizzes();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // Load quiz data
  useEffect(() => {
    if (id) {
      getQuizById(id).then((data) => {
        if (data) {
          setQuiz(data);
          const cloned = (data.questions || []).map((q) => ({ ...q, answers: [...q.answers] }));
          if (cloned.length === 0) {
            cloned.push(createBlankQuestion(1));
          }
          setQuestions(cloned);
        }
      });
    }
  }, [id]);

  const createBlankQuestion = (nextId) => ({
    id: nextId,
    question_text: "",
    answers: ["", "", "", ""],
    correct_answer_index: 0,
    correct_answer: "",
    question_mark: 10,
  });

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // --- Handlers ---

  const handleQuestionTextChange = (value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], question_text: value };
      return updated;
    });
  };

  const handleAnswerChange = (answerIdx, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[currentIndex], answers: [...updated[currentIndex].answers] };
      q.answers[answerIdx] = value;
      // If this answer is the correct one, update correct_answer text too
      if (answerIdx === q.correct_answer_index) {
        q.correct_answer = value;
      }
      updated[currentIndex] = q;
      return updated;
    });
  };

  const handleCorrectAnswerChange = (answerIdx) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[currentIndex] };
      q.correct_answer_index = answerIdx;
      q.correct_answer = q.answers[answerIdx];
      updated[currentIndex] = q;
      return updated;
    });
  };

  const handleQuestionMarkChange = (value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], question_mark: parseInt(value) || 0 };
      return updated;
    });
  };

  const handleAddQuestion = () => {
    const maxId = questions.reduce((max, q) => Math.max(max, q.id || 0), 0);
    const newQ = createBlankQuestion(maxId + 1);
    setQuestions((prev) => [...prev, newQ]);
    setCurrentIndex(questions.length); // navigate to the new one
  };

  const handleDeleteQuestion = () => {
    if (questions.length <= 1) return; // keep at least one question
    setQuestions((prev) => {
      const updated = prev.filter((_, idx) => idx !== currentIndex);
      return updated;
    });
    setCurrentIndex((prev) => Math.min(prev, questions.length - 2));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await saveQuizQuestions(id, questions);
    setSaving(false);
    if (success) {
      navigate(`/admin/quizzes/view-exam/${id}`);
    }
  };

  const handleBack = () => {
    navigate(`/admin/quizzes/view-exam/${id}`);
  };

  // --- Loading / Error ---
  if (loading && !quiz) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (!quiz) {
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
              {isArabic ? "تعديل أسئلة الاختبار" : "Edit Exam Questions"}
            </span>
          </button>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-danger ac-add-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
            ) : (
              <i className="bi bi-check2-all me-0 me-md-1"></i>
            )}
            <span className="d-none d-md-inline">
              {isArabic ? "حفظ" : "Save"}
            </span>
          </button>
        </div>
      </div>

      {/* Quiz Exam Editor — mirrors QuizExamPage design */}
      <div className="quiz-exam-page">
        <div className="quiz-exam-container">

          {/* Progress bar + Add Question */}
          <div className="quiz-progress">
            <div className="d-flex justify-content-between align-items-center">
              <span>
                {isArabic ? "سؤال" : "Question"} {currentIndex + 1} {isArabic ? "من" : "of"}{" "}
                {totalQuestions}
              </span>
              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                onClick={handleAddQuestion}
                style={{ fontSize: "0.82rem", fontWeight: 600 }}
              >
                <i className="bi bi-plus-lg"></i>
                {isArabic ? "إضافة سؤال" : "Add Question"}
              </button>
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Text Input */}
          {currentQuestion && (
            <>
              <div className="quiz-question">
                <input
                  type="text"
                  className="form-control border-0 bg-transparent fw-bold"
                  style={{ fontSize: "1.1rem", color: "#1a1a1a" }}
                  placeholder={isArabic ? "اكتب نص السؤال هنا..." : "Type question text here..."}
                  value={currentQuestion.question_text}
                  onChange={(e) => handleQuestionTextChange(e.target.value)}
                />
              </div>

              {/* Answer Options with Radio Buttons */}
              <div className="quiz-options">
                {currentQuestion.answers.map((answer, idx) => (
                  <div
                    key={idx}
                    className={`quiz-option ${currentQuestion.correct_answer_index === idx ? "selected" : ""}`}
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
                        color: currentQuestion.correct_answer_index === idx ? "#fff" : "#333",
                      }}
                      placeholder={`${isArabic ? "الإجابة" : "Answer"} ${String.fromCharCode(65 + idx)}`}
                      value={answer}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    />

                    {/* Radio button for correct answer */}
                    <div className="form-check mb-0 ms-2">
                      <input
                        className="form-check-input border-2"
                        type="radio"
                        name={`correct-answer-${currentQuestion.id}`}
                        checked={currentQuestion.correct_answer_index === idx}
                        onChange={() => handleCorrectAnswerChange(idx)}
                        style={{
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          borderColor: currentQuestion.correct_answer_index === idx ? "#fff" : "#be1522",
                          accentColor: "#be1522",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Question Mark Input */}
              <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
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
                    className="form-control border-0 bg-white rounded-3 p-2"
                    value={currentQuestion.question_mark}
                    onChange={(e) => handleQuestionMarkChange(e.target.value)}
                    min="1"
                    style={{ maxWidth: "120px" }}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="d-flex justify-content-between align-items-center gap-2">
                {/* Delete button */}
                <button
                  className="btn btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1"
                  onClick={handleDeleteQuestion}
                  disabled={questions.length <= 1}
                  style={{ fontSize: "0.85rem", fontWeight: 600 }}
                >
                  <i className="bi bi-trash"></i>
                  <span className="d-none d-md-inline">
                    {isArabic ? "حذف السؤال" : "Delete"}
                  </span>
                </button>

                <div className="d-flex gap-2">
                  {/* Previous */}
                  <button
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    style={{ fontSize: "0.85rem", fontWeight: 600 }}
                  >
                    <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} me-1`}></i>
                    {isArabic ? "السابق" : "Previous"}
                  </button>

                  {/* Next */}
                  <button
                    className="btn btn-danger rounded-pill px-4"
                    onClick={handleNext}
                    disabled={currentIndex >= totalQuestions - 1}
                    style={{ fontSize: "0.85rem", fontWeight: 600 }}
                  >
                    {isArabic ? "التالي" : "Next"}
                    <i className={`bi ${isArabic ? "bi-arrow-left" : "bi-arrow-right"} ms-1`}></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default EditExam;