import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "react-bootstrap";
import { useInstructors } from "../../hooks/useInstractor";
import { useGroups } from "../../hooks/useGroups";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { useAdminCourses } from "../../hooks/useAdminCourses";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

// Valores por defecto
const defaultFormData = {
  group_name: "",
  course_id: "",
  instructor_id: "",
  students: [],
};

function AdminGroups() {
  const {
    groups,
    pagination: apiPagination,
    loading,
    availableStudents,
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    getAvailableStudents,
  } = useGroups();
  const { courses, getCourses } = useAdminCourses();
  const { instructors, getInstructors } = useInstructors();

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  // --- States ---
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    getGroups({
      page: currentPage,
      search: debouncedSearch,
      time: timeFilter === "all" ? "" : timeFilter,
      course_id: courseFilter === "all" ? "" : courseFilter,
      instructor_id: instructorFilter === "all" ? "" : instructorFilter,
    });
  }, [
    getGroups,
    currentPage,
    debouncedSearch,
    timeFilter,
    courseFilter,
    instructorFilter,
  ]);

  useEffect(() => {
    getCourses();
    getInstructors({ per_page: 100 });
  }, [getCourses, getInstructors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, timeFilter, courseFilter, instructorFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredGroups = useMemo(() => {
    if (!groups) return [];

    // المجموعات قادمة الآن مفلترة بالبحث جاهزة من الـ API
    return groups.filter((group) => {
      const matchCourse =
        courseFilter === "all" ||
        String(group.course_id) === String(courseFilter);
      const matchInstructor =
        instructorFilter === "all" ||
        String(group.instructor_id) === String(instructorFilter);

      let matchTime = true;
      if (group.created_at) {
        if (timeFilter === "last_week") {
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          matchTime = new Date(group.created_at) >= lastWeek;
        } else if (timeFilter === "last_month") {
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          matchTime = new Date(group.created_at) >= lastMonth;
        }
      }

      return matchCourse && matchInstructor && matchTime;
    });
  }, [groups, courseFilter, instructorFilter, timeFilter]);

  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setFormData(defaultFormData);
    setSelectedStudents([]);
    setShowForm(true);
  };

  const handleEdit = async (group_id) => {
    setViewingItem(null);
    setEditingItem(group_id);
    setSelectedStudents([]);

    const groupData = await getGroupById(group_id);

    // 👈 تأمين وتحويل الـ IDs القادمة من السيرفر لأرقام فوراً لضمان مطابقة الـ Includes
    const normalizedStudents = groupData.students
      ? groupData.students.map((s) => ({ ...s, id: Number(s.id) }))
      : [];

    setFormData({
      group_name: groupData.group_name || "",
      course_id: groupData.course_id ? Number(groupData.course_id) : "",
      course_title: groupData.course_title || "",
      instructor_id: groupData.instructor_id
        ? Number(groupData.instructor_id)
        : "",
      instructor_name: groupData.instructor_name || "",
      students_count: groupData.students_count || 0,
      students: normalizedStudents,
    });

    await getAvailableStudents(group_id);
    setShowForm(true);
  };

  const handleView = async (group_id) => {
    setEditingItem(null);
    setViewingItem(group_id);
    setSelectedStudents([]);

    const group = await getGroupById(group_id);
    const normalizedStudents = group.students
      ? group.students.map((s) => ({ ...s, id: Number(s.id) }))
      : [];

    setFormData({
      group_name: group.group_name || "",
      course_id: group.course_id ? Number(group.course_id) : "",
      course_title: group.course_title || "",
      instructor_id: group.instructor_id ? Number(group.instructor_id) : "",
      instructor_name: group.instructor_name || "",
      students_count: group.students_count || 0,
      students: normalizedStudents,
    });
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
    setSelectedStudents([]);
  };

  const handleDelete = async (groupId) => {
    const group = groups.find((item) => item.id === groupId);
    const ok = await showDeleteConfirm(group?.group_name || "");
    if (ok) {
      const success = await deleteGroup(groupId);
      if (success) {
        getGroups({ page: currentPage });
      }
    }
  };

  const handleRemoveStudentLocal = (studentId) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => Number(s.id) !== Number(studentId)),
      students_count: Math.max(0, prev.students_count - 1),
    }));
  };

  const toggleStudentSelection = (studentId) => {
    const targetId = Number(studentId); // توحيد النوع لرقم صريح
    setSelectedStudents((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId],
    );
  };

  // تأمين وتوحيد الـ IDs الخاصة بالطلاب المتاحين أيضاً
  const normalizedAvailableStudents = useMemo(() => {
    if (!availableStudents) return [];
    return availableStudents.map((s) => ({ ...s, id: Number(s.id) }));
  }, [availableStudents]);

  // فلترة ذكية ومؤمنة تماماً ضد تكرار الـ Keys
  const filteredAvailableStudents = useMemo(() => {
    if (!normalizedAvailableStudents) return [];
    if (!formData.students) return normalizedAvailableStudents;
    return normalizedAvailableStudents.filter(
      (student) =>
        !formData.students.some((curr) => Number(curr.id) === student.id),
    );
  }, [normalizedAvailableStudents, formData.students]);

  const toggleSelectAllStudents = () => {
    if (
      selectedStudents.length === filteredAvailableStudents.length &&
      filteredAvailableStudents.length > 0
    ) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredAvailableStudents.map((s) => s.id));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "course_id" || name === "instructor_id"
            ? Number(value)
            : value,
    }));
  };

  // دالة لتحديث حالة الطالب محلياً في وضع التعديل فقط
  const handleLocalStatusChange = (studentId, newStatus) => {
    const isCompletedValue = newStatus === "completed";

    setFormData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, is_completed: isCompletedValue } : s,
      ),
    }));
  };

  const handleSubmitWrapper = async (e) => {
    e.preventDefault();

    if (!formData.group_name) {
      toastError(
        isArabic ? "يجب إدخال اسم المجموعة" : "Group name is required",
      );
      return;
    }

    try {
      if (editingItem) {
        // 1. Merge current students (with their locally-updated statuses) and
        //    newly checked students (default status: false = in progress).
        const allStudentsData = [
          ...formData.students.map((s) => ({
            id: Number(s.id),
            is_completed: !!s.is_completed,
          })),
          ...selectedStudents.map((id) => ({
            id: Number(id),
            is_completed: false,
          })),
        ];

        // 2. Build student_ids as a flat array — matches 'student_ids' validation rule.
        const student_ids = allStudentsData.map((s) => s.id);

        // 3. Build student_statuses as { [id]: boolean } — matches 'student_statuses' rule.
        //    Using String keys so JSON serialisation is deterministic; the service
        //    already handles both integer and string key lookups.
        const student_statuses = {};
        allStudentsData.forEach((s) => {
          student_statuses[String(s.id)] = s.is_completed;
        });

        const payload = {
          group_name: formData.group_name,
          course_id: Number(formData.course_id),
          instructor_id: Number(formData.instructor_id),
          student_ids, // array of numbers  → validated by 'student_ids.*'
          student_statuses, // object of booleans → validated by 'student_statuses.*'
        };

        await updateGroup(editingItem, payload);
      } else {
        const payload = {
          group_name: formData.group_name,
          course_id: Number(formData.course_id),
          instructor_id: Number(formData.instructor_id),
        };
        await createGroup(payload);
      }

      getGroups({ page: currentPage });
      handleBack();
    } catch (err) { }
  };

  return (
    <div className="admin-content-page">
      {!showForm ? (
        <>
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">
                {isArabic ? "المجموعات الدراسيه" : "Learning Groups"}
              </h2>
              <p className="ac-subtitle text-muted mb-0">
                {isArabic
                  ? "ادارة جميع المجموعات الدراسيه "
                  : "Manage all learning groups"}
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus-lg me-0 me-md-1"></i>
              <span className="d-none d-md-inline">
                {isArabic ? "اضافه مجموعه" : "Add Group"}
              </span>
            </button>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="ac-rounded-table p-3 p-md-0">
                <div className="ac-filters-bar d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-5 ">
                  <div className="ac-search-input-wrapper position-relative ">
                    <i
                      className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${searchTerm ? "text-danger fw-bold" : "text-muted"}`}
                      style={{ zIndex: 3 }}
                    ></i>
                    <input
                      type="text"
                      className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${searchTerm ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium" : "border-light bg-light text-muted"}`}
                      placeholder={
                        isArabic
                          ? "بحث عن مجموعة دراسية..."
                          : "Search By Group Name or Course Name..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ zIndex: 1, position: "relative" }}
                    />
                  </div>

                  <div className="d-flex gap-2 gap-md-3 flex-wrap flex-md-nowrap">
                    <select
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${timeFilter !== "all" ? "border-danger bg-danger-subtle text-danger-emphasis" : "border-light bg-light text-muted"}`}
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                    >
                      <option value="all">
                        {isArabic ? "كل الأوقات" : "All Time"}
                      </option>
                      <option value="last_week">
                        {isArabic ? "آخر أسبوع" : "Last Week"}
                      </option>
                      <option value="last_month">
                        {isArabic ? "آخر شهر" : "Last Month"}
                      </option>
                    </select>

                    <select
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${instructorFilter !== "all" ? "border-danger bg-danger-subtle text-danger-emphasis" : "border-light bg-light text-muted"}`}
                      value={instructorFilter}
                      onChange={(e) => setInstructorFilter(e.target.value)}
                    >
                      <option value="all">
                        {isArabic ? "كل المحاضرين" : "All Instructors"}
                      </option>
                      {instructors?.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle" dir="ltr">
                    <thead>
                      <tr>
                        <th>{isArabic ? "اسم المجموعة" : "Group Name"}</th>
                        <th className="text-center">
                          {isArabic ? "عنوان الدورة" : "Course Title"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "اسم المحاضر" : "Instructor Name"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "عدد الطلاب" : "Students Count"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "تاريخ الإنشاء" : "Created At"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "الإجراءات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-5">
                            <div
                              className="spinner-border text-danger"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredGroups && filteredGroups.length > 0 ? (
                        filteredGroups.map((group) => (
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
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-4 text-muted"
                          >
                            {isArabic ? "لا توجد مجموعات" : "No groups found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

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
                  ? isArabic
                    ? "عرض بيانات المجموعة"
                    : "View Group"
                  : editingItem
                    ? isArabic
                      ? "تعديل بيانات المجموعة"
                      : "Edit Group"
                    : isArabic
                      ? "إضافة مجموعة جديدة"
                      : "Add New Group"}
              </span>
            </button>
          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            <div className="ac-tab-content basic-info">
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {isArabic ? "اسم المجموعة" : "Group Name"}
                </label>
                <input
                  type="text"
                  name="group_name"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={
                    isArabic ? "أدخل اسم المجموعة" : "Enter group name"
                  }
                  value={formData.group_name || ""}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                />
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label fw-bold text-dark">
                    {isArabic ? "عنوان الدورة  " : "Course title"}
                  </label>
                  <select
                    name="course_id"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    value={formData.course_id || ""}
                    onChange={handleChange}
                    disabled={!!viewingItem || !!editingItem}
                  >
                    {viewingItem || editingItem ? (
                      <option value={formData.course_id || ""}>
                        {formData.course_title || ""}
                      </option>
                    ) : (
                      <>
                        <option value="">
                          {isArabic ? "اختر دورة" : "Select course"}
                        </option>
                        {courses?.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">
                    {isArabic ? "المحاضر" : "Instructor"}
                  </label>
                  <select
                    name="instructor_id"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    value={formData.instructor_id || ""}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  >
                    <option value="">
                      {isArabic ? "اختر محاضر" : "Select instructor"}
                    </option>
                    {instructors?.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(viewingItem || editingItem) && (
                <div className="row mb-4">
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark mb-3">
                      {isArabic ? "إحصائيات المجموعة" : "Group Statistics"}
                    </label>
                    <div className="d-flex align-items-center p-3 bg-light rounded-3 border">
                      <div
                        className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mx-3"
                        style={{ width: "45px", height: "45px" }}
                      >
                        <i className="bi bi-people-fill fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-dark fs-5">
                          {formData.students_count || 0}
                        </h6>
                        <small className="text-muted">
                          {isArabic ? "طالب مسجل" : "Enrolled Students"}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* جدول الطلاب الحاليين بالمجموعة */}
              {(viewingItem || editingItem) && (
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
                            {isArabic
                              ? "الطلاب الحاليين بالمجموعة"
                              : "Current Group Students"}
                          </h5>
                          <p className="text-muted small mb-0">
                            {isArabic
                              ? "قائمة بالطلاب المسجلين في هذه المجموعة حالياً"
                              : "List of students currently enrolled in this group"}
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
                                {isArabic ? "الطالب" : "Student"}
                              </th>
                              <th className="py-3 border-0 text-secondary small fw-bold">
                                {isArabic ? "البريد الإلكتروني" : "Email"}
                              </th>
                              <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                {isArabic ? "رقم الهاتف" : "Phone"}
                              </th>
                              <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                {isArabic ? "الحالة" : "Status"}
                              </th>
                              {editingItem && (
                                <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                  {isArabic ? "إجراء" : "Action"}
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="border-0">
                            {formData.students &&
                              formData.students.length > 0 ? (
                              formData.students.map((student) => (
                                <tr
                                  key={`current-${student.id}`}
                                  style={{
                                    borderBottom: "1px solid rgba(0,0,0,0.03)",
                                  }}
                                >
                                  <td className="ps-4 py-3 fw-bold text-dark">
                                    {student.full_name}
                                  </td>
                                  <td className="py-3 text-muted">
                                    {student.email || "-"}
                                  </td>
                                  <td className="py-3 text-center text-muted">
                                    {student.phone || "-"}
                                  </td>
                                  {/* عمود الحالة التفاعلي داخل جدول الطلاب الحاليين */}
                                  <td className="py-3 text-center">
                                    {editingItem ? (
                                      //  في وضع التعديل فقط: يظهر كـ Select Box على شكل بادج دائري أنيق يغير الحالة محلياً
                                      <select
                                        className="form-select form-select-sm rounded-pill px-3 fw-medium text-center border-0 shadow-sm d-inline-block transition-all"
                                        style={{
                                          width: "135px",
                                          backgroundColor: student.is_completed
                                            ? "#d1e7dd"
                                            : "#fff3cd",
                                          color: student.is_completed
                                            ? "#0f5132"
                                            : "#664d03",
                                          cursor: "pointer",
                                          fontSize: "0.85rem",
                                        }}
                                        value={
                                          student.is_completed
                                            ? "completed"
                                            : "progress"
                                        }
                                        onChange={(e) =>
                                          handleLocalStatusChange(
                                            student.id,
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option
                                          value="progress"
                                          style={{
                                            backgroundColor: "#fff",
                                            color: "#333",
                                          }}
                                        >
                                          {isArabic
                                            ? "قيد الدراسة"
                                            : "In Progress"}
                                        </option>
                                        <option
                                          value="completed"
                                          style={{
                                            backgroundColor: "#fff",
                                            color: "#333",
                                          }}
                                        >
                                          {isArabic ? "مكتمل" : "Completed"}
                                        </option>
                                      </select>
                                    ) : (
                                      // في وضع العرض (Show Mode): يظهر كبادج ملون ثابت غير قابل للضغط للقراءة فقط
                                      <span
                                        className="badge rounded-pill px-3 py-2 fw-medium shadow-sm"
                                        style={{
                                          backgroundColor: student.is_completed
                                            ? "#d1e7dd"
                                            : "#fff3cd",
                                          color: student.is_completed
                                            ? "#0f5132"
                                            : "#664d03",
                                          fontSize: "0.85rem",
                                        }}
                                      >
                                        <i
                                          className={`bi ${student.is_completed ? "bi-check-circle-fill" : "bi-hourglass-split"} me-1`}
                                        ></i>
                                        {student.is_completed
                                          ? isArabic
                                            ? "مكتمل"
                                            : "Completed"
                                          : isArabic
                                            ? "قيد الدراسة"
                                            : "In Progress"}
                                      </span>
                                    )}
                                  </td>
                                  {editingItem && (
                                    <td className="py-3 text-center">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-0"
                                        title={
                                          isArabic
                                            ? "إزالة مؤقتة من المجموعة"
                                            : "Remove locally"
                                        }
                                        onClick={() =>
                                          handleRemoveStudentLocal(student.id)
                                        }
                                      >
                                        <i className="bi bi-x-circle fs-5"></i>
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={editingItem ? 4 : 3}
                                  className="text-center py-4 text-muted"
                                >
                                  {isArabic
                                    ? "لا يوجد طلاب في المجموعة، اضغط تحديث لحفظ التغيير"
                                    : "No students in this group. Click update to save."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* جدول تحديد طلاب جدد لإضافتهم للمجموعة */}
              {editingItem &&
                filteredAvailableStudents &&
                filteredAvailableStudents.length > 0 && (
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
                              {isArabic
                                ? "طلاب متاحين للإضافة للمجموعة"
                                : "Available Students to Add"}
                            </h5>
                            <p className="text-muted small mb-0">
                              {isArabic
                                ? "الطلاب المسجلون في الدورة وغير منضمين لأي مجموعة"
                                : "Students enrolled in the course but not assigned to any group"}
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
                            checked={
                              selectedStudents.length ===
                              filteredAvailableStudents.length &&
                              filteredAvailableStudents.length > 0
                            }
                            onChange={toggleSelectAllStudents}
                            style={{
                              width: "1.2em",
                              height: "1.2em",
                              cursor: "pointer",
                            }}
                          />
                          <label
                            className="form-check-label ms-2 fw-medium text-dark"
                            htmlFor="selectAllStudents"
                            style={{ cursor: "pointer" }}
                          >
                            {isArabic ? "تحديد الكل" : "Select All"}
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
                                  {isArabic ? "الطالب" : "Student"}
                                </th>
                                <th className="py-3 border-0 text-secondary small fw-bold">
                                  {isArabic ? "البريد الإلكتروني" : "Email"}
                                </th>
                                <th className="pe-4 py-3 border-0 text-secondary small fw-bold text-center">
                                  {isArabic ? "رقم الهاتف" : "Phone"}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredAvailableStudents.map((student) => (
                                <tr
                                  key={`available-${student.id}`}
                                  className={
                                    selectedStudents.includes(student.id)
                                      ? "table-success"
                                      : ""
                                  }
                                >
                                  <td className="ps-4 py-3">
                                    {/* 👈 تم ضبط الـ Checkbox هنا ليعمل بمنتهى الكفاءة ودون أي تداخلات */}
                                    <input
                                      type="checkbox"
                                      className="form-check-input border-danger"
                                      checked={selectedStudents.includes(
                                        student.id,
                                      )}
                                      onChange={() =>
                                        toggleStudentSelection(student.id)
                                      }
                                      style={{
                                        width: "1.2em",
                                        height: "1.2em",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </td>
                                  <td className="py-3 fw-bold text-dark">
                                    {student.full_name || "-"}
                                  </td>
                                  <td className="py-3 text-muted">
                                    {student.email || "-"}
                                  </td>
                                  <td className="pe-4 py-3 text-center text-muted">
                                    {student.phone || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {!viewingItem && (
                <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                  <button
                    className="btn btn-danger px-5 py-2 fw-medium rounded-3"
                    onClick={handleSubmitWrapper}
                  >
                    {editingItem
                      ? isArabic
                        ? "تحديث المجموعة"
                        : "Update Group"
                      : isArabic
                        ? "إنشاء مجموعة"
                        : "Create Group"}
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
