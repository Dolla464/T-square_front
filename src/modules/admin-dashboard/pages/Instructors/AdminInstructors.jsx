import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "react-bootstrap";
import { useInstructors } from "../../hooks/useInstractor";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
// import { toastSuccess } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import instructorImg from "../../../../assets/student-avatar.jpg";

const defaultFormData = {
  full_name: "",
  name: "",
  email: "",
  role: "instructor",
  password: "",
  phone: "",
  gender: "male",
  field: "",
  bio: "",
  insta_url: "",
  linkedin_url: "",
  facebook_url: "",
  status: "active",
  avatar: null,
};

function AdminInstructors() {
  const {
    instructors,
    pagination: apiPagination,
    loading,
    getInstructors,
    createInstructor,
    updateInstructor,
    deleteInstructor,
  } = useInstructors();

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // استخدام debounced search لتقليل طلبات الـ API
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    getInstructors({
      page: currentPage,
      search: debouncedSearch,
      status: selectedStatus === "all" ? "" : selectedStatus,
    });
  }, [getInstructors, currentPage, debouncedSearch, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const handleEdit = (instructor) => {
    setViewingItem(null);
    setEditingItem(instructor);
    // نستخدم بيانات المحاضر من الكائن المتداخل إذا وجد، وإلا نستخدم الكائن الأساسي
    const insData = instructor.instructor || instructor;
    setFormData({
      full_name: insData.full_name || instructor.name || "",
      field: insData.field || "",
      bio: insData.bio || "",
      gender: insData.gender || "male",
      insta_url: insData.insta_url || "",
      linkedin_url: insData.linkedin_url || "",
      facebook_url: insData.facebook_url || "",
      status: insData.status || "active",
      avatar: insData.avatar || null,
    });
    setShowForm(true);
  };

  const handleView = (instructor) => {
    setEditingItem(null);
    setViewingItem(instructor);
    const insData = instructor.instructor || instructor;
    setFormData({
      full_name: insData.full_name || instructor.name || "",
      email: instructor.email || "",
      role: "instructor",
      phone: insData.phone || instructor.phone || "",
      gender: insData.gender || "male",
      field: insData.field || "",
      bio: insData.bio || "",
      insta_url: insData.insta_url || "",
      linkedin_url: insData.linkedin_url || "",
      facebook_url: insData.facebook_url || "",
      avg_rating: insData.avg_rating || "0.00",
      reviews_count: insData.reviews_count || 0,
      status: insData.status || "active",
      joinDate: instructor.created_at || insData.created_at || "",
      avatar: insData.avatar || null,
    });
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
    setActiveTab("view");
  };

  const handleDelete = async (insId) => {
    // نبحث عن العنصر للتأكيد باستخدام أي من المعرفين (ID المستخدم أو ID المحاضر)
    const instructor = instructors.find((item) => (item.instructor?.id === insId || item.id === insId));
    const ok = await showDeleteConfirm(instructor?.instructor?.full_name || instructor?.name || "");
    if (ok) {
      const success = await deleteInstructor(insId);
      if (success) {
        getInstructors({
          page: currentPage,
          search: searchTerm,
          status: selectedStatus === "all" ? "" : selectedStatus,
        });
      }
    }
  };

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
    const isEditMode = !!editingItem;
    const formDataObj = new FormData();

    if (isEditMode) {
      // تعديل محاضر (POST /admin/instructors/{id})
      // الحقول المسموح بها حسب UpdateAdminInstructorRequest
      const fields = {
        full_name: data.full_name,
        field: data.field,
        bio: data.bio,
        gender: data.gender,
        insta_url: data.insta_url,
        linkedin_url: data.linkedin_url,
        facebook_url: data.facebook_url,
        status: data.status,
      };
      Object.keys(fields).forEach((key) => {
        if (fields[key] !== undefined && fields[key] !== null && fields[key] !== "") {
          formDataObj.append(key, fields[key]);
        }
      });
    } else {
      // إنشاء مستخدم جديد بصفة محاضر (POST /admin/users)
      // الحقول المطلوبة حسب StoreUserRequest
      const fields = {
        full_name: data.full_name, // Backend will extract 'name' from this
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: "instructor",
        gender: data.gender,
        field: data.field,
        bio: data.bio,
        status: data.status,
        insta_url: data.insta_url,
        linkedin_url: data.linkedin_url,
        facebook_url: data.facebook_url,
      };
      Object.keys(fields).forEach((key) => {
        if (fields[key] !== undefined && fields[key] !== null && fields[key] !== "") {
          formDataObj.append(key, fields[key]);
        }
      });
    }

    if (data.avatar instanceof File) {
      formDataObj.append("avatar", data.avatar);
    }

    return formDataObj;
  };

  const handleSubmitWrapper = async (e) => {
    e.preventDefault();

    // التحقق الأساسي من صحة البيانات قبل الإرسال (Frontend Validation)
    if (formData.full_name.length < 10) {
      alert(isArabic ? "يجب أن يكون الاسم الكامل 10 أحرف على الأقل" : "Full name must be at least 10 characters");
      return;
    }

    if (!editingItem && formData.password.length < 8) {
      alert(isArabic ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }

    if (formData.bio.length < 20) {
      alert(isArabic ? "يجب أن تكون النبذة التعريفية 20 حرفاً على الأقل" : "Biography must be at least 20 characters");
      return;
    }

    try {
      const payload = preparePayload(formData);
      if (editingItem) {
        // نستخدم ID المحاضر المتداخل للتعديل
        const insId = editingItem.instructor?.id || editingItem.id;
        await updateInstructor(insId, payload);
      } else {
        await createInstructor(payload);
      }
      getInstructors({
        page: currentPage,
        search: searchTerm,
        status: selectedStatus === "all" ? "" : selectedStatus,
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
              <h2 className="ac-title">{t("instructors_page.title")}</h2>
              <p className="ac-subtitle text-muted mb-0">
                {t("instructors_page.subtitle")}
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              + {t("instructors_page.add_instructor")}
            </button>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="table-responsive ac-rounded-table">
                <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
                  <div className="ac-search-input-wrapper">
                    <i className="bi bi-search ac-search-icon"></i>
                    <input
                      type="text"
                      className="form-control ac-search-input"
                      placeholder={t("instructors_page.search_placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-md-3">
                    <select
                      className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">
                        {t("instructors_page.all_statuses")}
                      </option>
                      <option value="active">
                        {t("instructors_page.active_status")}
                      </option>
                      <option value="inactive">
                        {t("instructors_page.inactive_status")}
                      </option>
                    </select>


                  </div>
                </div>
                <table className="table ac-table mb-0 align-middle" dir="ltr">
                  <thead>
                    <tr>
                      <th className="text-center">#</th>
                      <th>{t("instructors_page.table_name")}</th>
                      <th className="text-center">{isArabic ? "التخصص" : "Field"}</th>
                      <th className="text-center">{isArabic ? "الجنس" : "Gender"}</th>
                      <th className="text-center">
                        {t("instructors_page.table_email")}
                      </th>
                      <th className="text-center">{isArabic ? "التقييم" : "Rating"}</th>
                      <th className="text-center">{isArabic ? "المراجعات" : "Reviews"}</th>
                      <th className="text-center">{isArabic ? "التواصل" : "Social"}</th>
                      <th className="text-center">
                        {t("instructors_page.table_join_date")}
                      </th>

                      <th className="text-center">
                        {t("instructors_page.table_actions")}
                      </th>
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
                    ) : instructors.length > 0 ? (
                      instructors.map((instructor, index) => {
                        const insData = instructor.instructor || instructor;
                        return (
                          <tr key={instructor.id}>
                            <td className="text-center text-secondary fw-bold">
                              {apiPagination ? (apiPagination.current_page - 1) * (apiPagination.per_page || 10) + index + 1 : index + 1}
                            </td>
                            <td className="fw-medium text-dark">
                              {insData.full_name || instructor.name}
                            </td>
                            <td className="text-center text-secondary">{insData.field || "-"}</td>
                            <td className="text-center text-secondary">
                              {insData.gender === "female" ? (isArabic ? "أنثى" : "Female") : (isArabic ? "ذكر" : "Male")}
                            </td>
                            <td className="text-center text-secondary">
                              {instructor.email}
                            </td>
                            <td className="text-center text-secondary">
                              <span className="text-warning me-1">★</span>
                              {insData.avg_rating || "0.00"}
                            </td>
                            <td className="text-center text-secondary">
                              {insData.reviews_count || 0}
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                {insData.insta_url && (
                                  <a href={insData.insta_url} target="_blank" rel="noreferrer" className="text-danger">
                                    <i className="bi bi-instagram"></i>
                                  </a>
                                )}
                                {insData.linkedin_url && (
                                  <a href={insData.linkedin_url} target="_blank" rel="noreferrer" className="text-primary">
                                    <i className="bi bi-linkedin"></i>
                                  </a>
                                )}
                                {insData.facebook_url && (
                                  <a href={insData.facebook_url} target="_blank" rel="noreferrer" className="text-primary">
                                    <i className="bi bi-facebook"></i>
                                  </a>
                                )}
                                {insData.phone && (
                                  <a href={`tel:${insData.phone}`} target="_blank" rel="noreferrer" className="text-primary">
                                    <i className="bi bi-phone"></i>
                                  </a>
                                )}
                                {!insData.insta_url && !insData.linkedin_url && !insData.facebook_url && "-"}
                              </div>
                            </td>
                            <td className="text-center text-secondary">
                              {instructor.created_at || insData.created_at
                                ? new Date(instructor.created_at || insData.created_at).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  className="btn btn-sm ac-btn-view border-0"
                                  title="View"
                                  onClick={() => handleView(instructor)}
                                >
                                  <i className="bi bi-eye fs-6"></i>
                                </button>
                                <button
                                  className="btn btn-sm ac-btn-edit border-0"
                                  title="Edit"
                                  onClick={() => handleEdit(instructor)}
                                >
                                  <i className="bi bi-pencil-square fs-6"></i>
                                </button>
                                <button
                                  className="btn btn-sm ac-btn-deleteTable border-0"
                                  title="Delete"
                                  onClick={() => handleDelete(instructor.instructor?.id || instructor.id)}
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
                          {t("instructors_page.no_instructors")}
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
                  ? t("instructors_page.view_instructor")
                  : editingItem
                    ? t("instructors_page.edit_instructor")
                    : t("instructors_page.add_instructor_title")}
              </span>
            </button>
            {!viewingItem && (
              <div className="ac-form-actions d-flex gap-2">
                <button
                  className="btn btn-danger px-4 ac-publish-btn"
                  onClick={handleSubmitWrapper}
                >
                  {editingItem
                    ? t("instructors_page.update_instructor")
                    : t("instructors_page.create_instructor")}
                </button>
              </div>
            )}
          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            <div className="ac-tab-content basic-info">
              {/* صورة المحاضر */}
              <div className="mb-4 text-center">
                <div className="ac-thumbnail-view border rounded-4 overflow-hidden shadow-sm d-inline-block" style={{ maxWidth: "100%", width: "600px" }}>
                  <img
                    src={formData.avatar instanceof File ? URL.createObjectURL(formData.avatar) : (formData.avatar || instructorImg)}
                    alt={formData.full_name}
                    className="img-fluid w-100"
                    style={{ height: "300px", objectFit: "cover" }}
                  />
                </div>
                {!viewingItem && (
                  <div className="mt-2">
                    <label className="btn btn-outline-danger btn-sm">
                      {isArabic ? "تغيير الصورة" : "Change Photo"}
                      <input type="file" name="avatar" className="d-none" onChange={handleChange} accept="image/*" />
                    </label>
                  </div>
                )}
              </div>

              {/* الاسم الكامل */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">{t("instructors_page.name")}</label>
                <input
                  type="text"
                  name="full_name"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={t("instructors_page.name_placeholder")}
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                />
                {!viewingItem && <small className="text-muted">{isArabic ? "الأدنى 10 أحرف" : "Min 10 characters"}</small>}
              </div>

              {/* الإيميل (فقط عند الإضافة) */}
              {!editingItem && !viewingItem && (
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">{t("instructors_page.email")}</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("instructors_page.email_placeholder")}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* التخصص والجنس */}
              <div className="row mb-4 ">
                <div className={`mb-3 mb-md-0 ${editingItem ? 'col-12' : 'col-md-6'}`}>
                  <label className="form-label fw-bold text-dark">{isArabic ? "التخصص" : "Field/Specialty"}</label>
                  <input
                    type="text"
                    name="field"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={isArabic ? "مثال: هندسة معمارية" : "e.g. Architecture"}
                    value={formData.field}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>
                <div className={`col-md-6 ${editingItem && 'd-none'}`}>
                  <label className="form-label fw-bold text-dark">{isArabic ? "الجنس" : "Gender"}</label>
                  <select
                    name="gender"
                    className={`form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted `}
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  >
                    <option value="male">{isArabic ? "ذكر" : "Male"}</option>
                    <option value="female">{isArabic ? "أنثى" : "Female"}</option>
                  </select>
                </div>
              </div>

              {/* الهاتف وكلمة المرور (فقط عند الإضافة) */}
              {!editingItem && !viewingItem && (
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">{t("instructors_page.phone")}</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder={t("instructors_page.phone_placeholder")}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">{t("instructors_page.password")}</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder={t("instructors_page.password_placeholder")}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <small className="text-muted">{isArabic ? "الأدنى 8 أحرف" : "Min 8 characters"}</small>
                  </div>
                </div>
              )}

              {/* النبذة التعريفية */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">{isArabic ? "النبذة التعريفية" : "Biography"}</label>
                <textarea
                  name="bio"
                  rows="4"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={isArabic ? "اكتب نبذة عن المحاضر..." : "Tell us about the instructor..."}
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                ></textarea>
                {!viewingItem && <small className="text-muted">{isArabic ? "الأدنى 20 حرفاً" : "Min 20 characters"}</small>}
              </div>

              {/* روابط التواصل الاجتماعي */}
              <div className="row mb-4">
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label fw-bold text-dark">Instagram</label>
                  <input
                    type="url"
                    name="insta_url"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder="https://..."
                    value={formData.insta_url}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label fw-bold text-dark">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin_url"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder="https://..."
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold text-dark">Facebook</label>
                  <input
                    type="url"
                    name="facebook_url"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder="https://..."
                    value={formData.facebook_url}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>
              </div>

              {/* الحالة */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">{isArabic ? "الحالة" : "Status"}</label>
                <select
                  name="status"
                  className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                >
                  <option value="active">{t("instructors_page.active_status")}</option>
                  <option value="inactive">{t("instructors_page.inactive_status")}</option>
                </select>
              </div>

              {/* أزرار التحكم */}
              {!viewingItem && (
                <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                  <button className="btn btn-danger px-5 py-2 fw-medium rounded-3" onClick={handleSubmitWrapper}>
                    {editingItem ? t("instructors_page.update_instructor") : t("instructors_page.create_instructor")}
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

export default AdminInstructors;
