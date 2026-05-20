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

/**
 * Default form data structure for creating or editing a quiz
 */
const defaultFormData = {
  title: "",
  course_id: "",
  questions_count: "",
  duration: "",
  status: "active",
};

// Fallback courses in case the course API is empty or fails
const fallbackCourses = [
  { id: 1, title: "React Development" },
  { id: 2, title: "HTML/CSS Basics" },
  { id: 3, title: "Advanced Node.js" },
  { id: 4, title: "Database Fundamentals" },
];

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
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  // Fetch courses on load
  useEffect(() => {
    getCourses({ per_page: 100 }).catch((err) => {
      console.log("Failed to fetch courses, falling back to static list", err);
    });
  }, [getCourses]);

  // Combine loaded courses with fallback items
  const availableCourses = courses && courses.length > 0 ? courses : fallbackCourses;

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
   * Fetch quizzes with active filters
   */
  useEffect(() => {
    getQuizzes({
      page: currentPage,
      search: debouncedSearchTerm,
      status: selectedStatus,
      course_id: selectedCourse,
    });
  }, [getQuizzes, currentPage, debouncedSearchTerm, selectedStatus, selectedCourse]);

  /**
   * Reset page when filters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedStatus, selectedCourse]);

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
   * Show quiz details in read-only mode
   */
  const handleView = async (item) => {
    const fullData = await getQuizById(item.id);
    if (fullData) {
      setViewingItem(fullData);
      setIsEditing(false);
      setFormData({
        title: fullData.title || "",
        course_id: fullData.course_id || "",
        questions_count: fullData.questions_count || "",
        duration: fullData.duration || "",
        status: fullData.status || "active",
      });
      setShowForm(true);
    }
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
   * Confirm and delete quiz
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
        });
      }
    }
  };

  /**
   * Toggle quiz status badge
   */
  const handleStatusToggle = async (id, currentStatus) => {
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
              <h2 className="ac-title">{t("quizzes_page.title")}</h2>
              <p className="ac-subtitle text-muted mb-0">
                {t("quizzes_page.subtitle")}
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus-lg me-0 me-md-1"></i>
              <span className="d-none d-md-inline">{t("quizzes_page.add_quiz")}</span>
            </button>
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
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>

                  <div className="d-flex gap-2 gap-md-3 flex-wrap flex-md-nowrap">
                    {/* Course Filter */}
                    <select
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${selectedCourse !== "all"
                        ? "border-danger bg-danger-subtle text-danger-emphasis"
                        : "border-light bg-light text-muted"
                        }`}
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                      <option value="all">
                        {t("quizzes_page.all_courses")}
                      </option>
                      {availableCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title || course.name}
                        </option>
                      ))}
                    </select>

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
                        <th className="text-center">{t("quizzes_page.table_status")}</th>
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
                              <span
                                className={`badge rounded-pill cp ${quizItem.status === "active"
                                  ? "bg-success-subtle text-success"
                                  : "bg-danger-subtle text-danger"
                                  }`}
                                style={{
                                  cursor: "pointer",
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
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  className="btn btn-sm ac-btn-view border-0"
                                  title="View"
                                  onClick={() => handleView(quizItem)}
                                >
                                  <i className="bi bi-eye fs-6"></i>
                                </button>
                                <button
                                  className="btn btn-sm ac-btn-view border-0 text-primary"
                                  title="Edit"
                                  onClick={() => handleEdit(quizItem)}
                                >
                                  <i className="bi bi-pencil-square fs-6"></i>
                                </button>
                                <button
                                  className="btn btn-sm ac-btn-deleteTable border-0"
                                  title="Delete"
                                  onClick={() => handleDelete(quizItem.id, quizItem.title)}
                                >
                                  <i className="bi bi-trash fs-6"></i>
                                </button>
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
            {apiPagination && apiPagination.total_pages > 1 && (
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
                    : t("quizzes_page.view_quiz")
                  : t("quizzes_page.add_quiz_title")}
              </span>
            </button>
            {isEditing && (
              <div className="ac-form-actions d-flex gap-2">
                <button
                  className="btn btn-danger px-4 ac-publish-btn"
                  onClick={handleSubmit}
                >
                  {viewingItem ? t("quizzes_page.update_quiz") : t("quizzes_page.create_quiz")}
                </button>
              </div>
            )}
          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm" dir={isArabic ? "rtl" : "ltr"}>
            <div className="ac-tab-content basic-info">
              {/* Quiz Title */}
              <div className="mb-4">
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
                  disabled={!isEditing}
                />
              </div>

              {/* Course Assignment Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {t("quizzes_page.assign_course")}
                </label>
                <select
                  name="course_id"
                  className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                  value={formData.course_id}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="">{t("quizzes_page.select_course")}</option>
                  {availableCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title || course.name}
                    </option>
                  ))}
                </select>
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
                    disabled={!isEditing}
                    min="1"
                  />
                </div>

                {/* Questions Count */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">
                    {t("quizzes_page.questions_count")}
                  </label>
                  <input
                    type="number"
                    name="questions_count"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("quizzes_page.questions_count_placeholder")}
                    value={formData.questions_count}
                    onChange={handleChange}
                    disabled={!isEditing}
                    min="1"
                  />
                </div>
              </div>

              {/* Status Select Option */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {t("quizzes_page.table_status")}
                </label>
                <select
                  name="status"
                  className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="active">
                    {t("quizzes_page.active_status")}
                  </option>
                  <option value="inactive">
                    {t("quizzes_page.inactive_status")}
                  </option>
                </select>
              </div>

              {/* Footer Save Button for editing */}
              {isEditing && (
                <div className="d-flex justify-content-end mt-4 pt-4 border-top">
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
