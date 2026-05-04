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
  email: "",
  role: "instructor",
  password: "",
  phone: "",
  gender: "male",
  field: "",
  insta_url: "",
  linkedin_url: "",
  facebook_url: "",
  verified: null,
  status: "active",
  joinDate: "",
  image: instructorImg,
  avg_rating: "0.00",
  reviews_count: 0,
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
  const [activeTab, setActiveTab] = useState("view");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    getInstructors({
      page: currentPage,
      search: searchTerm,
      status: selectedStatus === "all" ? "" : selectedStatus,
    });
  }, [getInstructors, currentPage, searchTerm, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const handleEdit = (instructor) => {
    setViewingItem(null);
    setEditingItem(instructor);
    setFormData({
      full_name: instructor.full_name || instructor.name || "",
      password: "",
      verified: instructor.email_verified_at || instructor.verified || null,
      field: instructor.field || "",
      insta_url: instructor.insta_url || "",
      linkedin_url: instructor.linkedin_url || "",
      facebook_url: instructor.facebook_url || "",
      status: instructor.status || "active",
      image: instructor.image || instructorImg,
    });
    setShowForm(true);
  };

  const handleView = (instructor) => {
    setEditingItem(null);
    setViewingItem(instructor);
    setFormData({
      full_name: instructor.full_name || instructor.name || "",
      email: instructor.email || "",
      role: "instructor",
      password: "",
      phone: instructor.phone || "",
      verified: instructor.email_verified_at || instructor.verified || null,
      gender: instructor.gender || "male",
      field: instructor.field || "",
      insta_url: instructor.insta_url || "",
      linkedin_url: instructor.linkedin_url || "",
      facebook_url: instructor.facebook_url || "",
      avg_rating: instructor.avg_rating || "0.00",
      reviews_count: instructor.reviews_count || 0,
      status: instructor.status || "active",
      joinDate: instructor.created_at || instructor.joinDate || "",
      image: instructor.image || instructorImg,
    });
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
    setActiveTab("view");
  };

  const handleDelete = async (id) => {
    const instructor = instructors.find((item) => item.id === id);
    const ok = await showDeleteConfirm(instructor?.full_name || instructor?.name || "");
    if (ok) {
      const success = await deleteInstructor(id);
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitWrapper = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateInstructor(editingItem.id, formData);
      } else {
        await createInstructor(formData);
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
                      <option value="pending">
                        {t("instructors_page.pending_status")}
                      </option>
                    </select>
                  </div>
                </div>
                <table className="table ac-table mb-0 align-middle" dir="ltr">
                  <thead>
                    <tr>
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
                        {t("instructors_page.table_verified")}
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
                      instructors.map((instructor) => (
                        <tr key={instructor.id}>
                          <td className="fw-medium text-dark">
                            {instructor.full_name || instructor.name}
                          </td>
                          <td className="text-center text-secondary">{instructor.field || "-"}</td>
                          <td className="text-center text-secondary">
                            {instructor.gender === "female" ? (isArabic ? "أنثى" : "Female") : (isArabic ? "ذكر" : "Male")}
                          </td>
                          <td className="text-center text-secondary">
                            {instructor.email}
                          </td>
                          <td className="text-center text-secondary">
                            <span className="text-warning me-1">★</span>
                            {instructor.avg_rating || "0.00"}
                          </td>
                          <td className="text-center text-secondary">
                            {instructor.reviews_count || 0}
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              {instructor.insta_url && (
                                <a href={instructor.insta_url} target="_blank" rel="noreferrer" className="text-danger">
                                  <i className="bi bi-instagram"></i>
                                </a>
                              )}
                              {instructor.linkedin_url && (
                                <a href={instructor.linkedin_url} target="_blank" rel="noreferrer" className="text-primary">
                                  <i className="bi bi-linkedin"></i>
                                </a>
                              )}
                              {instructor.facebook_url && (
                                <a href={instructor.facebook_url} target="_blank" rel="noreferrer" className="text-primary">
                                  <i className="bi bi-facebook"></i>
                                </a>
                              )}
                              {instructor.phone && (
                                <a href={`tel:${instructor.phone}`} target="_blank" rel="noreferrer" className="text-primary">
                                  <i className="bi bi-phone"></i>
                                </a>
                              )}
                              {!instructor.insta_url && !instructor.linkedin_url && !instructor.facebook_url && "-"}
                            </div>
                          </td>
                          <td className="text-center text-secondary">
                            {instructor.created_at || instructor.joinDate
                              ? new Date(instructor.created_at || instructor.joinDate).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="text-center text-secondary">
                            {instructor.email_verified_at || instructor.verified
                              ? t("instructors_page.verified_yes")
                              : t("instructors_page.verified_no")}
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
                                onClick={() => handleDelete(instructor.id)}
                              >
                                <i className="bi bi-trash fs-6"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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

            {/* Pagination */}
            {apiPagination && apiPagination.lastPage > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="custom-pagination">
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                  {[...Array(apiPagination.lastPage)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={currentPage === apiPagination.lastPage}
                    onClick={() => handlePageChange(currentPage + 1)}
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
            {activeTab === "view" && (
              <div className="ac-tab-content basic-info">
                {viewingItem && (
                  <div className="mb-4 text-center">
                    <div
                      className="ac-thumbnail-view border rounded-4 overflow-hidden shadow-sm d-inline-block"
                      style={{ maxWidth: "100%", width: "600px" }}
                    >
                      <img
                        src={formData.image}
                        alt={formData.full_name}
                        className="img-fluid w-100"
                        style={{ height: "300px", objectFit: "cover" }}
                      />
                    </div>
                  </div>
                )}

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
                </div>


                <div className="row mb-4">

                  <div className={`${!viewingItem ? "col-md-12" : "d-none"}`}>
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "التخصص" : "Field"}
                    </label>
                    <input
                      type="text"
                      name="field"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder={isArabic ? "التخصص" : "Field"}
                      value={formData.field}
                      onChange={handleChange}
                      disabled={!!viewingItem}
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className={`${!viewingItem ? "d-none" : "col-md-6"}`}>
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "التخصص" : "Field"}
                    </label>
                    <input
                      type="text"
                      name="field"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder={isArabic ? "التخصص" : "Field"}
                      value={formData.field}
                      onChange={handleChange}
                      disabled={!!viewingItem}
                    />
                  </div>
                  <div className={`col-md-${!viewingItem ? "12" : "6"}`}>
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "روابط التواصل" : "Social Links"}
                    </label>
                    {viewingItem ? (
                      <div className="d-flex gap-4  p-3 bg-light rounded-3 fs-4">
                        {formData.insta_url && (
                          <a href={formData.insta_url} target="_blank" rel="noreferrer" className="text-danger">
                            <i className="bi bi-instagram"></i>
                          </a>
                        )}
                        {formData.linkedin_url && (
                          <a href={formData.linkedin_url} target="_blank" rel="noreferrer" className="text-primary">
                            <i className="bi bi-linkedin"></i>
                          </a>
                        )}
                        {formData.facebook_url && (
                          <a href={formData.facebook_url} target="_blank" rel="noreferrer" className="text-primary">
                            <i className="bi bi-facebook"></i>
                          </a>
                        )}
                        {!formData.insta_url && !formData.linkedin_url && !formData.facebook_url && "-"}
                      </div>
                    ) : (
                      <div className="row">
                        <div className="col-md-4 mb-3 mb-md-0">
                          <input
                            type="text"
                            name="insta_url"
                            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                            placeholder="Instagram URL"
                            value={formData.insta_url}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4 mb-3 mb-md-0">
                          <input
                            type="text"
                            name="linkedin_url"
                            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                            placeholder="LinkedIn URL"
                            value={formData.linkedin_url}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            type="text"
                            name="facebook_url"
                            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                            placeholder="Facebook URL"
                            value={formData.facebook_url}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="row mb-4">
                  <div className={`col-md-6 mb-3 mb-md-0 ${!viewingItem ? "d-none" : ""} `}>
                    <label className="form-label fw-bold text-dark">
                      {t("instructors_page.role")}
                    </label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={t("instructors_page.role_value")}
                      disabled
                    />
                  </div>
                  <div className={`col-md-6 ${!viewingItem ? "d-none" : ""}`}>
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
                      disabled={!!viewingItem}
                    />
                  </div>
                </div>

                <div className={`row mb-4 ${!viewingItem ? "d-none" : ""}`}>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "التقييم" : "Rating"}
                    </label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.avg_rating}
                      disabled
                    />
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "المراجعات" : "Reviews"}
                    </label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.reviews_count}
                      disabled
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold text-dark">
                      {t("instructors_page.joined_at")}
                    </label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.joinDate}
                      disabled
                    />
                  </div>
                </div>

                {!viewingItem && (
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark">
                      {t("instructors_page.password")}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder={t("instructors_page.password_placeholder")}
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                )}

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
                      {t("instructors_page.active_status")}
                    </option>
                    <option value="pending">
                      {t("instructors_page.pending_status")}
                    </option>
                    <option value="inactive">
                      {t("instructors_page.inactive_status")}
                    </option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("instructors_page.verified")}
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      type="button"
                      className={`btn ${formData.verified ? "btn-success" : "btn-outline-secondary"}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          verified: prev.verified
                            ? null
                            : new Date().toISOString(),
                        }))
                      }
                      disabled={!!viewingItem}
                    >
                      {formData.verified
                        ? t("instructors_page.verified_yes")
                        : t("instructors_page.verified_no")}
                    </button>
                    {formData.verified && (
                      <small className="text-muted">
                        Verified at{" "}
                        {new Date(formData.verified).toLocaleString()}
                      </small>
                    )}
                  </div>
                </div>

                {!viewingItem && (
                  <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                    <button
                      className="btn btn-danger px-5 py-2 fw-medium rounded-3"
                      onClick={handleSubmitWrapper}
                    >
                      {editingItem
                        ? t("instructors_page.update_instructor")
                        : t("instructors_page.create_instructor")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInstructors;
