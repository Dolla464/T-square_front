import { useEffect, useState } from "react";
import { Pagination, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  showConfirmCustom,
  showDeleteConfirm,
} from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { useQuizzes } from "../../hooks/useQuizzes";
import { useAdminCourses } from "../../hooks/useAdminCourses";
import { useNavigate, useParams } from "react-router-dom";


/**
 * Default form data structure for creating or editing a quiz
 */
const defaultFormData = {
  title: "",
  course_id: "",
  questions_count: "",
  duration: "",
  status: "active",
  description: "",
  total_marks: "",
  passing_mark: "",
  is_active: true,
  is_final: false,
  max_attempts: "",
  shuffle_questions: true,
};

function AdminQuizzes() {
  const {
    quizzes,
    quiz,
    pagination: apiPagination,
    loading: quizzesLoading,
    getQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    restoreQuiz,
    forceDeleteQuiz,
    toggleQuizStatus,
  } = useQuizzes();

  const { courses, getCourses, loading: coursesLoading } = useAdminCourses();

  // State variables for form visibility, editing mode, searches, and filters
  const [showForm, setShowForm] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [showTrash, setShowTrash] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const navigate = useNavigate();
  const { id } = useParams();
  // Fetch courses on load
  useEffect(() => {
    getCourses({ per_page: 100 }).catch((err) => {
      console.log("Failed to fetch courses", err);
    });
  }, [getCourses]);

  // Combine loaded courses
  const availableCourses = courses || [];

  /**
   * Debounce search term to prevent excessive lookups
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Fetch quizzes with active filters (including trash and period options)
   */
  useEffect(() => {
    getQuizzes({
      page: currentPage,
      search: debouncedSearchTerm,
      status: selectedStatus,
      course_id: selectedCourse,
      trash: showTrash,
      period: selectedPeriod,
    });
  }, [getQuizzes, currentPage, debouncedSearchTerm, selectedStatus, selectedCourse, showTrash, selectedPeriod]);

  /**
   * Reset page when filters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedStatus, selectedCourse, showTrash, selectedPeriod]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * Setup form for a new quiz
   */
  const handleAddNew = () => {
    setViewingItem(null);
    setIsEditing(true);
    setFormData(defaultFormData);
    setShowForm(true);
  };



  /**
   * Show quiz details in edit mode
   */
  const handleEdit = async (item) => {
    const fullData = await getQuizById(item.id);
    if (fullData) {
      setViewingItem(fullData);
      setIsEditing(true);
      setFormData({
        title: fullData.title || "",
        course_id: fullData.course_id || "",
        questions_count: fullData.questions_count || "",
        duration: fullData.duration || "",
        status: fullData.status || "active",
        description: fullData.description || "",
        total_marks: fullData.total_marks || "",
        passing_mark: fullData.passing_mark || "",
        is_active: fullData.is_active !== undefined ? fullData.is_active : true,
        is_final: fullData.is_final !== undefined ? fullData.is_final : false,
        max_attempts: fullData.max_attempts || "",
        shuffle_questions: fullData.shuffle_questions !== undefined ? fullData.shuffle_questions : true,
      });
      setShowForm(true);
    }
  };

  /**
   * Go back to table view
   */
  const handleBack = () => {
    setShowForm(false);
    setViewingItem(null);
    setIsEditing(false);
  };

  /**
   * Confirm and soft delete quiz
   */
  const handleDelete = async (id, title) => {
    const ok = await showDeleteConfirm(title);
    if (ok) {
      const success = await deleteQuiz(id);
      if (success) {
        getQuizzes({
          page: currentPage,
          search: debouncedSearchTerm,
          status: selectedStatus,
          course_id: selectedCourse,
          trash: showTrash,
          period: selectedPeriod,
        });
      }
    }
  };

  /**
   * Confirm and restore quiz
   */
  const handleRestore = async (id, title) => {
    const ok = await showConfirmCustom({
      title: isArabic ? "استعادة الاختبار" : "Restore Quiz",
      message: isArabic
        ? `هل أنت متأكد من استعادة الاختبار (${title}) إلى قائمة الاختبارات النشطة؟`
        : `Are you sure you want to restore the quiz "${title}" to active quizzes?`,
      icon: "question",
      variant: "primary",
      confirmText: isArabic ? "استعادة" : "Restore",
    });

    if (ok) {
      const success = await restoreQuiz(id);
      if (success) {
        getQuizzes({
          page: currentPage,
          search: debouncedSearchTerm,
          status: selectedStatus,
          course_id: selectedCourse,
          trash: showTrash,
          period: selectedPeriod,
        });
      }
    }
  };

  /**
   * Confirm and permanently delete quiz
   */
  const handleForceDelete = async (id, title) => {
    const ok = await showConfirmCustom({
      title: isArabic ? "حذف نهائي للاختبار" : "Permanently Delete Quiz",
      message: isArabic
        ? `هل أنت متأكد من حذف الاختبار (${title}) نهائياً؟ لا يمكن استعادة هذا الاختبار بعد الحذف.`
        : `Are you sure you want to permanently delete the quiz "${title}"? This action cannot be undone.`,
      icon: "warning",
      variant: "danger",
      confirmText: isArabic ? "حذف نهائي" : "Delete Permanently",
    });

    if (ok) {
      const success = await forceDeleteQuiz(id);
      if (success) {
        getQuizzes({
          page: currentPage,
          search: debouncedSearchTerm,
          status: selectedStatus,
          course_id: selectedCourse,
          trash: showTrash,
          period: selectedPeriod,
        });
      }
    }
  };

  /**
   * Toggle quiz status badge (active/inactive)
   */
  const handleStatusToggle = async (id, currentStatus) => {
    if (showTrash) return; // Prevent status toggle in Trash mode

    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    const ok = await showConfirmCustom({
      title: isArabic ? "تغيير حالة الاختبار" : "Change Quiz Status",
      message: isArabic
        ? `هل أنت متأكد من تغيير حالة الاختبار إلى (${nextStatus === "active" ? "نشط" : "غير نشط"})؟`
        : `Are you sure you want to change this quiz status to ${nextStatus}?`,
      icon: "question",
      variant: "primary",
      confirmText: isArabic ? "نعم، قم بالتغيير" : "Yes, Change it",
    });

    if (ok) {
      await toggleQuizStatus(id, currentStatus);
      getQuizzes({
        page: currentPage,
        search: debouncedSearchTerm,
        status: selectedStatus,
        course_id: selectedCourse,
        trash: showTrash,
        period: selectedPeriod,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Handle form submission for creation and updates
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || formData.title.trim().length < 3) {
      toastError(
        isArabic ? "عنوان الاختبار قصير جداً" : "Quiz title is too short"
      );
      return;
    }
    if (!formData.course_id) {
      toastError(isArabic ? "برجاء اختيار الكورس" : "Please select a course");
      return;
    }

    // Find course name to keep hook display accurate
    const selectedCourseObj = availableCourses.find(
      (c) => c.id === parseInt(formData.course_id)
    );
    const payload = {
      ...formData,
      course_name: selectedCourseObj ? (selectedCourseObj.title || selectedCourseObj.name) : "Custom Course",
    };

    let success = false;
    if (viewingItem) {
      success = await updateQuiz(viewingItem.id, payload);
    } else {
      success = await createQuiz(payload);
    }

    if (success) {
      await getQuizzes({
        page: currentPage,
        search: debouncedSearchTerm,
        status: selectedStatus,
        course_id: selectedCourse,
        trash: showTrash,
        period: selectedPeriod,
      });
      handleBack();
    }
  };

  const loading = quizzesLoading || coursesLoading;

  return (
    <div className="admin-content-page">
      {/* Loading Overlay */}
      {loading && (
        <div className="ac-loading-overlay">
          <Spinner animation="border" variant="danger" />
        </div>
      )}

      {!showForm ? (
        <>
          {/* Header Title and Action Button */}
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">
                {showTrash ? t("quizzes_page.trash_title") : t("quizzes_page.title")}
              </h2>
              <p className="ac-subtitle text-muted mb-0">
                {t("quizzes_page.subtitle")}
              </p>
            </div>
            <div className="d-flex gap-2">
              {!showTrash && (
                <button
                  className="btn btn-danger ac-add-btn"
                  onClick={handleAddNew}
                >
                  <i className="bi bi-plus-lg me-0 me-md-1"></i>
                  <span className="d-none d-md-inline">{t("quizzes_page.add_quiz")}</span>
                </button>
              )}
              <button
                className="btn btn-outline-dark ac-add-btn"
                style={{ color: "#ffffff" }}
                onClick={() => {
                  if (showTrash) {
                    setShowTrash(false);
                    setSelectedPeriod("all");
                    setSelectedStatus("all");
                    setSelectedCourse("all");
                  } else {
                    setShowTrash(true);
                  }
                }}
              >
                <i
                  className={`bi ${showTrash ? "bi-arrow-left" : "bi-trash"} me-0 me-md-2`}
                ></i>
                <span className="d-none d-md-inline">
                  {showTrash ? t("quizzes_page.back_to_active") : t("quizzes_page.trash")}
                </span>
              </button>
            </div>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="ac-rounded-table p-3 p-md-0">
                {/* Search & Filter Controls */}
                <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                  {/* Search Bar */}
                  <div className="ac-search-input-wrapper position-relative">
                    <i
                      className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${searchTerm ? "text-danger fw-bold" : "text-muted"
                        }`}
                      style={{ zIndex: 3 }}
                    ></i>

                    <input
                      type="text"
                      className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${searchTerm
                        ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium"
                        : "border-light bg-light text-muted"
                        }`}
                      placeholder={t("quizzes_page.search_placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ zIndex: 1, position: "relative" }}
                    />

                    {searchTerm && (
                      <button
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-danger p-0 me-3 border-0 bg-transparent"
                        onClick={() => setSearchTerm("")}
                        style={{ zIndex: 3, textDecoration: "none" }}
                      >
                      </button>
                    )}
                  </div>

                  <div className="d-flex gap-2 gap-md-3 flex-wrap flex-md-nowrap">
                    {/* Course Filter */}


                    {/* Status Filter */}
                    <select
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${selectedStatus !== "all"
                        ? "border-danger bg-danger-subtle text-danger-emphasis"
                        : "border-light bg-light text-muted"
                        }`}
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">
                        {t("quizzes_page.all_statuses")}
                      </option>
                      <option value="active">
                        {t("quizzes_page.active_status")}
                      </option>
                      <option value="inactive">
                        {t("quizzes_page.inactive_status")}
                      </option>
                    </select>

                    {/* Date-Range Filter (All time, Last week, Last month, Last year) */}
                    <select
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${selectedPeriod !== "all"
                        ? "border-danger bg-danger-subtle text-danger-emphasis"
                        : "border-light bg-light text-muted"
                        }`}
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                      <option value="all">
                        {t("quizzes_page.all_time")}
                      </option>
                      <option value="last_week">
                        {t("quizzes_page.last_week")}
                      </option>
                      <option value="last_month">
                        {t("quizzes_page.last_month")}
                      </option>
                      <option value="last_year">
                        {t("quizzes_page.last_year")}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Quizzes Table */}
                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle" dir={isArabic ? "rtl" : "ltr"}>
                    <thead>
                      <tr>
                        <th className="text-center">{t("quizzes_page.table_title")}</th>
                        <th className="text-center">{t("quizzes_page.table_course")}</th>
                        <th className="text-center">{t("quizzes_page.table_questions_count")}</th>
                        <th className="text-center">{t("quizzes_page.table_duration")}</th>
                        <th className="text-center">{showTrash ? isArabic ? "تاريخ الحذف" : "Deleted at" : t("quizzes_page.table_status")}</th>
                        <th className="text-center">{t("quizzes_page.table_actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes && quizzes.length > 0 ? (
                        quizzes.map((quizItem) => (
                          <tr key={quizItem.id}>
                            <td className="text-center fw-medium text-dark">
                              {quizItem.title}
                            </td>
                            <td className="text-center text-secondary">
                              {quizItem.course_name}
                            </td>
                            <td className="text-center text-muted fw-bold">
                              {quizItem.questions_count}
                            </td>
                            <td className="text-center text-muted">
                              {quizItem.duration} {isArabic ? "دقيقة" : "mins"}
                            </td>
                            <td className="text-center">
                              {showTrash ? (
                                <span
                                  className="badge rounded-pill 
                                    bg-danger-subtle text-danger"
                                  style={{
                                    padding: "8px 16px",
                                  }}
                                >
                                  <i
                                    className={`bi bi-trash-fill me-1 small`}
                                  ></i>
                                  {quizItem.deleted_at ? new Date(quizItem.deleted_at).toLocaleDateString() : ""}
                                </span>
                              ) : (
                                <span
                                  className={`badge rounded-pill ${quizItem.status === "active"
                                    ? "bg-success-subtle text-success"
                                    : "bg-danger-subtle text-danger"
                                    }`}
                                  style={{
                                    cursor: showTrash ? "default" : "pointer",
                                    padding: "8px 16px",
                                  }}
                                  onClick={() => handleStatusToggle(quizItem.id, quizItem.status)}
                                >
                                  <i
                                    className={`bi ${quizItem.status === "active"
                                      ? "bi-check-circle"
                                      : "bi-pause-circle"
                                      } me-1 small`}
                                  ></i>
                                  {quizItem.status === "active"
                                    ? t("quizzes_page.active_status")
                                    : t("quizzes_page.inactive_status")}
                                </span>
                              )}
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                {showTrash ? (
                                  <>
                                    <button
                                      className="btn btn-sm ac-btn-view border-0 text-success"
                                      title={t("quizzes_page.restore")}
                                      onClick={() => handleRestore(quizItem.id, quizItem.title)}
                                    >
                                      <i className="bi bi-arrow-counterclockwise fs-6"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm ac-btn-deleteTable border-0"
                                      title={t("quizzes_page.force_delete")}
                                      onClick={() => handleForceDelete(quizItem.id, quizItem.title)}
                                    >
                                      <i className="bi bi-trash-fill fs-6"></i>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      className="btn btn-sm ac-btn-view border-0"
                                      title={t("quizzes_page.view_quiz")}
                                      onClick={() => navigate(`view-exam/${quizItem.id}`)}
                                    >
                                      <i className="bi bi-eye fs-6"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm ac-btn-view border-0 text-primary"
                                      title={t("quizzes_page.edit_quiz")}
                                      onClick={() => handleEdit(quizItem)}
                                    >
                                      <i className="bi bi-pencil-square fs-6"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm ac-btn-deleteTable border-0"
                                      title={t("quizzes_page.delete_quiz")}
                                      onClick={() => handleDelete(quizItem.id, quizItem.title)}
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
                          <td colSpan={6} className="text-center py-4 text-muted">
                            {t("quizzes_page.no_quizzes")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination controls */}
            {apiPagination && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="custom-pagination">
                  <Pagination.Prev
                    disabled={apiPagination.current_page === 1}
                    onClick={() => handlePageChange(apiPagination.current_page - 1)}
                  />

                  {[...Array(apiPagination.total_pages)].map((_, index) => (
                    <Pagination.Item
                      style={{ margin: "0 3px" }}
                      key={index + 1}
                      active={apiPagination.current_page === index + 1}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}

                  <Pagination.Next
                    style={{ margin: "0 6px 0" }}
                    disabled={apiPagination.current_page === apiPagination.total_pages}
                    onClick={() => handlePageChange(apiPagination.current_page + 1)}
                  />
                </Pagination>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Create/Edit/View Form Interface */
        <div className="ac-form-container">
          <div className="ac-form-header d-flex justify-content-between align-items-center mb-4">
            <button className="ac-back-btn border-0 bg-transparent d-flex align-items-center" onClick={handleBack}>
              <i
                className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"} fs-4 text-dark`}
              ></i>
              <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                {viewingItem
                  ? isEditing
                    ? t("quizzes_page.edit_quiz")
                    : ""
                  : t("quizzes_page.add_quiz_title")}
              </span>
            </button>

          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm" dir={isArabic ? "rtl" : "ltr"}>
            <div className="ac-tab-content basic-info">
              {/* Quiz Title */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">
                    {t("quizzes_page.quiz_title")}
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("quizzes_page.quiz_title_placeholder")}
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                {/* Course Assignment Selection */}
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("quizzes_page.assign_course")}
                  </label>
                  <select
                    name="course_id"
                    className=" ac-form-select-full-width p-3   bg-light border-0 rounded-3 text-muted"
                    value={formData.course_id}
                    onChange={handleChange}
                  >
                    <option value="">{t("quizzes_page.select_course")}</option>
                    {availableCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title || course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>



              {/* Quiz Description */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {t("quizzes_page.description")}
                </label>
                <textarea
                  name="description"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={t("quizzes_page.description_placeholder")}
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="row mb-4">
                {/* Quiz Duration in Minutes */}
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label fw-bold text-dark">
                    {t("quizzes_page.duration")}
                  </label>
                  <input
                    type="number"
                    name="duration"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("quizzes_page.duration_placeholder")}
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                  />
                </div>

                {/* max attempts */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">
                    {isArabic ? "اقصى عدد للمحاولات" : "Max attemps"}
                  </label>
                  <input
                    type="number"
                    name="max_attempts"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={isArabic ? "اقصى عدد للمحاولات" : "Max attemps"}
                    value={formData.max_attempts}
                    onChange={handleChange}
                    min="1"
                  />
                </div>


                <div className="row mb-4">
                </div> {/* total marks*/}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">
                    {isArabic ? "الدرجة الكلية" : "Total marks"}
                  </label>
                  <input
                    type="number"
                    name="total_marks"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={isArabic ? "الدرجة الكلية" : "Total marks"}
                    value={formData.total_marks}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                {/* pass mark*/}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">
                    {isArabic ? "الدرجة المطلوبة للنجاح" : "pass mark"}
                  </label>
                  <input
                    type="number"
                    name="passing_mark"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={isArabic ? "الدرجة المطلوبة للنجاح" : "pass mark"}
                    value={formData.passing_mark}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>
              {/* is final */}
              <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <label
                    htmlFor="isFinalSwitch"
                    className="d-block mb-0 cp"
                    style={{ cursor: "pointer" }}
                  >
                    <strong className="d-block mb-1">
                      {isArabic ? "اختبار نهائي" : "Final Exam"}
                    </strong>
                    <small className="text-muted">
                      {isArabic
                        ? "اجعل هذا الاختبار اختبار نهائي"
                        : "Make this exam a final exam"}
                    </small>
                  </label>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    id="isFinalSwitch"
                    className="form-check-input form-check-inputS"
                    type="checkbox"
                    role="switch"
                    checked={formData.is_final}
                    onChange={handleChange}
                    name="is_final"
                  />
                </div>
              </div>
              {/* is active  */}
              <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <label
                    htmlFor="isActiveSwitch"
                    className="d-block mb-0 cp"
                    style={{ cursor: "pointer" }}
                  >
                    <strong className="d-block mb-1">
                      {isArabic ? "نشط" : "Active"}
                    </strong>
                    <small className="text-muted">
                      {isArabic
                        ? "اجعل هذا الاختبار نشط"
                        : "Make this exam active"}
                    </small>
                  </label>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    id="isActiveSwitch"
                    className="form-check-input form-check-inputS"
                    type="checkbox"
                    role="switch"
                    checked={formData.is_active}
                    onChange={handleChange}
                    name="is_active"
                  />
                </div>
              </div>
              {/* shuffle questions */}
              <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <label
                    htmlFor="shuffleQuestionsSwitch"
                    className="d-block mb-0 cp"
                    style={{ cursor: "pointer" }}
                  >
                    <strong className="d-block mb-1">
                      {isArabic ? "ترتيب عشوائي للاسئلة" : "Shuffle questions"}
                    </strong>
                    <small className="text-muted">
                      {isArabic
                        ? "اجعل هذا الاختبار عشوائي"
                        : "Make this quiz shuffle questions"}
                    </small>
                  </label>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    id="shuffleQuestionsSwitch"
                    className="form-check-input form-check-inputS"
                    type="checkbox"
                    role="switch"
                    checked={formData.shuffle_questions}
                    onChange={handleChange}
                    name="shuffle_questions"
                  />
                </div>
              </div>










              {/* Footer Save Button for editing */}
              {isEditing && (
                <div className="d-flex justify-content-end gap-2 mt-4 pt-4 border-top">
                  {viewingItem && (
                    <button
                      className="btn btn-success px-5 py-2 fw-medium rounded-3"
                      onClick={() => navigate(`view-exam/${viewingItem.id}`)}
                    >
                      {isArabic ? "عرض الامتحان" : "View Exam"}
                    </button>
                  )}
                  <button
                    className="btn btn-danger px-5 py-2 fw-medium rounded-3"
                    onClick={handleSubmit}
                  >
                    {viewingItem ? t("quizzes_page.update_quiz") : t("quizzes_page.create_quiz")}
                  </button>

                </div>

              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminQuizzes;
