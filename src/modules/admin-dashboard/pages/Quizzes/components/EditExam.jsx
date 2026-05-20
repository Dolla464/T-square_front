import React from 'react'
import { useParams, useNavigate } from "react-router-dom";
import { useQuizzes } from "../../../hooks/useQuizzes";
import { Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function EditExam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(["adminDashboard"]);
    const isArabic = i18n.language?.startsWith("ar");
    // const { getQuizById, loading } = useQuizzes();
    // const [quiz, setQuiz] = useState(null);
    return (<>
        <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div className="">

                <button className="ac-back-btn ps-3 border-0 bg-transparent d-flex align-items-center" >
                    <i
                        className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} fs-4 text-dark`}
                    ></i>
                    <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                        {t("quizzes_page.view_quiz")}
                    </span>
                </button>
            </div>

        </div>
        <div className="ac-form-container">
            <div className="ac-form-header d-flex justify-content-between align-items-center mb-4">
                <button className="ac-back-btn">
                    <i className="bi bi-arrow-left"></i>

                    <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                        Add New Group
                    </span>
                </button>
            </div>

            <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
                <div className="ac-tab-content basic-info">
                    <div className="mb-4">
                        <label className="form-label fw-bold text-dark">
                            Group Name
                        </label>

                        <input
                            type="text"
                            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                            placeholder="Enter group name"
                        />
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6 mb-3 mb-md-0">
                            <label className="form-label fw-bold text-dark">
                                Course Title
                            </label>

                            <select className="form-control ac-form-input p-3 bg-light border-0 rounded-3">
                                <option>Select course</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold text-dark">
                                Instructor
                            </label>

                            <select className="form-control ac-form-input p-3 bg-light border-0 rounded-3">
                                <option>Select instructor</option>
                            </select>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-12">
                            <label className="form-label fw-bold text-dark mb-3">
                                Group Statistics
                            </label>

                            <div className="d-flex align-items-center p-3 bg-light rounded-3 border">
                                <div
                                    className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mx-3"
                                    style={{ width: "45px", height: "45px" }}
                                >
                                    <i className="bi bi-people-fill fs-5"></i>
                                </div>

                                <div>
                                    <h6 className="mb-0 fw-bold text-dark fs-5">0</h6>

                                    <small className="text-muted">
                                        Enrolled Students
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ac-table-card mt-4">
                        <div className="ac-table-container">
                            <div className="d-flex align-items-center justify-content-between mb-3 mt-5">
                                <div className="d-flex align-items-center">
                                    <div
                                        className="bg-danger rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm"
                                        style={{ width: "40px", height: "40px" }}
                                    >
                                        <i className="bi bi-people text-white"></i>
                                    </div>

                                    <div>
                                        <h5 className="fw-bold mb-0 text-dark">
                                            Current Group Students
                                        </h5>

                                        <p className="text-muted small mb-0">
                                            List of students currently enrolled in this group
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="card border-0 shadow-sm overflow-hidden"
                                style={{
                                    backgroundColor: "#f8f9fc",
                                    borderRadius: "15px",
                                }}
                            >
                                <div className="table-responsive">
                                    <table className="table mb-0 align-middle">
                                        <thead>
                                            <tr>
                                                <th className="ps-4 py-3 border-0 text-secondary small fw-bold">
                                                    Student
                                                </th>

                                                <th className="py-3 border-0 text-secondary small fw-bold">
                                                    Email
                                                </th>

                                                <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                                    Phone
                                                </th>

                                                <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="text-center py-4 text-muted"
                                                >
                                                    No students in this group
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ac-table-card mt-4">
                        <div className="ac-table-container">
                            <div className="d-flex align-items-center justify-content-between mb-3 mt-5">
                                <div className="d-flex align-items-center">
                                    <div
                                        className="bg-danger rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm"
                                        style={{ width: "40px", height: "40px" }}
                                    >
                                        <i className="bi bi-person-plus text-white"></i>
                                    </div>

                                    <div>
                                        <h5 className="fw-bold mb-0 text-dark">
                                            Available Students to Add
                                        </h5>

                                        <p className="text-muted small mb-0">
                                            Students enrolled in the course but not assigned to any group
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input border-danger"
                                        type="checkbox"
                                        id="selectAllStudents"
                                    />

                                    <label
                                        className="form-check-label ms-2 fw-medium text-dark"
                                        htmlFor="selectAllStudents"
                                    >
                                        Select All
                                    </label>
                                </div>
                            </div>

                            <div
                                className="card border-0 shadow-sm overflow-hidden"
                                style={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: "15px",
                                    border: "1px solid #eee",
                                }}
                            >
                                <div className="table-responsive">
                                    <table className="table mb-0 align-middle table-hover">
                                        <thead>
                                            <tr>
                                                <th
                                                    className="ps-4 py-3 border-0"
                                                    style={{ width: "50px" }}
                                                ></th>

                                                <th className="py-3 border-0 text-secondary small fw-bold">
                                                    Student
                                                </th>

                                                <th className="py-3 border-0 text-secondary small fw-bold">
                                                    Email
                                                </th>

                                                <th className="pe-4 py-3 border-0 text-secondary small fw-bold text-center">
                                                    Phone
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="text-center py-4 text-muted"
                                                >
                                                    No available students
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                        <button className="btn btn-danger px-5 py-2 fw-medium rounded-3">
                            Create Group
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </>
    )
}

export default EditExam