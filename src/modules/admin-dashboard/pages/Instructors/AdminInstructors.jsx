import { useState } from "react";
import { useTranslation } from "react-i18next";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastSuccess } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import instructorImg from "../../../../assets/student-avatar.jpg";

const initialInstructors = [
  {
    id: "ins-1",
    name: "Ahmed Ali",
    email: "ahmed@site.com",
    coursesCount: 3,
    phone: "+20 100 123 4567",
    status: "active",
    joinDate: "2026-05-04T07:18:25Z",
    verified: "2026-02-19T08:30:00Z",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ins-2",
    name: "Mohamed Hassan",
    email: "hassan@site.com",
    coursesCount: 5,
    phone: "+20 101 234 5678",
    status: "active",
    joinDate: "2025-10-10T10:00:00Z",
    verified: "2025-11-01T12:00:00Z",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ins-3",
    name: "Sara Ahmed",
    email: "sara@site.com",
    coursesCount: 2,
    phone: "+20 102 345 6789",
    status: "pending",
    joinDate: "2026-04-15T09:00:00Z",
    verified: null,
    image: instructorImg,
  }
];

const defaultFormData = {
  name: "",
  email: "",
  role: "instructor",
  password: "",
  phone: "",
  verified: null,
  status: "active",
  coursesCount: 0,
  joinDate: "",
  image: instructorImg,
};

function AdminInstructors() {
  const [instructors, setInstructors] = useState(initialInstructors);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("view");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const filteredInstructors = instructors.filter((instructor) => {
    const matchesSearch = [instructor.name, instructor.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" || instructor.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

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
      name: instructor.name,
      email: instructor.email,
      role: "instructor",
      password: "",
      phone: instructor.phone || "",
      verified: instructor.verified || null,
      status: instructor.status,
      coursesCount: instructor.coursesCount ?? 0,
      joinDate: instructor.joinDate || "",
      image: instructor.image,
    });
    setShowForm(true);
  };

  const handleView = (instructor) => {
    setEditingItem(null);
    setViewingItem(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      role: "instructor",
      password: "",
      phone: instructor.phone || "",
      verified: instructor.verified || null,
      status: instructor.status,
      coursesCount: instructor.coursesCount ?? 0,
      joinDate: instructor.joinDate || "",
      image: instructor.image,
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
    const ok = await showDeleteConfirm(instructor?.name || "");
    if (ok) {
      setInstructors((prev) => prev.filter((item) => item.id !== id));
      toastSuccess(t("instructors_page.deleted_success"));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitWrapper = (e) => {
    e.preventDefault();
    if (editingItem) {
      setInstructors((prev) =>
        prev.map((instructor) =>
          instructor.id === editingItem.id
            ? {
              ...instructor,
              ...formData,
              role: "instructor",
            }
            : instructor,
        ),
      );
      toastSuccess(t("instructors_page.updated_success"));
    } else {
      setInstructors((prev) => [
        {
          id: `ins-${Date.now()}`,
          ...formData,
          role: "instructor",
          coursesCount: 0,
          joinDate: new Date().toISOString(),
        },
        ...prev,
      ]);
      toastSuccess(t("instructors_page.created_success"));
    }
    handleBack();
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
                      <th className="text-center">
                        {t("instructors_page.table_email")}
                      </th>
                      <th className="text-center">
                        {t("instructors_page.table_courses_count")}
                      </th>
                      <th className="text-center">
                        {t("instructors_page.table_join_date")}
                      </th>
                      <th className="text-center">
                        {t("instructors_page.table_role")}
                      </th>
                      <th className="text-center">
                        {t("instructors_page.table_phone")}
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
                    {filteredInstructors.length > 0 ? (
                      filteredInstructors.map((instructor) => (
                        <tr key={instructor.id}>
                          <td className="fw-medium text-dark">
                            {instructor.name}
                          </td>
                          <td className="text-center text-secondary">
                            {instructor.email}
                          </td>
                          <td className="text-center text-secondary">
                            {instructor.coursesCount ?? 0}
                          </td>
                          <td className="text-center text-secondary">
                            {instructor.joinDate
                              ? new Date(instructor.joinDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="text-center text-secondary text-capitalize">
                            {t("instructors_page.role_value")}
                          </td>
                          <td className="text-center text-secondary">
                            {instructor.phone || "-"}
                          </td>
                          <td className="text-center text-secondary">
                            {instructor.verified
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
                        <td colSpan={8} className="text-center py-4 text-muted">
                          {t("instructors_page.no_instructors")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
                        alt={formData.name}
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
                    name="name"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("instructors_page.name_placeholder")}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>

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
                    disabled={!!viewingItem}
                  />
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
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
                  <div className="col-md-6">
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

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      {t("instructors_page.courses_count")}
                    </label>
                    <input
                      type="number"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.coursesCount}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
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
