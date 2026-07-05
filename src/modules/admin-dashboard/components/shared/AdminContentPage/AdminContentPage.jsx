import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminContentTable from "./AdminContentTable";
import AdminPagination from "../AdminPagination";

import AdminContentForm from "./AdminContentForm";
import { showDeleteConfirm } from "../../../../../components/shared/ConfirmDialog/confirmDialog";
import "./AdminContentPage.css";

// تعليق: هذا المكون هو الحاوية الأساسية للصفحات المشتركة (مثال: كورسات، حلول).
// يعتمد السلوك على نوع الصفحة ممرر عبر الـ (type) ليغير الحالة والنصوص الديناميكية.
function AdminContentPage({ type, useDataHook }) {
  const { t } = useTranslation("adminDashboard");

  // تحديد النصوص والتسميات بناءً على النوع
  const title = t("content.solution_title");
  const subtitle = t("content.solution_subtitle");
  const addBtnText = t("content.add_solution");

  // Hook البيانات (يتم استدعاء الدالة الممررة)
  const hookData = useDataHook();

  const data = hookData.solutions || [];
  const getData = hookData.getSolutions;
  const createData = hookData.createSolution;
  const updateData = hookData.updateSolution;
  const deleteData = hookData.deleteSolution;
  const apiPagination = hookData.pagination; // { current_page, last_page, total }

  const { loading } = hookData;

  const [currentPage, setCurrentPage] = useState(1);

  // Use API pagination when available, fall back to client-side
  const totalPages = apiPagination?.last_page || Math.max(1, Math.ceil(data.length / 10));
  const displayData = data; // API already returns paginated slice

  const pagination = {
    currentPage: apiPagination?.current_page || currentPage,
    lastPage: totalPages,
  };

  // تحديث البيانات عند تحميل المكون أو تغيير الصفحة
  useEffect(() => {
    if (getData) {
      getData({ page: currentPage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [type]);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setViewingItem(null);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleView = (item) => {
    setEditingItem(null);
    setViewingItem(item);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
  };

  const handleDelete = async (id) => {
    // Find the item name for the confirm dialog
    const item = displayData?.find((i) => i.id === id);
    const itemName = item?.name || item?.title || "";

    const ok = await showDeleteConfirm(itemName);
    if (ok) {
      const success = await deleteData(id);
      if (success) getData();
    }
  };

  const handleSubmit = async (idOrPayload, payload) => {
    try {
      if (editingItem) {
        await updateData(idOrPayload, payload);
      } else {
        await createData(idOrPayload);
      }
      getData(); handleBack();
    } catch (err) {
      // error handled in hook
    }
  };

  return (
    <div className="admin-content-page">
      {!showForm ? (
        <>
          {/* Header */}
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">{title}</h2>
              <p className="ac-subtitle text-muted mb-0">{subtitle}</p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus-lg me-0 me-md-1"></i>
              <span className="d-none d-md-inline">{addBtnText}</span>
            </button>
          </div>

          <div className="ac-table-card">
            {/* Table Component */}
            <AdminContentTable
              type={type}
              data={displayData}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            <AdminPagination
              pagination={{
                current_page: pagination.currentPage,
                last_page: pagination.lastPage,
              }}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <AdminContentForm
          type={type}
          item={editingItem || viewingItem}
          isReadOnly={!!viewingItem}
          onBack={handleBack}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default AdminContentPage;
