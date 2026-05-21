import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuizzes } from "../../../hooks/useQuizzes";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function ViewExam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(["adminDashboard"]);
    const isArabic = i18n.language?.startsWith("ar");
    const { getQuizById, loading } = useQuizzes();
    const [quiz, setQuiz] = useState(null);

    useEffect(() => {
        if (id) {
            getQuizById(id).then(setQuiz);
        }
    }, [id, getQuizById]);

    if (loading || !quiz) {
        return <Spinner animation="border" />;
    }

    const handleBack = () => {
        navigate("/admin/quizzes");
    };
    const handleEdit = (quiz) => {
        navigate(`/admin/quizzes/edit-exam/${quiz.id}`);
    }
    return (<>
        <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div className="">

                <button className="ac-back-btn ps-3 border-0 bg-transparent d-flex align-items-center" onClick={handleBack}>
                    <i
                        className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} fs-4 text-dark`}
                    ></i>
                    <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                        {t("quizzes_page.view_quiz")}
                    </span>
                </button>
            </div>
            <div className="d-flex gap-2">
                <button
                    className="btn btn-danger ac-add-btn"
                    onClick={() => handleEdit(quiz)}
                >
                    <i className="bi bi-pencil me-0 me-md-1"></i>
                    <span className="d-none d-md-inline">{t("quizzes_page.edit_quiz")}</span>
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
                    <div className="d-flex align-items-center pb-3 justify-content-between mb-3 mt-3" style={{
                        borderBottom: "1px solid rgba(0,0,0,0.03)",
                    }}>
                        <div className="d-flex  align-items-center">
                            <div
                                className="bg-danger rounded-3  p-2 me-3 d-flex align-items-center justify-content-center shadow-sm"
                                style={{ width: "40px", height: "40px" }}
                            >
                                <i className="bi bi-ui-checks text-white"></i>
                            </div>
                            <div>
                                <h5 className="fw-bold mb-0 text-dark">
                                    {quiz?.title}
                                </h5>
                                <p className="text-muted small mb-0">
                                    {isArabic
                                        ? "قائمة بالأسئلة لهذا الاختبار"
                                        : "List of questions for this quiz"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table mb-0 align-middle">
                            <thead>
                                <tr>
                                    <th className="ps-4 w-50  border-0 text-secondary small fw-bold">
                                        {isArabic ? "السؤال" : "Question"}
                                    </th>
                                    <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                        {isArabic ? "الإجابات" : "Answers"}
                                    </th>
                                    <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                        {isArabic ? "الإجابة الصحيحة" : "Correct Answer"}
                                    </th>
                                    <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                        {isArabic ? "درجة السؤال" : "Question mark"}
                                    </th>

                                </tr>
                            </thead>
                            <tbody className="border-0">
                                {
                                    quiz?.questions?.map((question, index) => (
                                        <tr
                                            key={`current-${question.id}`}
                                            style={{
                                                borderBottom: "1px solid rgba(0,0,0,0.03)",
                                            }}
                                        >
                                            <td className="ps-4 py-3 fw-bold text-dark">
                                                {question?.question_text}</td>
                                            <td className="py-3 border-0 text-secondary text-center small fw-bold">
                                                {question?.answers?.map((answer, index) => (
                                                    <div className={`p-1 ${index !== question?.answers?.length - 1 ? "border-bottom" : ""
                                                        } ${question?.correct_answer == answer
                                                            ? "bg-success text-white"
                                                            : ""
                                                        }`} key={answer}>{answer}</div>
                                                ))}
                                            </td>
                                            <td className="py-3 border-0 text-secondary text-center small fw-bold">
                                                <span className={`badge rounded-pill cp bg-success-subtle text-success`}
                                                    style={{
                                                        cursor: "pointer",
                                                        padding: "8px 16px",
                                                    }}>
                                                    <i
                                                        className={"bi bi-patch-check-fill me-1"}
                                                    ></i>
                                                    {question?.correct_answer}


                                                </span>
                                            </td>
                                            <td className="py-3 border-0 text-secondary text-center small fw-bold">{question?.question_mark}</td>
                                        </tr>
                                    ))
                                }

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>    </>

    );
}

export default ViewExam;