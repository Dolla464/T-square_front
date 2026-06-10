import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "react-bootstrap";
import { useCategories } from "../../hooks/useCategories";
import { showConfirmCustom, showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

const defaultFormData = {
  name: "",
  description: "",
  parent_id: "",
  status: "active",
};

// Simple dialog confirm fallback if showPaymentStatusConfirm isn't perfectly worded for categories, 
// but user instructed to use it as reference. We'll use window.confirm if needed, or import standard.
// Actually, I'll write a custom confirm handler inline or use the existing one if it fits.
import Swal from "sweetalert2";




function AdminCategories() {
  const {
    categories,
    treeCategories,
    pagination: apiPagination,
    loading,
    getCategories,
    getCategoriesTree,
    getCategoryById,
    createCategory,
    updateCategory,
  } = useCategories();

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  // --- States ---
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [parentFilter, setParentFilter] = useState("all");
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
      parent_id: parentFilter === "all" ? "" : parentFilter,
    });
  }, [getCategories, currentPage, debouncedSearch, parentFilter]);

  useEffect(() => {
    getCategoriesTree();
  }, [getCategoriesTree]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, parentFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
        payload.parent_id = null; // explicit null for parent categories
      }
      // Status is handled independently or with edit, but backend accepts status.
      // We will include status in edit.
      if (editingItem) {
        payload.status = formData.status;
      }

      if (editingItem) {
        await updateCategory(editingItem, payload);
      } else {
        await createCategory(payload);
      }

      getCategories({
        page: currentPage,
        search: debouncedSearch,
        parent_id: parentFilter === "all" ? "" : parentFilter,
      });
      handleBack();
    } catch (err) { }
  };







  const handleStatusChange = async (id, currentStatus) => {
    const updatedStatus = currentStatus === "active" ? "hidden" : "active";

    const newStatus = await showConfirmCustom({
      title: isArabic ? "تغيير الحالة" : "Change Category Status",
      message: isArabic
        ? `هل أنت متأكد من تغيير حالة التصنيف إلى "${updatedStatus}"`
        : `Are you sure you want to change status to "${updatedStatus}"`,
      confirmText: isArabic ? "نعم" : "Yes",
      cancelText: isArabic ? "لا" : "No",
    });
    if (newStatus) {
      try {
        await updateCategory(id, { status: updatedStatus });
        getCategories({
          page: currentPage,
          search: debouncedSearch,
          parent_id: parentFilter === "all" ? "" : parentFilter,
        });
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  // Flatten the tree for the dropdown
  const flattenTree = (nodes, prefix = "") => {
    let result = [];
    if (!nodes) return result;
    for (const node of nodes) {
      result.push({ id: node.id, name: prefix + node.name });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children, prefix + "-- "));
      }
    }
    return result;
  };

  const flatTreeCategories = flattenTree(treeCategories);

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
                          ? "بحث عن تصنيف..."
                          : "Search for category..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ zIndex: 1, position: "relative" }}
                    />
                  </div>

                  <div className="d-flex gap-2 gap-md-3 flex-wrap flex-md-nowrap">
                    <select
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium  transition-all ${parentFilter !== "all" ? "border-danger bg-danger-subtle text-danger-emphasis" : "border-light bg-light  text-muted"}`}
                      value={parentFilter}
                      onChange={(e) => setParentFilter(e.target.value)}

                    >
                      <option value="all">
                        {isArabic ? "كل التصنيفات (الآباء)" : "All Categories (Parents)"}
                      </option>
                      {treeCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle" dir="ltr">
                    <thead>
                      <tr>
                        <th>{isArabic ? "اسم التصنيف" : "Category Name"}</th>
                        <th className="text-center">
                          {isArabic ? "التصنيف الأب" : "Parent"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "الوصف" : "Description"}
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
                      ) : categories && categories.length > 0 ? (
                        categories.map((item) => (
                          <tr key={item.id}>
                            <td className="fw-medium text-dark">
                              {item.name}
                            </td>
                            <td className="text-center text-secondary">
                              {item.parent?.name || "-"}
                            </td>
                            <td className="text-center text-secondary">
                              <span className="d-inline-block text-truncate" style={{ maxWidth: '150px' }}>
                                {item.description || "-"}
                              </span>
                            </td>


                            <td className="text-center">


                              <span
                                className={`badge rounded-pill cp ${item.status === "active" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                                style={{
                                  cursor: "pointer",
                                  padding: "8px 16px",
                                }}
                                onClick={() => handleStatusChange(item.id, item.status || "hidden")}
                              >
                                <i
                                  className={`bi ${item.status === "hidden" ? "bi-shield-exclamation" : "bi-patch-check-fill"} me-1`}
                                ></i>
                                {item.status === "hidden"
                                  ? isArabic ? "غير نشط" : "Hidden"
                                  : isArabic ? "نشط" : "Active"}
                              </span>

                            </td>


                            <td className="text-center text-secondary">
                              {item.created_at}
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  className="btn btn-sm ac-btn-view border-0"
                                  title="View"
                                  onClick={() => handleView(item.id)}
                                >
                                  <i className="bi bi-eye fs-6"></i>
                                </button>
                                <button
                                  className="btn btn-sm ac-btn-edit border-0"
                                  title="Edit"
                                  onClick={() => handleEdit(item.id)}
                                >
                                  <i className="bi bi-pencil-square fs-6"></i>
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
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="custom-pagination">
                  <Pagination.Prev
                    disabled={apiPagination.current_page === 1}
                    onClick={() =>
                      handlePageChange(apiPagination.current_page - 1)
                    }
                  />
                  {(() => {
                    const currentPage = apiPagination.current_page;
                    const totalPages = apiPagination.total_pages;
                    const startPage = Math.floor((currentPage - 1) / 3) * 3 + 1;
                    const endPage = Math.min(startPage + 2, totalPages);
                    const items = [];

                    if (startPage > 1) {
                      items.push(
                        <Pagination.Ellipsis
                          key="prev-ellipsis"
                          onClick={() => handlePageChange(startPage - 1)}
                        />
                      );
                    }

                    for (let p = startPage; p <= endPage; p++) {
                      items.push(
                        <Pagination.Item
                          style={{ margin: "0 3px" }}
                          key={p}
                          active={currentPage === p}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </Pagination.Item>
                      );
                    }

                    if (endPage < totalPages) {
                      items.push(
                        <Pagination.Ellipsis
                          key="next-ellipsis"
                          onClick={() => handlePageChange(endPage + 1)}
                        />
                      );
                    }

                    return items;
                  })()}
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

              <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center" >
                <div >
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
