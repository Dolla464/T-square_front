import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "react-bootstrap";
import { useInstructors } from "../../hooks/useInstractor";
import { useGroups } from "../../hooks/useGroups";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { useAdminCourses } from "../../hooks/useAdminCourses";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

// القيم الافتراضية لنموذج إضافة/تعديل مجموعة دراسية
const defaultFormData = {
  group_name: "",
  course_id: "",
  instructor_id: "",
};

function AdminGroups() {
  // --- هوك المجموعات الدراسية (البيانات الأساسية للجدول) ---
  const { groups, pagination: apiPagination, loading, getGroups, getGroupById, createGroup, updateGroup, deleteGroup } = useGroups();

  // --- هوك الدورات والمحاضرين (للقوائم المنسدلة في الفورم) ---
  const { courses, getCourses } = useAdminCourses();
  const { instructors, getInstructors } = useInstructors();

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  // --- حالات المكون (States) ---
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);

  // استخدام debounced search لتقليل طلبات الـ API أثناء الكتابة
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // جلب المجموعات الدراسية بناءً على الفلاتر والصفحة الحالية
  useEffect(() => {
    getGroups({
      page: currentPage,
      search: debouncedSearch,
      time: timeFilter === "all" ? "" : timeFilter,
      course_id: courseFilter === "all" ? "" : courseFilter,
      instructor_id: instructorFilter === "all" ? "" : instructorFilter,
    });
  }, [getGroups, currentPage, debouncedSearch, timeFilter, courseFilter, instructorFilter]);

  // جلب الدورات والمحاضرين مرة واحدة عند التحميل (للقوائم المنسدلة)
  useEffect(() => {
    getCourses();
    getInstructors({ per_page: 100 }); // جلب عدد كبير لضمان ظهورهم في القائمة المنسدلة
  }, [getCourses, getInstructors]);

  // العودة للصفحة الأولى عند تغيير نصوص البحث أو الفلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, timeFilter, courseFilter, instructorFilter]);

  // تغيير الصفحة
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // فتح فورم الإضافة
  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  // فتح فورم التعديل
  const handleEdit = (group_id) => {
    setViewingItem(null);
    setEditingItem(group_id);

    // البحث عن المجموعة المحددة وملء بيانات الفورم
    const groupData = groups.find((g) => g.id === group_id) || {};
    setFormData({
      group_name: groupData.group_name || "",
      course_id: groupData.course_id || "",
      instructor_id: groupData.instructor_id || "",
    });
    setShowForm(true);
  };

  // عرض تفاصيل المجموعة
  const handleView = async (group_id) => {
    setEditingItem(null);
    setViewingItem(group_id);

    // جلب البيانات التفصيلية من الـ API
    const group = await getGroupById(group_id);
    setFormData({
      group_name: group.group_name || "",
      course_id: group.course_id || "",
      course_title: group.course_title || "",
      instructor_id: group.instructor_id || "",
      instructor_name: group.instructor_name || "",
      students_count: group.students_count || "",
    });
    setShowForm(true);
  };

  // إغلاق الفورم والعودة للجدول
  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
  };

  // حذف مجموعة
  const handleDelete = async (groupId) => {
    const group = groups.find((item) => item.id === groupId);
    const ok = await showDeleteConfirm(group?.group_name || "");
    if (ok) {
      const success = await deleteGroup(groupId);
      if (success) {
        // تحديث الجدول بعد الحذف
        getGroups({
          page: currentPage,
          search: debouncedSearch,
          time: timeFilter === "all" ? "" : timeFilter,
          course_id: courseFilter === "all" ? "" : courseFilter,
          instructor_id: instructorFilter === "all" ? "" : instructorFilter,
        });
      }
    }
  };

  // معالجة تغييرات حقول الإدخال
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  /**
   * تجهيز البيانات للإرسال بناءً على متطلبات الـ API لكل حالة
   */
  const preparePayload = (data) => {
    return {
      group_name: data.group_name,
      course_id: data.course_id,
      instructor_id: data.instructor_id,
    };
  };

  // حفظ الفورم (إضافة أو تعديل)
  const handleSubmitWrapper = async (e) => {
    e.preventDefault();

    // التحقق الأساسي من صحة البيانات قبل الإرسال (Frontend Validation)
    if (!formData.group_name) {
      toastError(isArabic ? "يجب إدخال اسم المجموعة" : "Group name is required");
      return;
    }
    if (!formData.course_id) {
      toastError(isArabic ? "يجب اختيار الدورة" : "Course is required");
      return;
    }
    if (!formData.instructor_id) {
      toastError(isArabic ? "يجب اختيار المحاضر" : "Instructor is required");
      return;
    }

    try {
      const payload = preparePayload(formData);
      if (editingItem) {
        await updateGroup(editingItem, payload);
      } else {
        await createGroup(payload);
      }
      // إعادة تحميل الجدول بعد الحفظ
      getGroups({
        page: currentPage,
        search: debouncedSearch,
        time: timeFilter === "all" ? "" : timeFilter,
        course_id: courseFilter === "all" ? "" : courseFilter,
        instructor_id: instructorFilter === "all" ? "" : instructorFilter,
      });
      handleBack();
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="admin-content-page">
      {!showForm ? (
        <>
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">{isArabic ? "المجموعات الدراسيه" : "Learning Groups"}</h2>
              <p className="ac-subtitle text-muted mb-0">
                {isArabic ? "ادارة جميع المجموعات الدراسيه " : "Manage all learning groups"}
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              + {isArabic ? "اضافه مجموعه" : "Add Group"}
            </button>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="table-responsive ac-rounded-table">


                <div className="ac-filters-bar d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-4">
                  {/* 1. شريط البحث (Search Input) */}
                  <div className="ac-search-input-wrapper position-relative " style={{ width: "650px ", marginRight: "auto" }}>
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
                      placeholder={isArabic ? "بحث عن مجموعة دراسية..." : "Search Group..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ zIndex: 1, position: "relative" }}
                    />


                  </div>

                  <div className="d-flex gap-2 gap-md-3 flex-wrap flex-md-nowrap mt-3 mt-md-0">
                    {/* فلتر الوقت */}
                    <select
                      className={`form-select  ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${timeFilter !== "all"
                        ? "border-danger bg-danger-subtle text-danger-emphasis"
                        : "border-light bg-light text-muted"
                        }`}
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                    >
                      <option value="all">{isArabic ? "كل الأوقات" : "All Time"}</option>
                      <option value="last_week">{isArabic ? "آخر أسبوع" : "Last Week"}</option>
                      <option value="last_month">{isArabic ? "آخر شهر" : "Last Month"}</option>
                    </select>

                    {/* فلتر الكورس */}
                    <select
                      className={`form-select  ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${courseFilter !== "all"
                        ? "border-danger bg-danger-subtle text-danger-emphasis"
                        : "border-light bg-light text-muted"
                        }`}
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                    >
                      <option value="all">{isArabic ? "كل الكورسات" : "All Courses"}</option>
                      {courses?.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>

                    {/* فلتر المحاضر */}
                    <select
                      className={`form-select  ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${instructorFilter !== "all"
                        ? "border-danger bg-danger-subtle text-danger-emphasis"
                        : "border-light bg-light text-muted"
                        }`}
                      value={instructorFilter}
                      onChange={(e) => setInstructorFilter(e.target.value)}
                    >
                      <option value="all">{isArabic ? "كل المحاضرين" : "All Instructors"}</option>
                      {instructors?.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>


                <table className="table ac-table mb-0 align-middle" dir="ltr">
                  <thead>
                    <tr>
                      <th>{isArabic ? "اسم المجموعة" : "Group Name"}</th>
                      <th className="text-center">{isArabic ? "عنوان الدورة" : "Course Title"}</th>
                      <th className="text-center">{isArabic ? "اسم المحاضر" : "Instructor Name"}</th>
                      <th className="text-center">{isArabic ? "عدد الطلاب" : "Students Count"}</th>
                      <th className="text-center">{isArabic ? "تاريخ الإنشاء" : "Created At"}</th>
                      <th className="text-center">{isArabic ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="text-center py-5">
                          <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : groups && groups.length > 0 ? (
                      groups.map((group, index) => {
                        return (
                          <tr key={group.id}>
                            <td className="fw-medium text-dark">
                              {group.group_name}
                            </td>
                            <td className="text-center text-secondary">
                              {group.course_title}
                            </td>
                            <td className="text-center text-secondary">
                              {group.instructor_name}
                            </td>
                            <td className="text-center text-secondary">
                              {group.students_count}
                            </td>
                            <td className="text-center text-secondary">
                              {group.created_at}
                            </td>

                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  className="btn btn-sm ac-btn-view border-0"
                                  title="View"
                                  onClick={() => handleView(group.id)}
                                >
                                  <i className="bi bi-eye fs-6"></i>
                                </button>
                                <button
                                  className="btn btn-sm ac-btn-edit border-0"
                                  title="Edit"
                                  onClick={() => handleEdit(group.id)}
                                >
                                  <i className="bi bi-pencil-square fs-6"></i>
                                </button>
                                <button
                                  className="btn btn-sm ac-btn-deleteTable border-0"
                                  title="Delete"
                                  onClick={() => handleDelete(group.id)}
                                >
                                  <i className="bi bi-trash fs-6"></i>
                                </button>

                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={11} className="text-center py-4 text-muted">
                          {isArabic ? "لا توجد مجموعات" : "No groups found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination - Always visible if data exists */}
            {apiPagination && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="custom-pagination">

                  <Pagination.Prev

                    disabled={apiPagination.current_page === 1}
                    onClick={() =>
                      handlePageChange(apiPagination.current_page - 1)
                    }
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

                    disabled={
                      apiPagination.current_page === apiPagination.total_pages
                    }
                    onClick={() =>
                      handlePageChange(apiPagination.current_page + 1)
                    }
                  />

                </Pagination>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="ac-form-container">
          <div className="ac-form-header d-flex justify-content-between align-items-center mb-4">
            <button className="ac-back-btn" onClick={handleBack}>
              <i
                className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
              ></i>
              <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                {viewingItem
                  ? (isArabic ? "عرض بيانات المجموعة" : "View Group")
                  : editingItem
                    ? (isArabic ? "تعديل بيانات المجموعة" : "Edit Group")
                    : (isArabic ? "إضافة مجموعة جديدة" : "Add New Group")}
              </span>
            </button>

          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            <div className="ac-tab-content basic-info">

              {/* اسم المجموعه  */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">{isArabic ? "اسم المجموعة" : "Group Name"}</label>
                <input
                  type="text"
                  name="group_name"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={isArabic ? "أدخل اسم المجموعة" : "Enter group name"}
                  value={formData.group_name || ""}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                />
              </div>

              {/* الدورة والمحاضر */}
              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label fw-bold text-dark">{isArabic ? "عنوان الدورة  " : "Course title"}</label>
                  <select
                    name="course_id"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    value={formData.course_id || ""}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  >
                    {viewingItem ? <option value={formData.course_id || ""}>{formData.course_title || ""}</option> :
                      <>
                        <option value="">{isArabic ? "اختر دورة" : "Select course"}</option>
                        {courses?.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}</>}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">{isArabic ? "المحاضر" : "Instructor"}</label>
                  <select
                    name="instructor_id"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    value={formData.instructor_id || ""}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  >
                    <option value="">{isArabic ? "اختر محاضر" : "Select instructor"}</option>
                    {instructors?.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* عدد الطلاب (يظهر فقط في وضع العرض) */}
              {viewingItem && (
                <div className="row mb-4">
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark mb-3">{isArabic ? "إحصائيات المجموعة" : "Group Statistics"}</label>
                    <div className="d-flex align-items-center p-3 bg-light rounded-3 border">
                      <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mx-3" style={{ width: '45px', height: '45px' }}>
                        <i className="bi bi-people-fill fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-dark fs-5">{formData.students_count || 0}</h6>
                        <small className="text-muted">{isArabic ? "طالب مسجل" : "Enrolled Students"}</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* تفاصيل إضافية للعرض فقط */}
              {viewingItem && (
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
                          <h5
                            className="fw-bold mb-0 text-dark"
                            style={{ letterSpacing: "-0.5px" }}
                          >
                            {isArabic ? "طلاب المجموعة" : "Group Students"}
                          </h5>
                          <p className="text-muted small mb-0">
                            {isArabic
                              ? "قائمة بالطلاب المسجلين في هذه المجموعة"
                              : "List of students enrolled in this group"}
                          </p>
                        </div>
                      </div>
                      <div
                        className="flex-grow-1 ms-4 d-none d-md-block"
                        style={{
                          height: "1px",
                          background:
                            "linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)",
                        }}
                      ></div>
                    </div>
                    <div
                      className="card border-0 shadow-sm overflow-hidden"
                      style={{
                        backgroundColor: "#f8f9fc",
                        borderRadius: "15px",
                        border: "5px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="table-responsive">
                        <table className="table mb-0 align-middle">
                          <thead>
                            <tr>
                              <th className="ps-4 py-3 border-0 text-secondary text-uppercase small fw-bold">
                                {isArabic ? "الطالب" : "Student"}
                              </th>
                              <th className="py-3 border-0 text-secondary text-uppercase small fw-bold">
                                {isArabic ? "البريد الإلكتروني" : "Email"}
                              </th>
                              <th className="py-3 border-0 text-secondary text-uppercase small fw-bold text-center">
                                {isArabic ? "رقم الهاتف" : "Phone"}
                              </th>
                              <th className="py-3 border-0 text-secondary text-uppercase small fw-bold text-center">
                                {isArabic ? "تاريخ الانضمام" : "Join Date"}
                              </th>
                              <th className="pe-4 py-3 border-0 text-secondary text-uppercase small fw-bold text-center">
                                {isArabic ? "الحالة" : "Status"}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="border-0">
                            {/* صف استاتيك كما طلب المستخدم */}
                            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                              <td className="ps-4 py-3 fw-bold text-dark">
                                أحمد محمد
                              </td>
                              <td className="py-3 text-muted">
                                ahmed.mohamed@example.com
                              </td>
                              <td className="py-3 text-center text-muted">
                                01000000000
                              </td>
                              <td className="py-3 text-center small text-secondary">
                                2026-05-16
                              </td>
                              <td className="pe-4 py-3 text-center">
                                <span className="badge bg-success-subtle text-success-emphasis rounded-pill px-3 py-2">
                                  {isArabic ? "نشط" : "Active"}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* أزرار التحكم */}
              {!viewingItem && (
                <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                  <button className="btn btn-danger px-5 py-2 fw-medium rounded-3" onClick={handleSubmitWrapper}>
                    {editingItem ? (isArabic ? "تحديث المجموعة" : "Update Group") : (isArabic ? "إنشاء مجموعة" : "Create Group")}
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

export default AdminGroups;
