import { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAdminTags } from "../../hooks/useAdminTags";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

const defaultForm = { name: "" };

function AdminTags() {
  const { tags, loading, submitting, fetchTags, addTag, editTag, removeTag } =
    useAdminTags();
  const { i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const nameInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchTags({ search: debouncedSearch });
  }, [fetchTags, debouncedSearch]);

  const openAddModal = () => {
    setEditingTag(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTag(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const success = editingTag
      ? await editTag(editingTag.id, formData)
      : await addTag(formData);

    if (success) {
      closeModal();
      fetchTags({ search: debouncedSearch });
    }
  };

  const handleDelete = async (tag) => {
    const confirmed = await showDeleteConfirm(tag.name);
    if (confirmed) {
      const success = await removeTag(tag.id);
      if (success) fetchTags({ search: debouncedSearch });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-content-page">
      {/* ── Header ── */}
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{isArabic ? "التاجات" : "Site Tags"}</h2>
          <p className="ac-subtitle text-muted mb-0">
            {isArabic
              ? "إدارة جميع التاجات المستخدمة في الموقع"
              : "Manage all tags used across the platform"}
          </p>
        </div>
        <button className="btn btn-danger ac-add-btn" onClick={openAddModal}>
          <i className="bi bi-plus-lg me-0 me-md-1"></i>
          <span className="d-none d-md-inline">
            {isArabic ? "إضافة تاج" : "Add Tag"}
          </span>
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="ac-table-card">
        <div className="ac-table-container">
          <div className="ac-rounded-table p-3 p-md-0">
            {/* Search */}
            <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-4">
              <div className="ac-search-input-wrapper position-relative">
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
                  placeholder={isArabic ? "بحث عن تاج..." : "Search tags..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ zIndex: 1, position: "relative" }}
                />
              </div>
              <span className="badge bg-danger-subtle text-danger fs-6 px-3 py-2 rounded-pill">
                {isArabic ? `${tags.length} تاج` : `${tags.length} tag${tags.length !== 1 ? "s" : ""}`}
              </span>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table ac-table mb-0 align-middle" dir="ltr">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>#</th>
                    <th>{isArabic ? "اسم التاج" : "Tag Name"}</th>
                    <th className="text-center">{isArabic ? "الـ Slug" : "Slug"}</th>
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
                      <td colSpan={5} className="text-center py-5">
                        <div
                          className="spinner-border text-danger"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : tags.length > 0 ? (
                    tags.map((tag, index) => (
                      <tr key={tag.id}>
                        <td className="text-muted">{index + 1}</td>
                        <td className="fw-semibold text-dark">
                          <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fs-6">
                            <i className="bi bi-tag-fill me-1"></i>
                            {tag.name}
                          </span>
                        </td>
                        <td className="text-center">
                          <code className="text-secondary">{tag.slug}</code>
                        </td>
                        <td className="text-center text-secondary">
                          {formatDate(tag.created_at)}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm ac-btn-edit border-0"
                              title={isArabic ? "تعديل" : "Edit"}
                              onClick={() => openEditModal(tag)}
                            >
                              <i className="bi bi-pencil-square fs-6"></i>
                            </button>
                            <button
                              className="btn btn-sm ac-btn-deleteTable border-0"
                              title={isArabic ? "حذف" : "Delete"}
                              onClick={() => handleDelete(tag)}
                            >
                              <i className="bi bi-trash3 fs-6"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        <i className="bi bi-tags fs-1 d-block mb-2 opacity-25"></i>
                        {isArabic ? "لا توجد تاجات" : "No tags found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        onEntered={() => nameInputRef.current?.focus()}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <i className="bi bi-tags me-2 text-danger"></i>
            {editingTag
              ? isArabic
                ? "تعديل التاج"
                : "Edit Tag"
              : isArabic
              ? "إضافة تاج جديد"
              : "Add New Tag"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-3">
          <form id="tag-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">
                {isArabic ? "اسم التاج" : "Tag Name"}
                <span className="text-danger ms-1">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                placeholder={
                  isArabic ? "مثال: JavaScript" : "e.g. JavaScript"
                }
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                maxLength={100}
              />
              <div className="form-text text-muted">
                {isArabic
                  ? "سيتم توليد الـ slug تلقائياً"
                  : "The slug will be generated automatically"}
              </div>
            </div>
          </form>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <button
            type="button"
            className="btn btn-light px-4"
            onClick={closeModal}
            disabled={submitting}
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="submit"
            form="tag-form"
            className="btn btn-danger px-4 fw-bold"
            disabled={submitting || !formData.name.trim()}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                {isArabic ? "جارٍ الحفظ..." : "Saving..."}
              </>
            ) : editingTag ? (
              isArabic ? "حفظ التغييرات" : "Save Changes"
            ) : (
              isArabic ? "إضافة" : "Add Tag"
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminTags;
