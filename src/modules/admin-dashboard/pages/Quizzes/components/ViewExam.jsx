import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionContent from "../../../../shared-dashboard/components/QuestionContent/QuestionContent";
import "../../../../shared-dashboard/components/QuestionContent/questionContent.css";
import { useQuizzes } from "../../../hooks/useQuizzes";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
    showConfirmCustom,
    showDeleteConfirm,
} from "../../../../../components/shared/ConfirmDialog/confirmDialog";
import "../../../components/shared/AdminContentPage/AdminContentPage.css";

function ViewExam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(["adminDashboard"]);
    const isArabic = i18n.language?.startsWith("ar");
    const {
        loading,
        getQuestionsForExam,
        getQuizById,
        deleteQuestion,
        getTrashedQuestions,
        restoreQuestion,
        forceDeleteQuestion
    } = useQuizzes();

    const [questions, setQuestions] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [showTrash, setShowTrash] = useState(false);

    const loadQuestions = useCallback(async () => {
        if (!id) return;
        try {
            setQuestionsLoading(true);
            const data = showTrash
                ? await getTrashedQuestions(id)
                : await getQuestionsForExam(id);
            setQuestions(data || []);
        } catch (err) {
            console.error("Failed to load questions", err);
        } finally {
            setQuestionsLoading(false);
        }
    }, [id, showTrash, getQuestionsForExam, getTrashedQuestions]);

    useEffect(() => {
        const fetchExamDetails = async () => {
            if (!id) return;
            const quizData = await getQuizById(id);
            setQuiz(quizData);
        };
        fetchExamDetails();
    }, [id, getQuizById]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const handleBack = () => {
        navigate("/admin/quizzes");
    };

    const handleEdit = (questionId) => {
        navigate(`/admin/quizzes/edit-exam/${questionId}`);
    };

    const handleDelete = async (questionId, questionText) => {
        const ok = await showDeleteConfirm(questionText);
        if (ok) {
            const success = await deleteQuestion(questionId);
            if (success) {
                loadQuestions();
            }
        }
    };

    const handleRestore = async (questionId, questionText) => {
        const ok = await showConfirmCustom({
            title: isArabic ? "استعادة السؤال" : "Restore Question",
            message: isArabic
                ? `هل أنت متأكد من استعادة السؤال (${questionText}) إلى قائمة أسئلة الاختبار؟`
                : `Are you sure you want to restore the question "${questionText}" to the quiz?`,
            icon: "question",
            variant: "primary",
            confirmText: isArabic ? "استعادة" : "Restore",
        });

        if (ok) {
            const success = await restoreQuestion(questionId);
            if (success) {
                loadQuestions();
            }
        }
    };

    const handleForceDelete = async (questionId, questionText) => {
        const ok = await showConfirmCustom({
            title: isArabic ? "حذف نهائي للسؤال" : "Permanently Delete Question",
            message: isArabic
                ? `هل أنت متأكد من حذف السؤال (${questionText}) نهائياً؟ لا يمكن استعادة هذا السؤال بعد الحذف.`
                : `Are you sure you want to permanently delete the question "${questionText}"? This action cannot be undone.`,
            icon: "warning",
            variant: "danger",
            confirmText: isArabic ? "حذف نهائي" : "Delete Permanently",
        });

        if (ok) {
            const success = await forceDeleteQuestion(questionId);
            if (success) {
                loadQuestions();
            }
        }
    };

    const loadingState = loading || questionsLoading;

    return (
        <div className="admin-content-page position-relative" style={{ minHeight: "200px" }}>
            {/* Loading  */}
            {loadingState && (

                <Spinner animation="border" variant="danger" />
            )}

            <div className="ac-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button className="ac-back-btn ps-3 border-0 bg-transparent d-flex align-items-center" onClick={handleBack}>
                        <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} fs-4 text-dark`}></i>
                        <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                            {t("quizzes_page.view_quiz")}
                        </span>
                    </button>
                </div>
                <div className="d-flex gap-2">
                    {!showTrash && (
                        <button
                            type="button"
                            className="btn btn-danger ac-add-btn"
                            onClick={() => navigate(`/admin/quizzes/edit-exam/new?exam_id=${id}`)}
                        >
                            <i className="bi bi-plus-lg me-0 me-md-1"></i>
                            <span className="d-none d-md-inline">
                                {isArabic ? "إضافة سؤال جديد" : "Add Question"}
                            </span>
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-outline-dark ac-add-btn"
                        style={{ color: "#ffffff" }}
                        onClick={() => setShowTrash((prev) => !prev)}
                    >
                        <i className={`bi ${showTrash ? "bi-arrow-left" : "bi-trash"} me-0 me-md-2`}></i>
                        <span className="d-none d-md-inline">
                            {showTrash
                                ? t("quizzes_page.back_to_active", isArabic ? "العودة للأسئلة النشطة" : "Back to active")
                                : t("quizzes_page.trash", isArabic ? "سلة المحذوفات" : "Trash")}
                        </span>
                    </button>
                </div>
            </div>

            <div className="ac-table-card mt-0">
                <div className="ac-table-container">
                    <div
                        className="card border-0 bg-white shadow-sm overflow-hidden"
                        style={{
                            backgroundColor: "#f8f9fc",
                            borderRadius: "15px",
                        }}
                    >
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center pb-3 justify-content-between mb-3 mt-3 px-3 gap-3" style={{
                            borderBottom: "1px solid rgba(0,0,0,0.03)",
                        }}>
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"
                                    style={{ width: "40px", height: "40px", flexShrink: 0 }}
                                >
                                    <i className="bi bi-ui-checks text-white"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-0 text-dark">
                                        {quiz?.title}{showTrash ? ` - ${isArabic ? "سلة المحذوفات" : "Trash"}` : ""}
                                    </h5>
                                    <p className="text-muted small mb-0">
                                        {showTrash
                                            ? (isArabic ? "قائمة بالأسئلة المحذوفة مؤقتاً" : "List of temporarily deleted questions")
                                            : (isArabic ? "قائمة بالأسئلة لهذا الاختبار" : "List of questions for this quiz")}
                                    </p>
                                </div>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                {/* Total Marks */}
                                <div
                                    className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm gap-2"
                                    style={{ minWidth: "40px", height: "40px" }}
                                    title={isArabic ? "الدرجة الكلية" : "Total Marks"}
                                >
                                    <i className="bi bi-award-fill text-white"></i>
                                    <span className="fw-bold text-white">
                                        {quiz?.total_marks}
                                    </span>
                                </div>

                                {/* Max Attempts */}
                                <div
                                    className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm gap-2"
                                    style={{ minWidth: "40px", height: "40px" }}
                                    title={isArabic ? "الحد الأقصى للمحاولات" : "Max Attempts"}
                                >
                                    <i className="bi bi-arrow-repeat text-white"></i>
                                    <span className="fw-bold text-white">
                                        {quiz?.max_attempts}
                                    </span>
                                </div>

                                {/* Duration */}
                                <div
                                    className="bg-danger rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm gap-2"
                                    style={{ minWidth: "40px", height: "40px" }}
                                    title={isArabic ? "المدة" : "Duration"}
                                >
                                    <i className="bi bi-clock-fill text-white"></i>
                                    <span className="fw-bold text-white">
                                        {quiz?.duration}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className={`table ac-table mb-0 align-middle${showTrash ? " table-secondary" : ""}`}>
                                <thead style={{
                                    borderBottom: "1px solid rgba(0,0,0,0.03)",
                                }}>
                                    <tr>
                                        <th style={{ width: "35%" }}>{isArabic ? "السؤال" : "Question"}</th>
                                        {!showTrash ? (
                                            <>
                                                <th className="text-center" style={{ width: "30%" }}>{isArabic ? "الإجابات" : "Answers"}</th>
                                                <th className="text-center" style={{ width: "8%" }}>{isArabic ? "درجة السؤال" : "Question mark"}</th>
                                            </>
                                        ) : (
                                            <th className="text-center">{isArabic ? "تاريخ الحذف" : "Deleted at"}</th>
                                        )}
                                        <th className="text-center" style={{ width: "7%" }}>{isArabic ? "الإجراءات" : "Actions"}</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {questions && questions.length > 0 ? (
                                        questions.map((question) => (
                                            <tr className="py-3" key={`question-${question.id}`}>
                                                <td className="py-4 py-3 fw-bold text-dark">
                                                    <QuestionContent question={question} />
                                                </td>
                                                {!showTrash ? (
                                                    <>
                                                        <td className="py-3 text-secondary text-center small fw-bold">
                                                            {question?.choices?.map((answer, index) => (
                                                                <div
                                                                    className={`p-1 mb-1 ${answer?.is_correct ? "bg-success text-white" : ""}`}
                                                                    style={{ borderRadius: "10px" }}
                                                                    key={`${question.id}-choice-${index}`}
                                                                >
                                                                    {answer?.is_correct && <i className="bi bi-patch-check me-1"></i>}
                                                                    {answer?.choice_text}
                                                                </div>
                                                            ))}
                                                        </td>
                                                        <td className="py-3 text-secondary text-center small fw-bold">{question?.marks}</td>
                                                    </>
                                                ) : (
                                                    <td className="text-center">
                                                        <span className="badge bg-secondary px-3 py-2 rounded-pill">
                                                            <i className="bi bi-trash me-1"></i>
                                                            {question?.deleted_at ? new Date(question.deleted_at).toLocaleDateString() : ""}
                                                        </span>
                                                    </td>
                                                )}



                                                <td className="text-center pe-3">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        {showTrash ? (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm ac-btn-view border-0"
                                                                    title={isArabic ? "استعادة" : "Restore question"}
                                                                    onClick={() => handleRestore(question.id, question.question_text)}
                                                                >
                                                                    <i className="bi bi-arrow-counterclockwise fs-6"></i>
                                                                </button>

                                                                <button
                                                                    className="btn btn-sm ac-btn-deleteTable border-0"
                                                                    title={isArabic ? "حذف نهائي" : "Permanent Delete"}
                                                                    onClick={() => handleForceDelete(question.id, question.question_text)}
                                                                >
                                                                    <i className="bi bi-trash-fill fs-6"></i>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="btn btn-sm ac-btn-edit border-0"
                                                                    title={isArabic ? "تعديل" : "Edit question"}
                                                                    onClick={() => handleEdit(question.id)}
                                                                >
                                                                    <i className="bi bi-pencil-square fs-6"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm ac-btn-deleteTable border-0"
                                                                    title={isArabic ? "نقل إلى المهملات" : "Move to trash"}
                                                                    onClick={() => handleDelete(question.id, question.question_text)}
                                                                >
                                                                    <i className="bi bi-trash fs-6"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={showTrash ? 3 : 4} className="text-center py-4 text-muted">
                                                {showTrash
                                                    ? (isArabic ? "لا توجد أسئلة محذوفة" : "No deleted questions found")
                                                    : (isArabic ? "لا توجد أسئلة في هذا الاختبار" : "No questions in this exam")}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default ViewExam;