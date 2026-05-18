import { useEffect, useState } from "react";
import { Pagination, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  showConfirmCustom,
  showDeleteConfirm,
} from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { useGroups } from "../../hooks/useGroups";
import { useStudents } from "../../hooks/useStudents";

/**
 * Default form data structure for creating or editing a student, ensuring all necessary fields are initialized to empty or default values to prevent uncontrolled input issues in the form components
 */
const defaultFormData = {
  full_name: "",
  email: "",
  role: "student",
  password: "",
  phone: "",
  enrollment_number: "",
  group_id: "",
  gender: "male",
  status: "active",
  avatar: null,
};

function AdminStudents() {
  const { selectionGroups, getGroupsSelection } = useGroups();

  const {
    students,
    pagination: apiPagination,
    loading,
    getStudents,
    getStudentById,
    createStudent,
    deleteStudent,
    updateStudentStatus,
    toggleStudentVerify,
    updateStudentCourseGroup,
    updateStudentCourseStatus,
  } = useStudents();

  // State variables for managing form visibility, current editing/viewing item, search and filter criteria, form data, and pagination
  const [showForm, setShowForm] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  /**
   * Debounce the search term input to avoid making API calls on every keystroke, updating the debounced value 500ms after the user stops typing
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Get students with filters and pagination whenever any of the dependencies change (page, search term, status, gender, group)
   */
  useEffect(() => {
    getStudents({
      page: currentPage,
      search: debouncedSearchTerm,
      status: selectedStatus === "all" ? "" : selectedStatus,
      gender: selectedGender === "all" ? "" : selectedGender,
      group_id: selectedGroup === "all" ? "" : selectedGroup,
    });
  }, [
    getStudents,
    currentPage,
    debouncedSearchTerm,
    selectedStatus,
    selectedGender,
    selectedGroup,
  ]);

  // Refetch groups for selection in form
  useEffect(() => {
    getGroupsSelection();
  }, [getGroupsSelection]);

  /**
   * Reset to first page whenever search term or filters change, to ensure we show results from the beginning of the list after applying new criteria
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedStatus, selectedGender, selectedGroup]);

  /**
   * Handle WhatsApp communication by formatting the student's phone number correctly and opening a pre-filled message in WhatsApp Web for welcoming the student and providing their account details
   */
  const handleWhatsapp = (student) => {
    if (!student) return;

    let phone = student.phone || "";
    phone = phone.replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone = "20" + phone.slice(1);
    }

    if (!phone.startsWith("20")) {
      phone = "20" + phone;
    }

    const message = `
      Welcome to T-Square! 🎉

      We are excited to have you on board.

      Your account has been created successfully.

      📌 Login Details:
      👤 Name: ${student.full_name || "-"}
      📧 Email: ${student.email || "-"}
      📱 Phone: ${student.phone || "-"}
      🔑 Password: ${student.password || "as you registered"}

      ⚠️ Please change your password after your first login.

      🌐 Platform:
      https://t-square.com/

      If you need any help, feel free to contact our support team.

      We wish you a great learning experience 🚀
    `;

    const encodedMessage = encodeURIComponent(message.trim());

    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  /**
   * Moving in pages
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   /* Calculate the range of page numbers to display in the pagination component, adding ellipses when there are many pages to keep the UI clean and user-friendly
   */
  // const getPageRange = () => {
  //   if (!apiPagination) return [];
  //   const { current_page, last_page } = apiPagination;
  //   const delta = 2;
  //   const range = [];
  //   for (
  //     let i = Math.max(2, current_page - delta);
  //     i <= Math.min(last_page - 1, current_page + delta);
  //     i++
  //   ) {
  //     range.push(i);
  //   }
  //   if (current_page - delta > 2) range.unshift("...");
  //   if (current_page + delta < last_page - 1) range.push("...");
  //   range.unshift(1);
  //   if (last_page > 1) range.push(last_page);
  //   return range;
  // };

  /**
   * Prepare the form for adding a new student by resetting all relevant state to default values
   */
  const handleAddNew = () => {
    setViewingItem(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  /**
   * View student data in a read-only form, fetching full details from the API to ensure we have all necessary information for display
   */
  const handleView = async (studentFromTable) => {
    const fullStudentData = await getStudentById(studentFromTable.id);

    if (fullStudentData) {
      setViewingItem(fullStudentData);

      setFormData({
        full_name: fullStudentData.full_name || "",
        email: fullStudentData.email || "",
        role: "student",
        phone: fullStudentData.phone || "",
        enrollment_number: fullStudentData.enrollment_number || "",
        group_id: fullStudentData.group_id || "",
        group_name: fullStudentData.learning_group?.group_name || "",
        gender: fullStudentData.full_gender || "male",
        status: fullStudentData.status || "active",
        avatar: fullStudentData.avatar,
        created_at: fullStudentData.created_at || "",
        enrolled_courses: fullStudentData.enrolled_courses || [],
      });

      setShowForm(true);
    }
  };

  /**
   * Back to list view and reset form state
   */
  const handleBack = () => {
    setShowForm(false);
    setViewingItem(null);
  };

  /**
   * Delete student with confirmation, then refresh the list if deletion was successful
   */
  const handleDelete = async (id) => {
    const student = students.find((item) => item.id === id);
    const ok = await showDeleteConfirm(student?.full_name || "");
    if (ok) {
      await deleteStudent(id);
      getStudents({
        page: currentPage,
        search: debouncedSearchTerm,
        status: selectedStatus === "all" ? "" : selectedStatus,
        group_id: selectedGroup === "all" ? "" : selectedGroup,
      });
    }
  };

  /**
   * Update local form state on input change, handling both text and checkbox inputs
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Handle form submission for create operation only, with validation and error handling
   */
  const handleSubmitWrapper = async (e) => {
    e.preventDefault();
    if (formData.full_name.length < 5) {
      toastError(
        isArabic ? "الاسم الكامل قصير جداً" : "Full name is too short",
      );
      return;
    }

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) formDataObj.append(key, formData[key]);
    });

    const success = await createStudent(formDataObj);
    if (success) {
      await getStudents({
        page: currentPage,
        search: debouncedSearchTerm,
        status: selectedStatus === "all" ? "" : selectedStatus,
        gender: selectedGender === "all" ? "" : selectedGender,
        group_id: selectedGroup === "all" ? "" : selectedGroup,
      });
      handleBack();
    }
  };

  /**
   * Handle status update for a student
   */
  const handleStatusUpdate = async (id, newStatus) => {
    const ok = await showConfirmCustom({
      title: isArabic ? "تغيير حالة الطالب" : "Change Student Status",
      message: isArabic
        ? `هل أنت متأكد من تغيير حالة الطالب إلى (${newStatus === "active" ? "نشط" : "غير نشط"})؟`
        : `Are you sure you want to change the student status to ${newStatus}?`,
      icon: "question",
      variant: "primary",
      confirmText: isArabic ? "نعم، قم بالتغيير" : "Yes, Change it",
    });

    if (ok) {
      try {
        await updateStudentStatus(id, newStatus);
      } catch (error) {
        console.error("Status update failed:", error);
      }
    }
  };

  /**
   * Handle verification update for a student
   */
  const handleVerifyUpdate = async (studentId, currentIsVerified) => {
    const ok = await showConfirmCustom({
      title: currentIsVerified
        ? isArabic
          ? "إلغاء توثيق الحساب"
          : "Unverify Account"
        : isArabic
          ? "توثيق الحساب"
          : "Verify Account",
      message: currentIsVerified
        ? isArabic
          ? "هل تريد إلغاء توثيق بريد هذا الطالب؟"
          : "Do you want to unverify this student's email?"
        : isArabic
          ? "سيتم اعتبار بريد الطالب موثقاً وفعالاً."
          : "The student's email will be marked as verified.",
      icon: currentIsVerified ? "warning" : "info",
      variant: currentIsVerified ? "danger" : "primary",
      confirmText: isArabic ? "استمرار" : "Proceed",
    });

    if (ok) {
      try {
        await toggleStudentVerify(studentId);
        // الهوك بتاعنا هيتولى تحديث الـ state فمش محتاجين نعمل حاجة هنا
      } catch (error) {
        console.error("Error in toggleVerify:", error);
      }
    }
  };

  /**
   * Handle course group change for a student's enrolled course, with confirmation and error handling, and update local form state to reflect the change immediately in the UI after a successful API call
   */
  const handleCourseGroupChange = async (courseId, newGroupId) => {
    const ok = await showConfirmCustom({
      title: isArabic ? "تغيير المجموعة" : "Change Group",
      message: isArabic
        ? "هل أنت متأكد من تغيير مجموعة الطالب لهذا الكورس؟"
        : "Are you sure you want to change the student's group for this course?",
      icon: "warning",
      confirmText: isArabic ? "تغيير" : "Update",
    });

    if (ok) {
      try {
        await updateStudentCourseGroup(viewingItem.id, courseId, newGroupId);

        // تحديث البيانات في الـ state المحلي للفورم ليعكس الاختيار الجديد فوراً
        setFormData((prev) => ({
          ...prev,
          enrolled_courses: prev.enrolled_courses.map((course) =>
            course.id === courseId
              ? { ...course, group_id: newGroupId }
              : course,
          ),
        }));
      } catch (error) {
        console.error("Group update failed:", error);
      }
    }
  };

  /**
   * Handle course status toggle for a student's enrolled course, with confirmation and error handling, and update local form state to reflect the change immediately in the UI after a successful API call
   */
  const handleStatusToggle = async (studentId, courseId, currentStatus) => {
    const nextStatus = !currentStatus;

    // 1. إظهار ديالوج التأكيد المخصص بناءً على الحالة الجديدة
    const ok = await showConfirmCustom({
      title: isArabic ? "تغيير حالة المقرر" : "Change Course Status",
      message: isArabic
        ? `هل أنت متأكد من تحويل حالة المقرر إلى (${nextStatus ? "مكتمل" : "قيد التنفيذ"})؟`
        : `Are you sure you want to change the course status to (${nextStatus ? "Completed" : "In Progress"})?`,
      icon: "warning",
      confirmText: isArabic ? "تعديل" : "Confirm",
    });

    if (ok) {
      try {
        // 2. استدعاء دالة الهوك لتحديث الباك إند
        await updateStudentCourseStatus(studentId, courseId, nextStatus);

        // 3. تحديث الـ state المحلي للفورم (formData) ليعكس الحالة الجديدة في الـ Modal فوراً
        setFormData((prev) => ({
          ...prev,
          enrolled_courses: (prev.enrolled_courses || []).map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  is_completed: nextStatus,
                  // حركة ذكية: لو الكورس تقلب "مكتمل"، بنلغي الجروب الحالي جوه الفورم عشان يتماشى مع لوجيك الباك إند
                  ...(nextStatus ? { group_id: null } : {}),
                }
              : course,
          ),
        }));
      } catch (error) {
        console.error("Failed to toggle course status:", error);
      }
    }
  };

  return (
    <div className="admin-content-page">
      {/* طبقة التحميل */}
      {loading && (
        <div className="ac-loading-overlay">
          <Spinner animation="border" variant="danger" />
        </div>
      )}

      {!showForm ? (
        <>
          {/* رأس الصفحة: العنوان وزر الإضافة */}
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">{t("students_page.title")}</h2>
              <p className="ac-subtitle text-muted mb-0">
                {t("students_page.subtitle")}
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus-lg me-0 me-md-1"></i>
              <span className="d-none d-md-inline">{isArabic ? "إضافة طالب" : "Add Student"}</span>
            </button>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="ac-rounded-table p-3 p-md-0">
                {/* أدوات البحث والفلترة */}
                <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
                  {/* 1. شريط البحث (Search Input) */}
                  <div className="ac-search-input-wrapper position-relative">
                    <i
                      className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${
                        searchTerm ? "text-danger fw-bold" : "text-muted"
                      }`}
                      style={{ zIndex: 3 }}
                    ></i>

                    <input
                      type="text"
                      // ضبطنا الـ padding من الشمال (ps-5) عشان الكلام ميبدأش من فوق الأيقونة
                      className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${
                        searchTerm
                          ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium"
                          : "border-light bg-light text-muted"
                      }`}
                      placeholder={t("students_page.search_placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ zIndex: 1, position: "relative" }} // تأمين طبقة الحقل عشان يقبل الـ click دائماً
                    />

                    {/* زرار مسح البحث مع تأمين الـ zIndex عشان يفضل قابل للضغط */}
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
                    {/* 2. فلتر الحالات (Statuses) */}
                    <select
                      // التعديل: لو مش على وضع "all" بياخد خلفية حمراء باهتة وبوردر واضح
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${
                        selectedStatus !== "all"
                          ? "border-danger bg-danger-subtle text-danger-emphasis"
                          : "border-light bg-light text-muted"
                      }`}
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">
                        {t("students_page.all_statuses")}
                      </option>
                      <option value="active">
                        {t("students_page.active_status")}
                      </option>
                      <option value="inactive">
                        {t("students_page.inactive_status")}
                      </option>
                    </select>

                    {/* 3. فلتر المجموعات (Groups) */}
                    <select
                      // التعديل: لو مش على وضع "all" بياخد خلفية حمراء باهتة وبوردر واضح
                      className={`form-select ac-form-select  border-2 rounded-3 shadow-sm fw-medium transition-all ${
                        selectedGroup !== "all"
                          ? "border-danger bg-danger-subtle text-danger-emphasis"
                          : "border-light bg-light text-muted"
                      }`}
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                      <option value="all">
                        {isArabic ? "كل المجموعات" : "All Groups"}
                      </option>
                      {selectionGroups &&
                        selectionGroups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                    </select>

                    {/* 4. فلتر النوع (Genders) */}
                    <select
                      // التعديل: لو مش على وضع "all" بياخد خلفية حمراء باهتة وبوردر واضح
                      className={`form-select ac-form-select  border-2 rounded-3 shadow-sm fw-medium transition-all ${
                        selectedGender !== "all"
                          ? "border-danger bg-danger-subtle text-danger-emphasis"
                          : "border-light bg-light text-muted"
                      }`}
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                    >
                      <option value="all">
                        {t("students_page.all_genders")}
                      </option>
                      <option value="male">
                        {t("students_page.male_option")}
                      </option>
                      <option value="female">
                        {t("students_page.female_option")}
                      </option>
                    </select>
                  </div>
                  
                </div>

                {/* جدول عرض الطلاب */}
                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle" dir="ltr">
                    <thead>
                      <tr>
                        <th className="text-center">
                          {t("students_page.table_enrollment")}
                        </th>
                        <th className="text-center">
                          {t("students_page.table_name")}
                        </th>
                        <th className="text-center">
                          {t("students_page.table_email")}
                        </th>
                        <th className="text-center">
                          {t("students_page.table_phone")}
                        </th>
                        <th className="text-center">
                          {isArabic ? "المجموعة" : "Group"}
                        </th>
                        <th className="text-center">
                          {t("students_page.table_status")}
                        </th>
                        <th className="text-center">
                          {t("students_page.table_verified")}
                        </th>
                        <th className="text-center">
                          {t("students_page.table_actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students && students.length > 0 ? (
                        students.map((student) => (
                          <tr key={student.id}>
                            <td className="text-center fw-medium text-muted">
                              {student.enrollment_number}
                            </td>
                            <td className="text-center fw-medium text-dark">
                              {student.full_name}
                            </td>
                            <td className="text-center text-secondary">
                              {student.email}
                            </td>

                            <td className="text-center text-secondary">
                              {student.phone || "-"}
                            </td>
                            <td className="text-center text-secondary">
                              {student.learning_group?.group_name}
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge rounded-pill cp ${student.status === "active" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                                style={{
                                  cursor: "pointer",
                                  padding: "8px 16px",
                                }}
                                onClick={() =>
                                  handleStatusUpdate(
                                    student.id,
                                    student.status === "active"
                                      ? "inactive"
                                      : "active",
                                  )
                                }
                              >
                                <i
                                  className={`bi ${student.status === "active" ? "bi-check-circle" : "bi-pause-circle"} me-1 Small`}
                                ></i>
                                {student.status === "active"
                                  ? t("students_page.active_status")
                                  : t("students_page.inactive_status")}
                              </span>
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge rounded-pill cp ${student.is_verified ? "bg-primary-subtle text-primary" : "bg-warning-subtle text-warning"}`}
                                style={{
                                  cursor: "pointer",
                                  padding: "8px 16px",
                                }}
                                onClick={() =>
                                  handleVerifyUpdate(
                                    student.id,
                                    student.is_verified,
                                  )
                                }
                              >
                                <i
                                  className={`bi ${student.is_verified ? "bi-patch-check-fill" : "bi-shield-exclamation"} me-1`}
                                ></i>
                                {student.is_verified
                                  ? t("students_page.verified_yes")
                                  : t("students_page.verified_no")}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  className="btn btn-sm ac-btn-view border-0"
                                  title="View"
                                  onClick={() => handleView(student)}
                                >
                                  <i className="bi bi-eye fs-6"></i>
                                </button>
                                <button
                                  className="btn btn-sm ac-btn-deleteTable border-0"
                                  title="Delete"
                                  onClick={() => handleDelete(student.id)}
                                >
                                  <i className="bi bi-trash fs-6"></i>
                                </button>
                                <button
                                  className="btn btn-sm ac-btn-whatsapp border-0"
                                  title="WhatsApp"
                                  onClick={() => handleWhatsapp(student)}
                                >
                                  <i className="bi bi-whatsapp fs-6"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={10}
                            className="text-center py-4 text-muted"
                          >
                            {t("students_page.no_students")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* الترقيم السفلي */}
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
        /* واجهة الفورم للإضافة/التعديل/العرض */
        <div className="ac-form-container">
          <div className="ac-form-header d-flex justify-content-between align-items-center mb-4">
            <button className="ac-back-btn" onClick={handleBack}>
              <i
                className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
              ></i>
              <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                {viewingItem
                  ? t("students_page.view_student")
                  : t("students_page.add_student_title")}
              </span>
            </button>
            {!viewingItem && (
              <div className="ac-form-actions d-flex gap-2">
                <button
                  className="btn btn-danger px-4 ac-publish-btn"
                  onClick={handleSubmitWrapper}
                >
                  {t("students_page.create_student")}
                </button>
              </div>
            )}
          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            <div className="ac-tab-content basic-info">
              {/* صورة الطالب في وضع العرض */}
              {viewingItem && (
                <div className="mb-4 text-center">
                  <div
                    className="ac-thumbnail-view border rounded-4 overflow-hidden shadow-sm d-inline-block"
                    style={{ maxWidth: "100%", width: "600px" }}
                  >
                    <img
                      src={formData.avatar}
                      alt={formData.full_name}
                      className="img-fluid w-100"
                      style={{ height: "300px", objectFit: "cover" }}
                    />
                  </div>
                </div>
              )}
              {/* رقم القيد (يظهر فقط في العرض العام) */}
              {viewingItem && (
                <div className="row mb-4">
                  <div className="col-md-12 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "رقم القيد" : "Enrollment Number"}
                    </label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.enrollment_number}
                      disabled
                    />
                  </div>
                </div>
              )}

              {/* حقل الاسم */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {t("students_page.name")}
                </label>
                <input
                  type="text"
                  name="full_name"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={t("students_page.name_placeholder")}
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                />
              </div>

              {/* حقل الإيميل (مخفي في التعديل) */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {t("students_page.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={t("students_page.email_placeholder")}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                />
              </div>

              {/* حقل النوع (مخفي في التعديل) */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {isArabic ? "نوع الطالب" : "Gender"}
                </label>
                <select
                  name="gender"
                  className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                >
                  <option value="">
                    {isArabic ? "اختيار نوع الطالب" : "Gender"}
                  </option>
                  <option value="male">{isArabic ? "ذكر" : "Male"}</option>
                  <option value="female">{isArabic ? "انثي" : "Female"}</option>
                </select>
              </div>

              {/* حقل الهاتف (مخفي في التعديل) */}
              <div className="row mb-4">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark">
                    {t("students_page.phone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("students_page.phone_placeholder")}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>
              </div>

              {/* اختيار المجموعة */}
              {/* داخل فورم إضافة/تعديل طالب */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {isArabic ? "اسم المجموعه" : "Group Name"}
                </label>
                <select
                  name="group_id" // تأكد إن الاسم group_id عشان يتبعت للباك صح
                  className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                  value={formData.group_id}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                >
                  <option value="">{t("students_page.select_group")}</option>
                  {selectionGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* تفاصيل إضافية للعرض فقط */}
              {viewingItem && (
                <div className="row mb-4">
                  <div className="col-md-12">
                    <label className="form-label fw-bold text-dark">
                      {t("students_page.joined_at")}
                    </label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.created_at || ""}
                      disabled
                    />
                  </div>
                </div>
              )}

              {/* كلمة المرور (تظهر في الإضافة فقط) */}
              {!viewingItem && (
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("students_page.password")}
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("students_page.password_placeholder")}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* حالة الحساب */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">Status</label>
                <select
                  name="status"
                  className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                >
                  <option value="active">
                    {t("students_page.active_status")}
                  </option>
                  <option value="inactive">
                    {t("students_page.inactive_status")}
                  </option>
                </select>
              </div>
              {/* تفاصيل إضافية للعرض فقط */}
              {viewingItem && (
                <div className="ac-table-card mt-4">
                  <div className="ac-table-container">
                    <div className="d-flex align-items-center justify-content-between mb-3 mt-5">
                      <div className="d-flex align-items-center">
                        {/* أيقونة صغيرة تعطي شكل جمالي */}
                        <div
                          className="bg-danger rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <i className="bi bi-book-half text-white"></i>
                        </div>
                        <div>
                          <h5
                            className="fw-bold mb-0 text-dark"
                            style={{ letterSpacing: "-0.5px" }}
                          >
                            {isArabic
                              ? "الكورسات المشترك بها"
                              : "Enrolled Courses"}
                          </h5>
                          <p className="text-muted small mb-0">
                            {isArabic
                              ? "قائمة بجميع الدورات التدريبية المسجلة للطالب"
                              : "List of all courses registered to this student"}
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
                                {isArabic ? "الكورس" : "Course"}
                              </th>
                              <th className="py-3 border-0 text-secondary text-uppercase small fw-bold">
                                {isArabic ? "المحاضر" : "Instructor"}
                              </th>
                              <th
                                className="py-3 border-0 text-secondary text-uppercase small fw-bold text-center"
                                style={{ minWidth: "100px" }}
                              >
                                {isArabic ? "المجموعة" : "Group"}
                              </th>
                              <th className="py-3 border-0 text-secondary text-uppercase small fw-bold text-center">
                                {isArabic ? "التاريخ" : "Date"}
                              </th>
                              <th className="pe-4 py-3 border-0 text-secondary text-uppercase small fw-bold text-center">
                                {isArabic ? "الحالة" : "Status"}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="border-0">
                            {formData.enrolled_courses?.map((course, index) => (
                              <tr
                                key={index}
                                style={{
                                  borderBottom: "1px solid rgba(0,0,0,0.03)",
                                }}
                              >
                                <td className="ps-4 py-3 fw-bold text-dark">
                                  {course.title}
                                </td>
                                <td className="py-3 text-muted">
                                  {course.instructor_name}
                                </td>
                                <td
                                  className="py-3 text-center"
                                  style={{ minWidth: "150px" }}
                                >
                                  <div className="position-relative">
                                    <select
                                      // 1. تعطيل الـ select تماماً إذا كان الكورس مكتملاً
                                      disabled={course.is_completed}
                                      // 2. تلوين ديناميكي باستخدام كلاسات بوتستراب بناءً على حالة الكورس والجروب
                                      className={`form-control form-select-sm border-2 shadow-sm text-center rounded-3 py-2 px-3 ${
                                        course.is_completed
                                          ? "border-light-subtle bg-body-secondary text-muted opacity-75" // شكل مطفي للكورس المكتمل
                                          : !course.group_id
                                            ? "border-warning bg-warning-subtle text-dark"
                                            : "border-light-subtle bg-light text-secondary"
                                      }`}
                                      value={course.group_id || ""}
                                      // 3. تأكد من تمرير الدالة الصحيحة المتواجدة بالهوك لديك (يمكنك إضافة student.id إذا دعت الحاجة)
                                      onChange={(e) =>
                                        handleCourseGroupChange(
                                          course.id,
                                          e.target.value,
                                        )
                                      }
                                      // 4. تغيير مؤشر الماوس إلى ممنوع 🚫 عند الوقوف على كورس مكتمل
                                      style={{
                                        cursor: course.is_completed
                                          ? "not-allowed"
                                          : "pointer",
                                        transition: "all 0.3s",
                                      }}
                                    >
                                      <option
                                        value=""
                                        disabled={course.group_id}
                                      >
                                        {isArabic
                                          ? "⚠️ اختر مجموعة للطالب"
                                          : "⚠️ Select a Group"}
                                      </option>

                                      {course.available_groups?.map((group) => (
                                        <option
                                          key={group.id}
                                          value={group.id}
                                          className="bg-white text-dark"
                                        >
                                          {isArabic ? "👥  " : "👥  "}{" "}
                                          {group.name || group.group_name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </td>
                                <td className="py-3 text-center small text-secondary">
                                  {course.joined_at}
                                </td>
                                <td className="pe-4 py-3 text-center">
                                  <button
                                    type="button"
                                    // تحويل الـ Badge لـ Button باستخدام كلاسات بوتستراب لتغيير الخلفية والألوان بدون inline style
                                    className={`btn btn-sm rounded-pill fw-bold border-0 py-2 px-3 shadow-sm ${
                                      course.is_completed
                                        ? "bg-success-subtle text-success-emphasis"
                                        : "bg-primary-subtle text-primary-emphasis"
                                    }`}
                                    style={{
                                      fontSize: "0.75rem",
                                      transition: "all 0.2s",
                                      cursor: "pointer",
                                    }}
                                    // عند الضغط، نمرر المعرفات مع عكس الحالة الحالية للكورس لتحديث الباك والـ State
                                    onClick={() =>
                                      handleStatusToggle(
                                        viewingItem.id,
                                        course.id,
                                        course.is_completed,
                                      )
                                    }
                                  >
                                    {course.is_completed ? (
                                      <>
                                        <i className="bi bi-check-circle-fill me-1"></i>
                                        {isArabic ? "مكتمل" : "Completed"}
                                      </>
                                    ) : (
                                      <>
                                        <i className="bi bi-hourglass-split me-1"></i>
                                        {isArabic
                                          ? "قيد التنفيذ"
                                          : "In Progress"}
                                      </>
                                    )}
                                  </button>
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
              {/* أزرار التحكم */}
              {!viewingItem && (
                <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                  <button
                    className="btn btn-danger px-5 py-2 fw-medium rounded-3"
                    onClick={handleSubmitWrapper}
                  >
                    {t("students_page.create_student")}
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

export default AdminStudents;
