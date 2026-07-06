import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminPagination from "../../components/shared/AdminPagination";
import { useCategories } from "../../hooks/useCategories";
import { showConfirmCustom } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

const defaultFormData = {
  name: "",
  description: "",
  parent_id: "",
  status: "active",
};

function StatusBadge({ status, onClick, isArabic }) {
  return (
    <span
      className={`badge rounded-pill ${status === "active" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
      style={{ cursor: "pointer", padding: "8px 16px" }}
      onClick={onClick}
    >
      <i
        className={`bi ${status === "hidden" ? "bi-shield-exclamation" : "bi-patch-check-fill"} me-1`}
      ></i>
      {status === "hidden"
        ? isArabic ? "غير نشط" : "Hidden"
        : isArabic ? "نشط" : "Active"}
    </span>
  );
}

function AdminCategories() {
  const {
    categories,
    treeCategories,
    pagination: apiPagination,
    loading,
    treeLoading,
    getCategories,
    getCategoriesTree,
    getCategoryById,
    createCategory,
    updateCategory,
  } = useCategories();

  const { i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMainCategory, setIsMainCategory] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    getCategories({
      page: currentPage,
      search: debouncedSearch,
      parent_id: selectedParent ?? "",
    });
  }, [getCategories, currentPage, debouncedSearch, selectedParent]);

  useEffect(() => {
    getCategoriesTree();
  }, [getCategoriesTree]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedParent]);

  const refreshChildren = () => {
    getCategories({
      page: currentPage,
      search: debouncedSearch,
      parent_id: selectedParent ?? "",
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleParentSelect = (parentId) => {
    setSelectedParent((prev) => (prev === parentId ? null : parentId));
  };

  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setFormData(defaultFormData);
    setIsMainCategory(true);
    setShowForm(true);
  };

  const handleEdit = async (id) => {
    setViewingItem(null);
    setEditingItem(id);
    const data = await getCategoryById(id);
    setFormData({
      name: data.name || "",
      description: data.description || "",
      parent_id: data.parent?.id || "",
      status: data.status || "active",
    });
    setIsMainCategory(!data.parent?.id);
    setShowForm(true);
  };

  const handleView = async (id) => {
    setEditingItem(null);
    setViewingItem(id);
    const data = await getCategoryById(id);
    setFormData({
      name: data.name || "",
      description: data.description || "",
      parent_id: data.parent?.id || "",
      status: data.status || "active",
    });
    setIsMainCategory(!data.parent?.id);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "parent_id" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmitWrapper = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toastError(isArabic ? "يجب إدخال اسم التصنيف" : "Category name is required");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
      };
      if (!isMainCategory && formData.parent_id) {
        payload.parent_id = formData.parent_id;
      } else {
        payload.parent_id = null;
      }
      if (editingItem) {
        payload.status = formData.status;
      }

      if (editingItem) {
        await updateCategory(editingItem, payload);
      } else {
        await createCategory(payload);
      }

      refreshChildren();
      getCategoriesTree();
      handleBack();
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleStatusChange = async (id, currentStatus, isParent = false) => {
    const updatedStatus = currentStatus === "active" ? "hidden" : "active";

    const confirmed = await showConfirmCustom({
      title: isArabic ? "تغيير الحالة" : "Change Category Status",
      message: isArabic
        ? isParent
          ? `هل أنت متأكد من تغيير حالة القسم الرئيسي إلى "${updatedStatus}"؟ سيتم تطبيق نفس الحالة على جميع الأقسام الفرعية.`
          : `هل أنت متأكد من تغيير حالة التصنيف إلى "${updatedStatus}"`
        : isParent
          ? `Are you sure you want to change the parent category status to "${updatedStatus}"? All sub-categories will be updated too.`
          : `Are you sure you want to change status to "${updatedStatus}"`,
      confirmText: isArabic ? "نعم" : "Yes",
      cancelText: isArabic ? "لا" : "No",
    });

    if (confirmed) {
      try {
        await updateCategory(id, { status: updatedStatus });
        refreshChildren();
        if (isParent) {
          getCategoriesTree();
        }
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const selectedParentName = selectedParent
    ? treeCategories.find((cat) => cat.id === selectedParent)?.name
    : null;

  const renderActions = (id) => (
    <div className="d-flex justify-content-center gap-2">
      <button
        className="btn btn-sm ac-btn-view border-0"
        title="View"
        onClick={(e) => {
          e.stopPropagation();
          handleView(id);
        }}
      >
        <i className="bi bi-eye fs-6"></i>
      </button>
      <button
        className="btn btn-sm ac-btn-edit border-0"
        title="Edit"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(id);
        }}
      >
        <i className="bi bi-pencil-square fs-6"></i>
      </button>
    </div>
  );

  return (
    <div className="admin-content-page">
      {!showForm ? (
        <>
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">
                {isArabic ? "التصنيفات" : "Categories"}
              </h2>
              <p className="ac-subtitle text-muted mb-0">
                {isArabic
                  ? "إدارة جميع التصنيفات"
                  : "Manage all categories"}
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus-lg me-0 me-md-1"></i>
              <span className="d-none d-md-inline">
                {isArabic ? "إضافة تصنيف" : "Add Category"}
              </span>
            </button>
          </div>

          {/* Parent Categories Table */}
          <div className="ac-table-card mb-4">
            <div className="ac-table-container">
              <div className="ac-rounded-table p-3 p-md-0">
                <h6 className="ac-subtitle fw-semibold mb-3 px-3 pt-3">
                  {isArabic ? "الأقسام الرئيسية" : "Parent Categories"}
                </h6>
                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle" dir="ltr">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>#</th>
                        <th>{isArabic ? "اسم التصنيف" : "Category Name"}</th>
                        <th className="text-center">
                          {isArabic ? "عدد الأبناء" : "Children"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "الحالة" : "Status"}
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
                      {treeLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-5">
                            <div className="spinner-border text-danger" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : treeCategories && treeCategories.length > 0 ? (
                        treeCategories.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`ac-parent-row ${selectedParent === item.id ? "table-danger" : ""}`}
                            style={{
                              cursor: "pointer",
                              borderLeft: selectedParent === item.id ? "3px solid #d32f2f" : "3px solid transparent",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => handleParentSelect(item.id)}
                          >
                            <td className="text-secondary">{index + 1}</td>
                            <td className="fw-medium text-dark">{item.name}</td>
                            <td className="text-center">
                              <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                {item.children_count ?? 0}
                              </span>
                            </td>
                            <td className="text-center">
                              <StatusBadge
                                status={item.status || "active"}
                                isArabic={isArabic}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(item.id, item.status || "active", true);
                                }}
                              />
                            </td>
                            <td className="text-center text-secondary">
                              {item.created_at || "-"}
                            </td>
                            <td className="text-center">
                              {renderActions(item.id)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-muted">
                            {isArabic ? "لا يوجد أقسام رئيسية" : "No parent categories found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Children Categories Table */}
          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="ac-rounded-table p-3 p-md-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 px-3 pt-3">
                  <h6 className="ac-subtitle fw-semibold mb-0">
                    {selectedParentName
                      ? isArabic
                        ? `الأقسام الفرعية: ${selectedParentName}`
                        : `Sub-Categories: ${selectedParentName}`
                      : isArabic
                        ? "كل الأقسام الفرعية"
                        : "All Sub-Categories"}
                  </h6>
                  <div className="ac-search-input-wrapper position-relative" style={{ width: "100%", maxWidth: "320px" }}>
                    <i
                      className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${searchTerm ? "text-danger fw-bold" : "text-muted"}`}
                      style={{ zIndex: 3 }}
                    ></i>
                    <input
                      type="text"
                      className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${searchTerm ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium" : "border-light bg-light text-muted"}`}
                      placeholder={
                        isArabic
                          ? "بحث عن تصنيف..."
                          : "Search for category..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ zIndex: 1, position: "relative" }}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle" dir="ltr">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>#</th>
                        <th>{isArabic ? "اسم التصنيف" : "Category Name"}</th>
                        <th className="text-center">
                          {isArabic ? "التصنيف الأب" : "Parent"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "الحالة" : "Status"}
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
                            <div className="spinner-border text-danger" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : categories && categories.length > 0 ? (
                        categories.map((item, index) => (
                          <tr key={item.id}>
                            <td className="text-secondary">{index + 1}</td>
                            <td className="fw-medium text-dark">{item.name}</td>
                            <td className="text-center text-secondary">
                              {item.parent?.name || "-"}
                            </td>
                            <td className="text-center">
                              <StatusBadge
                                status={item.status || "active"}
                                isArabic={isArabic}
                                onClick={() => handleStatusChange(item.id, item.status || "hidden")}
                              />
                            </td>
                            <td className="text-center text-secondary">
                              {item.created_at}
                            </td>
                            <td className="text-center">
                              {renderActions(item.id)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-muted">
                            {isArabic ? "لا يوجد تصنيفات" : "No categories found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

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
                  ? isArabic
                    ? "عرض بيانات التصنيف"
                    : "View Category"
                  : editingItem
                    ? isArabic
                      ? "تعديل بيانات التصنيف"
                      : "Edit Category"
                    : isArabic
                      ? "إضافة تصنيف جديد"
                      : "Add New Category"}
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmitWrapper} className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            <div className="ac-tab-content basic-info">
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {isArabic ? "اسم التصنيف" : "Category Name"}
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={
                    isArabic ? "أدخل اسم التصنيف" : "Enter category name"
                  }
                  value={formData.name || ""}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                  required
                />
              </div>

              <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <label
                    htmlFor="isMainCategorySwitch"
                    className="d-block mb-0 cp"
                    style={{ cursor: viewingItem ? "default" : "pointer" }}
                  >
                    <strong className="d-block mb-1">
                      {isArabic ? "تصنيف رئيسي" : "Main Category"}
                    </strong>
                    <small className="text-muted">
                      {isArabic
                        ? "اجعل هذا تصنيفاً رئيسياً (لا يتبع أي تصنيف آخر)"
                        : "Make this a main category (does not belong to any other category)"}
                    </small>
                  </label>
                </div>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input form-check-inputS"
                    type="checkbox"
                    role="switch"
                    id="isMainCategorySwitch"
                    checked={isMainCategory}
                    onChange={(e) => {
                      setIsMainCategory(e.target.checked);
                      if (e.target.checked) {
                        setFormData((prev) => ({ ...prev, parent_id: "" }));
                      }
                    }}
                    disabled={!!viewingItem}
                    style={{ cursor: viewingItem ? "default" : "pointer" }}
                  />
                </div>
              </div>

              <div className="row mb-4">
                {!isMainCategory && (
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "التصنيف الأب" : "Parent Category"}
                    </label>
                    <select
                      name="parent_id"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.parent_id || ""}
                      onChange={handleChange}
                      disabled={!!viewingItem}
                      required
                    >
                      <option value="">
                        {isArabic ? "اختر التصنيف الأب" : "Select parent category"}
                      </option>
                      {treeCategories.map((cat) => (
                        <option key={cat.id} value={cat.id} disabled={editingItem === cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editingItem && (
                  <div className={isMainCategory ? "col-md-12" : "col-md-6"}>
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "الحالة" : "Status"}
                    </label>
                    <select
                      name="status"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.status || "active"}
                      onChange={handleChange}
                      disabled={!!viewingItem}
                    >
                      <option value="active">{isArabic ? "نشط" : "Active"}</option>
                      <option value="hidden">{isArabic ? "مخفي" : "Hidden"}</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {isArabic ? "الوصف" : "Description"}
                </label>
                <textarea
                  name="description"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={
                    isArabic ? "أدخل وصف التصنيف..." : "Enter category description..."
                  }
                  value={formData.description || ""}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                  rows="4"
                  style={{ resize: "vertical" }}
                ></textarea>
              </div>

              {!viewingItem && (
                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-danger px-4 py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="spinner-border spinner-border-sm text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : isArabic ? (
                      "حفظ التغييرات"
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
