import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import AdminPagination from "../../components/shared/AdminPagination";
import { useInstructors } from "../../hooks/useInstractor";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { openExternalUrl } from "../../../../utils/openExternalUrl";
// import { toastSuccess } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

const defaultFormData = {
  full_name: "",
  name: "",
  email: "",
  role: "instructor",
  password: "",
  password_confirmation: "",
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

const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

const getAvatarSrc = (path) => {
  if (!path) return defaultAvatar;

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  let apiURL = import.meta.env.VITE_API_URL || "";
  apiURL = apiURL.replace(/\/api\/?$/, "");
  const cleanBase = apiURL.endsWith("/") ? apiURL.slice(0, -1) : apiURL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (!cleanPath.startsWith("/storage") && !cleanPath.startsWith("/public")) {
    return `${cleanBase}/storage${cleanPath}`;
  }

  return `${cleanBase}${cleanPath}`;
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
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
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

    let avatarValue = insData.avatar || null;
    // إذا كان avatar كائن فاضي أو مش File و مش string، حوله لـ null
    if (
      avatarValue &&
      typeof avatarValue === "object" &&
      !(avatarValue instanceof File)
    ) {
      avatarValue = null;
    } 

    setFormData({
      full_name: insData.full_name || instructor.name || "",
      email: instructor.email || insData.email || "",
      phone: insData.phone || instructor.phone || "",
      field: insData.field || "",
      bio: insData.bio || "",
      gender: insData.gender || "male",
      insta_url: insData.insta_url || "",
      linkedin_url: insData.linkedin_url || "",
      facebook_url: insData.facebook_url || "",
      status: insData.status || "active",
      avatar: avatarValue,
      password: "",
      password_confirmation: "",
    });
    setShowForm(true);
  };

  const handleView = (instructor) => {
    setEditingItem(null);
    setViewingItem(instructor);
    const insData = instructor.instructor || instructor;

    // ✅ معالجة avatar بشكل صحيح
    let avatarValue = insData.avatar || null;
    if (
      avatarValue &&
      typeof avatarValue === "object" &&
      !(avatarValue instanceof File)
    ) {
      avatarValue = null;
    }

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
      created_at: instructor.created_at || insData.created_at || "",
      avatar: avatarValue,
    });
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
    // setActiveTab("view");
  };

  const handleDelete = async (insId) => {
    // نبحث عن العنصر للتأكيد باستخدام أي من المعرفين (ID المستخدم أو ID المحاضر)
    const instructor = instructors.find(
      (item) => item.instructor?.id === insId || item.id === insId,
    );
    const ok = await showDeleteConfirm(
      instructor?.instructor?.full_name || instructor?.name || "",
    );
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
        if (
          fields[key] !== undefined &&
          fields[key] !== null &&
          fields[key] !== ""
        ) {
          formDataObj.append(key, fields[key]);
        }
      });

      if (data.password) {
        formDataObj.append("password", data.password);
        formDataObj.append("password_confirmation", data.password_confirmation);
      }
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
        if (
          fields[key] !== undefined &&
          fields[key] !== null &&
          fields[key] !== ""
        ) {
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
      alert(
        isArabic
          ? "يجب أن يكون الاسم الكامل 10 أحرف على الأقل"
          : "Full name must be at least 10 characters",
      );
      return;
    }

    if (!editingItem && formData.password.length < 8) {
      alert(
        isArabic
          ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
          : "Password must be at least 8 characters",
      );
      return;
    }

    if (!editingItem && formData.password !== formData.password_confirmation) {
      alert(
        isArabic
          ? "تأكيد كلمة المرور غير متطابق"
          : "Password confirmation does not match",
      );
      return;
    }

    if (editingItem && formData.password) {
      if (formData.password.length < 8) {
        alert(
          isArabic
            ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
            : "Password must be at least 8 characters",
        );
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        alert(
          isArabic
            ? "تأكيد كلمة المرور غير متطابق"
            : "Password confirmation does not match",
        );
        return;
      }
    }

    if (formData.bio.length < 20) {
      alert(
        isArabic
          ? "يجب أن تكون النبذة التعريفية 20 حرفاً على الأقل"
          : "Biography must be at least 20 characters",
      );
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
  /**
   * التعامل مع زر الواتساب - تنسيق الرقم وإرسال بيانات الحساب للمحاضر
   */
  const handleWhatsapp = (instructor) => {
    if (!instructor) return;

    // تنظيف الرقم وإضافة كود الدولة (مصر +20)
    let phone = instructor.phone || "";
    phone = phone.replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "20" + phone.slice(1);
    } else if (!phone.startsWith("20")) {
      phone = "20" + phone;
    }
    const message =
      `مرحباً ${instructor.full_name || "Instructor"} \n\n` +
      `تم إنشاء حسابك كمحاضر على منصة T-Square بنجاح.\n\n` +
      ` بيانات الحساب:\n` +
      `• الاسم: ${instructor.full_name || "-"}\n` +
      `• المجال: ${instructor.field || "-"}\n` +
      `• البريد الإلكتروني: ${instructor.email || "-"}\n` +
      `• رقم الهاتف: ${instructor.phone || "-"}\n` +
      `• كلمة المرور: ${"كما تم إدخالها أثناء التسجيل"}\n\n` +
      ` يُرجى تغيير كلمة المرور بعد أول تسجيل دخول حفاظاً على أمان الحساب.\n\n` +
      `Platform link : https://tsquarecenter.com/\n\n` +
      `نتمنى لك تجربة موفقة معنا في T-Square `;
    const encodedMessage = encodeURIComponent(message);
    openExternalUrl(`https://wa.me/${phone}?text=${encodedMessage}`);
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
              <i className="bi bi-plus-lg me-0 me-md-1"></i>
              <span className="d-none d-md-inline">
                {t("instructors_page.add_instructor")}
              </span>
            </button>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="ac-rounded-table p-3 p-md-0">
                <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
                  <div className="ac-search-input-wrapper position-relative ">
                    <i
                      className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${
                        searchTerm ? "text-danger fw-bold" : "text-muted"
                      }`}
                      style={{ zIndex: 3 }}
                    ></i>
                    <input
                      type="text"
                      className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${
                        searchTerm
                          ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium"
                          : "border-light bg-light text-muted"
                      }`}
                      placeholder={t("instructors_page.search_placeholder")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-md-3">
                    <select
                      className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${
                        selectedStatus !== "all"
                          ? "border-danger bg-danger-subtle text-danger-emphasis"
                          : "border-light bg-light text-muted"
                      }`}
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
                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle" dir="ltr">
                    <thead>
                      <tr>
                        <th className="text-center">
                          {isArabic ? "الصورة" : "Image"}
                        </th>
                        <th>{t("instructors_page.table_name")}</th>
                        <th className="text-center">
                          {isArabic ? "التخصص" : "Field"}
                        </th>
                        <th className="text-center">
                          {t("instructors_page.table_email")}
                        </th>
                        <th className="text-center">
                          {t("instructors_page.table_actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-5">
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
                      ) : instructors.length > 0 ? (
                        instructors.map((instructor) => {
                          const insData = instructor.instructor || instructor;
                          const instructorName =
                            insData.full_name || instructor.name;
                          return (
                            <tr key={instructor.id}>
                              <td className="text-center">
                                <div
                                  className="position-relative d-inline-block rounded-circle shadow-sm mb-2"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #dc3545 0%, #f1a80a 100%)",
                                    padding: "2px",
                                  }}
                                >
                                  <div
                                    className="bg-white rounded-circle position-relative overflow-hidden"
                                    style={{ width: "55px", height: "55px" }}
                                  >
                                    <img
                                      src={getAvatarSrc(insData.avatar)}
                                      alt={instructorName}
                                      className="rounded-circle w-100 h-100"
                                      style={{ objectFit: "cover" }}
                                    />
                                    <div
                                      className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex align-items-center justify-content-center"
                                      style={{
                                        backgroundColor:
                                          "rgba(190, 21, 34, 0.85)",
                                        opacity: 0,
                                        transition: "opacity 0.3s ease",
                                        cursor: "pointer",
                                        zIndex: 3,
                                      }}
                                      onMouseEnter={(e) =>
                                        (e.currentTarget.style.opacity = 1)
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.opacity = 0)
                                      }
                                      onClick={() => {
                                        setLightboxSlides([
                                          {
                                            src: getAvatarSrc(insData.avatar),
                                          },
                                        ]);
                                        setLightboxIndex(0);
                                      }}
                                    >
                                      <button
                                        type="button"
                                        className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                                        style={{
                                          width: "38px",
                                          height: "38px",
                                          transition: "transform 0.2s ease",
                                          border: "none",
                                          backgroundColor: "#ffffff",
                                        }}
                                        onMouseEnter={(e) =>
                                          (e.currentTarget.style.transform =
                                            "scale(0.9)")
                                        }
                                        onMouseLeave={(e) =>
                                          (e.currentTarget.style.transform =
                                            "scale(0.8)")
                                        }
                                      >
                                        <i className="bi bi-eye-fill text-danger fs-4"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="fw-medium text-dark">
                                {instructorName}
                              </td>
                              <td className="text-center text-secondary">
                                {insData.field || "-"}
                              </td>

                              <td className="text-center text-secondary">
                                {instructor.email}
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
                                    onClick={() =>
                                      handleDelete(
                                        instructor.instructor?.id ||
                                          instructor.id,
                                      )
                                    }
                                  >
                                    <i className="bi bi-trash fs-6"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm ac-btn-whatsapp border-0"
                                    title="WhatsApp"
                                    onClick={() => handleWhatsapp(instructor)}
                                  >
                                    <i className="bi bi-whatsapp fs-6"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-4 text-muted"
                          >
                            {t("instructors_page.no_instructors")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination - Always visible if data exists */}
            {apiPagination && (
              <AdminPagination pagination={apiPagination} onPageChange={handlePageChange} />
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
          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            <div className="ac-tab-content basic-info">
              {/* صورة المحاضر في وضع العرض */}
              {viewingItem && (
                <div className="mb-4 text-center">
                  <div
                    className="position-relative d-inline-block rounded-circle p-1 shadow-sm mb-2"
                    style={{
                      background:
                        "linear-gradient(135deg, #dc3545 0%, #f1a80a 100%)",
                    }}
                  >
                    <div
                      className="bg-white rounded-circle p-1 position-relative overflow-hidden"
                      style={{ width: "200px", height: "200px" }}
                    >
                      <img
                        src={getAvatarSrc(formData.avatar)}
                        alt={formData.full_name}
                        className="rounded-circle w-100 h-100"
                        style={{
                          objectFit: "cover",
                          border: "3px solid #f8f9fa",
                        }}
                      />
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "rgba(190, 21, 34, 0.85)",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                          cursor: "pointer",
                          zIndex: 3,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = 1)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = 0)
                        }
                        onClick={() => {
                          setLightboxSlides([
                            { src: getAvatarSrc(formData.avatar) },
                          ]);
                          setLightboxIndex(0);
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                          style={{
                            width: "48px",
                            height: "48px",
                            transition: "transform 0.2s ease",
                            border: "none",
                            backgroundColor: "#ffffff",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.15)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        >
                          <i className="bi bi-eye-fill text-danger fs-4"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <h4 className="fw-bold mt-2 text-dark mb-1">
                    {formData.full_name}
                  </h4>
                  <p className="text-muted small mb-0">
                    {isArabic
                      ? `التخصص: ${formData.field || "-"}`
                      : `Field: ${formData.field || "-"}`}
                  </p>
                </div>
              )}

              {/* صورة المحاضر عند الإضافة أو التعديل */}
              {!viewingItem && (
                <div className="mb-4 text-center">
                  <div
                    className="position-relative d-inline-block rounded-circle p-1 shadow-sm mb-2"
                    style={{
                      background:
                        "linear-gradient(135deg, #dc3545 0%, #f1a80a 100%)",
                    }}
                  >
                    <div
                      className="bg-white rounded-circle p-1 position-relative overflow-hidden"
                      style={{ width: "200px", height: "200px" }}
                    >
                      <img
                        src={
                          formData.avatar
                            ? formData.avatar instanceof File
                              ? URL.createObjectURL(formData.avatar)
                              : getAvatarSrc(formData.avatar)
                            : defaultAvatar
                        }
                        alt={formData.full_name || "Instructor Avatar"}
                        className="rounded-circle w-100 h-100"
                        style={{
                          objectFit: "cover",
                          border: "3px solid #f8f9fa",
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="btn btn-sm btn-danger ac-add-btn border-0">
                      {isArabic
                        ? formData.avatar
                          ? "تغيير صورة"
                          : "إضافة صورة"
                        : formData.avatar
                          ? "Change Photo"
                          : "Add Photo"}
                      <input
                        type="file"
                        name="avatar"
                        className="d-none"
                        onChange={handleChange}
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* الاسم الكامل */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {t("instructors_page.name")}
                </label>
                <input
                  type="text"
                  name="full_name"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={t("instructors_page.name_placeholder")}
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                />
                {!viewingItem && (
                  <small className="text-muted">
                    {isArabic ? "الأدنى 10 أحرف" : "Min 10 characters"}
                  </small>
                )}
              </div>

              {/* الإيميل */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {t("instructors_page.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={t("instructors_page.email_placeholder")}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!!viewingItem || !!editingItem}
                />
              </div>

              {/* التخصص والجنس */}
              <div className="row mb-4 ">
                <div
                  className={`mb-3 mb-md-0 ${editingItem && !viewingItem ? "col-12" : "col-md-6"}`}
                >
                  <label className="form-label fw-bold text-dark">
                    {isArabic ? "التخصص" : "Field/Specialty"}
                  </label>
                  <input
                    type="text"
                    name="field"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={
                      isArabic ? "مثال: هندسة معمارية" : "e.g. Architecture"
                    }
                    value={formData.field}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>
                <div
                  className={`col-md-6 ${editingItem && !viewingItem ? "d-none" : ""}`}
                >
                  <label className="form-label fw-bold text-dark">
                    {isArabic ? "الجنس" : "Gender"}
                  </label>
                  <select
                    name="gender"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3 text-muted"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  >
                    <option value="male">{isArabic ? "ذكر" : "Male"}</option>
                    <option value="female">
                      {isArabic ? "أنثى" : "Female"}
                    </option>
                  </select>
                </div>
              </div>

              {/* الهاتف */}
              <div className="row mb-4">
                <div className="col-12">
                  <label className="form-label fw-bold text-dark">
                    {t("instructors_page.phone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("instructors_page.phone_placeholder")}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!!viewingItem || !!editingItem}
                  />
                </div>
              </div>

              {/* كلمة المرور */}
              {!viewingItem && (
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      {t("instructors_page.password")}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder={
                        editingItem
                          ? t("instructors_page.password_edit_placeholder")
                          : t("instructors_page.password_placeholder")
                      }
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <small className="text-muted">
                      {editingItem
                        ? t("instructors_page.password_optional_hint")
                        : isArabic
                          ? "الأدنى 8 أحرف"
                          : "Min 8 characters"}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      {t("instructors_page.confirm_password")}
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder={t(
                        "instructors_page.confirm_password_placeholder",
                      )}
                      value={formData.password_confirmation}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* تاريخ الانضمام (عرض فقط) */}
              {viewingItem && (
                <div className="row mb-4">
                  <div className="col-md-12">
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "تاريخ الانضمام" : "Joined At"}
                    </label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.created_at || formData.joinDate || ""}
                      disabled
                    />
                  </div>
                </div>
              )}

              {/* النبذة التعريفية */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {isArabic ? "النبذة التعريفية" : "Biography"}
                </label>
                <textarea
                  name="bio"
                  rows="4"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={
                    isArabic
                      ? "اكتب نبذة عن المحاضر..."
                      : "Tell us about the instructor..."
                  }
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                ></textarea>
                {!viewingItem && (
                  <small className="text-muted">
                    {isArabic ? "الأدنى 20 حرفاً" : "Min 20 characters"}
                  </small>
                )}
              </div>

              {/* روابط التواصل الاجتماعي */}
              <div className="row mb-4">
                <div className="col-md-4 mb-3 mb-md-0">
                  <label className="form-label fw-bold text-dark">
                    Instagram
                  </label>
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
                  <label className="form-label fw-bold text-dark">
                    LinkedIn
                  </label>
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
                  <label className="form-label fw-bold text-dark">
                    Facebook
                  </label>
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
                <label className="form-label fw-bold text-dark">
                  {isArabic ? "الحالة" : "Status"}
                </label>
                <select
                  name="status"
                  className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                >
                  <option value="active">
                    {t("instructors_page.active_status")}
                  </option>
                  <option value="inactive">
                    {t("instructors_page.inactive_status")}
                  </option>
                </select>
              </div>

              {/* أزرار التحكم */}
              {!viewingItem && (
                <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                  <button
                    className="btn btn-danger px-5 py-2 fw-medium rounded-3"
                    onClick={handleSubmitWrapper}
                    disabled={loading}
                  >
                    {editingItem
                      ? t("instructors_page.update_instructor")
                      : t("instructors_page.create_instructor")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={lightboxSlides}
        carousel={{ finite: true }}
      />
    </div>
  );
}

export default AdminInstructors;
