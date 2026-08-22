import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOrders } from "../../hooks/useOrders";
import { getStudents as defaultGetStudents } from "../../services/studentsServices";
import { getCourses as defaultGetCourses } from "../../services/coursesServices";
import { selectClass, dateInputClass } from "../../components/shared/adminUiStyles";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

const parseListResponse = (res) => {
  const list = res?.data;
  return Array.isArray(list) ? list : [];
};

function AdminCreateOrder({
  useOrdersHook = useOrders,
  getStudentsFn = defaultGetStudents,
  getCoursesFn = defaultGetCourses,
  basePath = "/admin",
}) {
  const { t, i18n } = useTranslation("orderPayments");
  const isArabic = i18n.language?.startsWith("ar");
  const navigate = useNavigate();
  const { createOrder } = useOrdersHook();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentsPagination, setStudentsPagination] = useState(null);
  const [coursesPagination, setCoursesPagination] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState("");
  const [debouncedCourseSearch, setDebouncedCourseSearch] = useState("");

  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
    billing_name: "",
    billing_email: "",
    billing_phone: "",
    notes: "",
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showBillingOverride, setShowBillingOverride] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedStudentSearch(studentSearch), 500);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCourseSearch(courseSearch), 500);
    return () => clearTimeout(timer);
  }, [courseSearch]);

  useEffect(() => {
    setLoadingStudents(true);
    const params = {
      per_page: 50,
      status: "active",
      for_select: 1,
    };
    const trimmed = debouncedStudentSearch.trim();
    if (trimmed) {
      params.search = trimmed;
    }

    getStudentsFn(params)
      .then((res) => {
        setStudents(parseListResponse(res));
        setStudentsPagination(res?.pagination || null);
      })
      .catch(() => {
        setStudents([]);
        setStudentsPagination(null);
      })
      .finally(() => setLoadingStudents(false));
  }, [debouncedStudentSearch, getStudentsFn]);

  useEffect(() => {
    setLoadingCourses(true);
    const params = {
      per_page: 50,
      status: "published",
    };
    const trimmed = debouncedCourseSearch.trim();
    if (trimmed) {
      params.search = trimmed;
    }

    getCoursesFn(params)
      .then((res) => {
        setCourses(parseListResponse(res));
        setCoursesPagination(res?.meta || res?.pagination || null);
      })
      .catch(() => {
        setCourses([]);
        setCoursesPagination(null);
      })
      .finally(() => setLoadingCourses(false));
  }, [debouncedCourseSearch, getCoursesFn]);

  const displayStudents = useMemo(() => {
    if (!selectedStudent) return students;
    if (students.some((s) => s.id === selectedStudent.id)) return students;
    return [selectedStudent, ...students];
  }, [students, selectedStudent]);

  const displayCourses = useMemo(() => {
    if (!selectedCourse) return courses;
    if (courses.some((c) => c.id === selectedCourse.id)) return courses;
    return [selectedCourse, ...courses];
  }, [courses, selectedCourse]);

  const handleStudentChange = (e) => {
    const id = e.target.value;
    const student = displayStudents.find((s) => String(s.id) === id) || null;
    setSelectedStudent(student);
    setFormData((prev) => ({
      ...prev,
      student_id: id,
      billing_name: student?.full_name || "",
      billing_email: student?.email || "",
      billing_phone: student?.phone || "",
    }));
  };

  const handleCourseChange = (e) => {
    const id = e.target.value;
    const course = displayCourses.find((c) => String(c.id) === id) || null;
    setSelectedCourse(course);
    setFormData((prev) => ({ ...prev, course_id: id }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.course_id) return;

    setSubmitting(true);
    try {
      await createOrder({
        student_id: Number(formData.student_id),
        course_id: Number(formData.course_id),
        billing_name: formData.billing_name || undefined,
        billing_email: formData.billing_email || undefined,
        billing_phone: formData.billing_phone || undefined,
        notes: formData.notes || undefined,
      });
      navigate(`${basePath}/orders`);
    } catch {
      // Error toast shown inside createOrder hook
    } finally {
      setSubmitting(false);
    }
  };

  const coursePrice = selectedCourse ? Number(selectedCourse.price ?? 0) : null;
  const isFree = selectedCourse
    ? selectedCourse.is_free === true || coursePrice <= 0
    : false;

  const showStudentsHint =
    studentsPagination?.total > displayStudents.length && !debouncedStudentSearch.trim();

  const showCoursesHint =
    coursesPagination?.total > displayCourses.length && !debouncedCourseSearch.trim();

  return (
    <div className="admin-content-page">
      <div className="ac-form-container">
        {/* Header */}
        <div className="ac-form-header d-flex justify-content-between align-items-center mb-4">
          <button
            className="ac-back-btn"
            type="button"
            onClick={() => navigate(`${basePath}/orders`)}
          >
            <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}></i>
            <span className="ms-2 me-2 fs-5 fw-bold text-dark">
              {t("backToOrders")}
            </span>
          </button>
          <button
            className="btn btn-danger px-4 ac-publish-btn"
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !formData.student_id || !formData.course_id}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                {isArabic ? "جارٍ الإنشاء..." : "Creating..."}
              </>
            ) : (
              t("submit")
            )}
          </button>
        </div>

        {/* Page title */}
        <div className="mb-4">
          <h2 className="ac-title">{t("createOrderTitle")}</h2>
          <p className="ac-subtitle text-muted mb-0">{t("createOrderSubtitle")}</p>
        </div>

        <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
          <form onSubmit={handleSubmit} noValidate>

            {/* Student + Course side by side */}
            <div className="row g-4 mb-2">

              {/* Student */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-dark">
                  {t("student")} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ac-form-input p-2 border-2 rounded-3 shadow-sm fw-medium transition-all mb-2 ${
                    studentSearch
                      ? "border-danger bg-danger-subtle text-danger-emphasis"
                      : "border-light bg-light text-muted"
                  }`}
                  placeholder={t("searchStudent")}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  autoComplete="off"
                />
                <select
                  name="student_id"
                  className={`p-3 ${selectClass(!!formData.student_id)}`}
                  value={formData.student_id}
                  onChange={handleStudentChange}
                  required
                >
                  <option value="">
                    {loadingStudents ? t("loadingStudents") : t("selectStudent")}
                  </option>
                  {displayStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                      {s.enrollment_number ? ` — ${s.enrollment_number}` : ""}
                    </option>
                  ))}
                </select>
                {showStudentsHint && (
                  <small className="text-muted mt-1 d-block">
                    {t("searchStudentsHint", { count: studentsPagination.total })}
                  </small>
                )}
                {displayStudents.length === 0 && !loadingStudents && debouncedStudentSearch && (
                  <small className="text-muted mt-1 d-block">{t("noStudentsFound")}</small>
                )}
              </div>

              {/* Course */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-dark">
                  {t("course")} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ac-form-input p-2 border-2 rounded-3 shadow-sm fw-medium transition-all mb-2 ${
                    courseSearch
                      ? "border-danger bg-danger-subtle text-danger-emphasis"
                      : "border-light bg-light text-muted"
                  }`}
                  placeholder={t("searchCourse")}
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  autoComplete="off"
                />
                <select
                  name="course_id"
                  className={`p-3 ${selectClass(!!formData.course_id)}`}
                  value={formData.course_id}
                  onChange={handleCourseChange}
                  required
                >
                  <option value="">
                    {loadingCourses ? t("loadingCourses") : t("selectCourse")}
                  </option>
                  {displayCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                      {!c.is_free && Number(c.price) > 0
                        ? ` — EGP ${c.price}`
                        : ` — ${t("freeCourseBadge")}`}
                    </option>
                  ))}
                </select>
                {showCoursesHint && (
                  <small className="text-muted mt-1 d-block">
                    {t("searchCoursesHint", { count: coursesPagination.total })}
                  </small>
                )}
                {displayCourses.length === 0 && !loadingCourses && debouncedCourseSearch && (
                  <small className="text-muted mt-1 d-block">{t("noCoursesFound")}</small>
                )}
              </div>

            </div>

            {/* Course price preview */}
            {selectedCourse && (
              <div className="mb-4 p-3 rounded-3 border"
                style={{ backgroundColor: isFree ? "#e0f2fe" : "#e2f9eb" }}>
                <div className="d-flex align-items-center gap-2">
                  <i
                    className={`bi ${isFree ? "bi-gift-fill" : "bi-currency-dollar"} fs-5`}
                    style={{ color: isFree ? "#0ea5e9" : "#22c55e" }}
                  ></i>
                  <span className="fw-bold text-dark">
                    {t("coursePriceLabel")}:&nbsp;
                  </span>
                  {isFree ? (
                    <span className="badge bg-info text-white px-3 py-2">{t("freeCourseBadge")}</span>
                  ) : (
                    <span className="fw-bold" style={{ color: "#22c55e" }}>
                      EGP {coursePrice}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-4">
              <label className="form-label fw-bold text-dark">
                {isArabic ? "ملاحظات" : "Notes"}
              </label>
              <textarea
                name="notes"
                className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                rows={3}
                placeholder={t("notesPlaceholder")}
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* Billing override toggle */}
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-3 d-flex align-items-center gap-2"
                onClick={() => setShowBillingOverride((v) => !v)}
              >
                <i className={`bi ${showBillingOverride ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
                {t("billingOverride")}
              </button>
            </div>

            {showBillingOverride && (
              <div className="p-3 bg-light rounded-3 border mb-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-dark">
                      {t("billingName")}
                    </label>
                    <input
                      type="text"
                      name="billing_name"
                      className="form-control ac-form-input p-3 bg-white border-0 rounded-3"
                      value={formData.billing_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-dark">
                      {t("billingEmail")}
                    </label>
                    <input
                      type="email"
                      name="billing_email"
                      className="form-control ac-form-input p-3 bg-white border-0 rounded-3"
                      value={formData.billing_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-dark">
                      {t("billingPhone")}
                    </label>
                    <input
                      type="tel"
                      name="billing_phone"
                      className="form-control ac-form-input p-3 bg-white border-0 rounded-3"
                      value={formData.billing_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateOrder;
