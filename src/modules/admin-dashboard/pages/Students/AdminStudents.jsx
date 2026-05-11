import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pagination, Spinner } from "react-bootstrap";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastSuccess, toastError } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { useStudents } from "../../hooks/useStudents";

/**
 * القيم الافتراضية للفورم عند إضافة طالب جديد
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
  const {
    students,
    pagination: apiPagination,
    loading,
    error,
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent
  } = useStudents();

  // حالات التحكم في عرض الواجهة (جدول، إضافة، تعديل، عرض)
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const isEdit = !!editingItem;
  const isCreate = !editingItem && !viewingItem;

  /**
   * فلترة الطلاب في الفرونت إند (لأن الـ API قد لا يدعم فلترة الجنس)
   */
  const filteredStudents = students.filter((student) => {
    if (selectedGender === "all") return true;
    return student.gender === selectedGender;
  });

  /**
   * ديبونس للبحث لتقليل عدد طلبات الـ API وتحسين الأداء
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * جلب البيانات من الـ API عند تغيير الصفحة أو البحث أو الفلترة
   * العملية تتم بالكامل من جهة السيرفر لضمان الكفاءة
   */
  useEffect(() => {
    getStudents({
      page: currentPage,
      search: debouncedSearchTerm,
      status: selectedStatus === "all" ? "" : selectedStatus,
    });
  }, [getStudents, currentPage, debouncedSearchTerm, selectedStatus]);

  /**
   * إعادة ضبط الصفحة للأولى عند تغيير الفلاتر لضمان ظهور النتائج بشكل سليم
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedStatus]);

  /**
   * التعامل مع زر الواتساب - تنسيق الرقم وإرسال بيانات الحساب للطالب
   */
  const handleWhatsapp = (student) => {
    if (!student) return;

    // تنظيف الرقم وإضافة كود الدولة (مصر +20)
    let phone = student.phone || "";
    phone = phone.replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "20" + phone.slice(1);
    }
    const message =
      `أهلاً بك في T-Square!\n` +
      `تم إنشاء حسابك بنجاح. إليك بيانات الدخول:\n` +
      `الاسم: ${student.full_name || "-"}\n` +
      `الإيميل: ${student.email || "-"}\n` +
      `رقم الهاتف: ${student.phone || "-"}\n` +
      `كلمة المرور: ${student.password || "كما سجلت"}\n\n` +
      `يُرجى تغيير كلمة المرور عند الدخول لأول مرة.\n` +
      `يمكن إعادة تعيينها عن طريق المنصة أو التواصل مع أحد المسؤولين`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  /**
   * التنقل بين صفحات الجدول
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /**
   * حساب نطاق الصفحات المعروضة لتجنب ازدحام أزرار الترقيم
   */
  const getPageRange = () => {
    if (!apiPagination) return [];
    const { current_page, last_page } = apiPagination;
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, current_page - delta); i <= Math.min(last_page - 1, current_page + delta); i++) {
      range.push(i);
    }
    if (current_page - delta > 2) range.unshift("...");
    if (current_page + delta < last_page - 1) range.push("...");
    range.unshift(1);
    if (last_page > 1) range.push(last_page);
    return range;
  };

  /**
   * تهيئة الفورم لإضافة طالب جديد
   */
  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  /**
   * ملء الفورم ببيانات الطالب للتعديل
   */
  const handleEdit = (student) => {
    setViewingItem(null);
    setEditingItem(student);
    setFormData({
      full_name: student.full_name || "",
      email: student.email || "",
      role: "student",
      password: "",
      phone: student.phone || "",
      enrollment_number: student.enrollment_number || "",
      group_id: student.group_id || "",
      gender: student.gender || "male",
      status: student.status || "active",
      avatar: student.avatar,
      created_at: student.created_at || "",
    });
    setShowForm(true);
  };

  /**
   * عرض بيانات الطالب في وضع القراءة فقط
   */
  const handleView = (student) => {
    setEditingItem(null);
    setViewingItem(student);
    setFormData({
      full_name: student.full_name || "",
      email: student.email || "",
      role: "student",
      phone: student.phone || "",
      enrollment_number: student.enrollment_number || "",
      group_id: student.group_id || "",
      gender: student.gender || "male",
      status: student.status || "active",
      avatar: student.avatar,
      created_at: student.created_at || "",
    });
    setShowForm(true);
  };

  /**
   * الرجوع للقائمة الرئيسية
   */
  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
  };

  /**
   * حذف طالب بعد تأكيد المسؤول
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
   * تحديث الحالة المحلية للفورم عند تغيير المدخلات
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * تجهيز البيانات للإرسال (تتعامل مع الصور والنصوص)
   */
  const preparePayload = (data) => {
    const isEditMode = !!editingItem;
    const formDataObj = new FormData();

    const fields = {
      full_name: data.full_name,
      name: data.full_name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: "student",
      status: data.status || "active",
      gender: data.gender || "",
      group_id: data.group_id || "",
    };

    if (isEditMode) {
      delete fields.phone;
      delete fields.email;
      delete fields.password;
    }

    Object.keys(fields).forEach((key) => {
      if (fields[key] !== undefined && fields[key] !== null) {
        formDataObj.append(key, fields[key]);
      }
    });

    if (data.avatar instanceof File) {
      formDataObj.append("avatar", data.avatar);
    }

    return formDataObj;
  };

  /**
   * معالجة إرسال الفورم (إضافة أو تحديث)
   */
  const handleSubmitWrapper = async (e) => {
    e.preventDefault();

    if (!formData.full_name || formData.full_name.length < 10) {
      toastError(isArabic ? "الاسم الكامل مطلوب (10 أحرف على الأقل)" : "Full name is required (min 10 chars)");
      return;
    }
    if (!editingItem && (!formData.password || formData.password.length < 8)) {
      toastError(isArabic ? "كلمة المرور مطلوبة (8 أحرف على الأقل)" : "Password is required (min 8 chars)");
      return;
    }

    try {
      const payload = preparePayload(formData);

      if (editingItem) {
        await updateStudent(editingItem.id, payload);
      } else {
        await createStudent(payload);
      }

      handleBack();
      getStudents({
        page: currentPage,
        search: debouncedSearchTerm,
        status: selectedStatus === "all" ? "" : selectedStatus,
        group_id: selectedGroup === "all" ? "" : selectedGroup,
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        Object.keys(errors).forEach((key) => {
          toastError(`${key}: ${errors[key][0]}`);
        });
      } else {
        console.error("Submission failed:", err);
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
            <button className="btn btn-danger ac-add-btn" onClick={handleAddNew}>
              + {t("students_page.add_student")}
            </button>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="table-responsive ac-rounded-table">
                {/* أدوات البحث والفلترة */}
                <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
                  <div className="ac-search-input-wrapper">
                    <i className="bi bi-search ac-search-icon"></i>
                    <input
                      type="text"
                      className="form-control ac-search-input"
                      placeholder={t("students_page.search_placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-2 gap-md-3 flex-wrap flex-md-nowrap mt-3 mt-md-0">
                    <select
                      className="form-select ac-form-select py-2 bg-light border-0 rounded-3 text-muted shadow-sm"
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                    >
                      <option value="all">{t("students_page.all_genders")}</option>
                      <option value="male">{t("students_page.male_option")}</option>
                      <option value="female">{t("students_page.female_option")}</option>
                    </select>
                    <select
                      className="form-select ac-form-select py-2 bg-light border-0 rounded-3 text-muted shadow-sm"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">{t("students_page.all_statuses")}</option>
                      <option value="active">{t("students_page.active_status")}</option>
                      <option value="pending">{t("students_page.pending_status")}</option>
                    </select>

                  </div>
                </div>

                {/* جدول عرض الطلاب */}
                <table className="table ac-table mb-0 align-middle" dir="ltr">
                  <thead>
                    <tr>
                      <th>{t("students_page.table_name")}</th>
                      <th className="text-center">{t("students_page.table_email")}</th>
                      <th className="text-center">{t("students_page.table_enrolled_courses")}</th>
                      <th className="text-center">{t("students_page.table_join_date")}</th>
                      <th className="text-center">{t("students_page.table_role")}</th>
                      <th className="text-center">{t("students_page.table_phone")}</th>
                      <th className="text-center">{t("students_page.table_gender")}</th>
                      <th className="text-center">{t("students_page.table_verified")}</th>
                      <th className="text-center">{t("students_page.table_actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <tr key={student.id}>

                          <td className="fw-medium text-dark">{student.full_name}</td>
                          <td className="text-center text-secondary">{student.email}</td>
                          <td className="text-center text-secondary">{student.enrolledCourses ?? 0}</td>
                          <td className="text-center text-secondary">
                            {student.created_at ? new Date(student.created_at).toLocaleDateString() : "-"}
                          </td>
                          <td className="text-center text-secondary text-capitalize">{student.role || "student"}</td>
                          <td className="text-center text-secondary">{student.phone || "-"}</td>
                          <td className="text-center text-secondary text-capitalize">{student.gender || "-"}</td>
                          <td className="text-center text-secondary">
                            {student.verified ? t("students_page.verified_yes") : t("students_page.verified_no")}
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button className="btn btn-sm ac-btn-view border-0" title="View" onClick={() => handleView(student)}>
                                <i className="bi bi-eye fs-6"></i>
                              </button>
                              <button className="btn btn-sm ac-btn-edit border-0" title="Edit" onClick={() => handleEdit(student)}>
                                <i className="bi bi-pencil-square fs-6"></i>
                              </button>
                              <button className="btn btn-sm ac-btn-deleteTable border-0" title="Delete" onClick={() => handleDelete(student.id)}>
                                <i className="bi bi-trash fs-6"></i>
                              </button>
                              <button className="btn btn-sm ac-btn-whatsapp border-0" title="WhatsApp" onClick={() => handleWhatsapp(student)}>
                                <i className="bi bi-whatsapp fs-6"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center py-4 text-muted">
                          {t("students_page.no_students")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
              <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}></i>
              <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                {viewingItem
                  ? t("students_page.view_student")
                  : editingItem
                    ? t("students_page.edit_student")
                    : t("students_page.add_student_title")}
              </span>
            </button>
            {!viewingItem && (
              <div className="ac-form-actions d-flex gap-2">
                <button className="btn btn-danger px-4 ac-publish-btn" onClick={handleSubmitWrapper}>
                  {editingItem ? t("students_page.update_student") : t("students_page.create_student")}
                </button>
              </div>
            )}
          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            <div className="ac-tab-content basic-info">
              {/* صورة الطالب في وضع العرض */}
              {viewingItem && (
                <div className="mb-4 text-center">
                  <div className="ac-thumbnail-view border rounded-4 overflow-hidden shadow-sm d-inline-block" style={{ maxWidth: "100%", width: "600px" }}>
                    <img src={formData.avatar} alt={formData.full_name} className="img-fluid w-100" style={{ height: "300px", objectFit: "cover" }} />
                  </div>
                </div>
              )}

              {/* حقل الاسم */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">{t("students_page.name")}</label>
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
              {!isEdit && (
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">{t("students_page.email")}</label>
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
              )}

              {/* حقل الهاتف (مخفي في التعديل) */}
              {!isEdit && (
                <div className="row mb-4">
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark">{t("students_page.phone")}</label>
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
              )}

              {/* رقم القيد (يظهر فقط في العرض العام) */}
              {!isCreate && !isEdit && (
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">رقم القيد (Enrollment Number)</label>
                    <input type="text" className="form-control ac-form-input p-3 bg-light border-0 rounded-3" value={formData.enrollment_number} disabled />
                  </div>
                </div>
              )}

              {/* اختيار المجموعة */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">{isArabic ? "رقم المجموعه" : "Group ID."}</label>
                <select
                  name="group_id"
                  className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                  value={formData.group_id}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                >
                  <option value="">{t("students_page.select_group")}</option>
                  <option value="1">Square Group 1</option>
                  <option value="2">Square Group 2</option>
                  <option value="3">Square Group 3</option>
                </select>
              </div>

              {/* النوع الاجتماعي (مخفي في التعديل) */}
              {!isEdit && !isCreate && (
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">{t("students_page.gender")}</label>
                  <select
                    name="gender"
                    className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  >
                    <option value="">{t("students_page.select_gender")}</option>
                    <option value="male">{t("students_page.male_option")}</option>
                    <option value="female">{t("students_page.female_option")}</option>
                  </select>
                </div>
              )}

              {/* تفاصيل إضافية للعرض فقط */}
              {viewingItem && (
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">{t("students_page.enrolled_courses")}</label>
                    <input type="number" className="form-control ac-form-input p-3 bg-light border-0 rounded-3" value={0} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">{t("students_page.joined_at")}</label>
                    <input type="text" className="form-control ac-form-input p-3 bg-light border-0 rounded-3" value={formData.created_at || ""} disabled />
                  </div>
                </div>
              )}

              {/* كلمة المرور (تظهر في الإضافة فقط) */}
              {!isEdit && !viewingItem && (
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">{t("students_page.password")}</label>
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
                  <option value="active">{t("students_page.active_status")}</option>
                  <option value="pending">{t("students_page.pending_status")}</option>
                  <option value="inactive">{t("students_page.inactive_status")}</option>
                </select>
              </div>

              {/* أزرار التحكم */}
              {!viewingItem && (
                <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                  <button className="btn btn-danger px-5 py-2 fw-medium rounded-3" onClick={handleSubmitWrapper}>
                    {editingItem ? t("students_page.update_student") : t("students_page.add_student")}
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
