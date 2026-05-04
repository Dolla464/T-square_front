import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "react-bootstrap";
import AdminContentTable from "./AdminContentTable";

import AdminContentForm from "./AdminContentForm";
import { showDeleteConfirm } from "../../../../../components/shared/ConfirmDialog/confirmDialog";
import "./AdminContentPage.css";

// تعليق: هذا المكون هو الحاوية الأساسية للصفحات المشتركة (مثال: كورسات، حلول).
// يعتمد السلوك على نوع الصفحة ممرر عبر الـ (type) ليغير الحالة والنصوص الديناميكية.
function AdminContentPage({ type, useDataHook }) {
  const { t } = useTranslation("adminDashboard");

  // تحديد النصوص والتسميات بناءً على النوع
  const title =
    type === "course" ? t("content.course_title") : t("content.solution_title");
  const subtitle =
    type === "course"
      ? t("content.course_subtitle")
      : t("content.solution_subtitle");
  const addBtnText =
    type === "course" ? t("content.add_course") : t("content.add_solution");

  // Hook البيانات (يتم استدعاء الدالة الممررة)
  const {
    solutions, // يمكن أن تكون courses أيضاً
    loading,
    getSolutions,
    createSolution,
    updateSolution,
    deleteSolution,
  } = useDataHook();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // تحديث البيانات عند تحميل المكون
  useEffect(() => {
    // تعليق: استدعاء الـ API لجلب البيانات.
    if (getSolutions) {
      getSolutions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  // Dummy data for courses until API is ready
  const dummyCourse = {
    id: "dummy-1",
    title: "Full Stack React Laravel",
    instructor: { name: "Ahmed Hatem", id: "1" },
    instructor_id: "1",
    revenue: "450.00 EGY",
    students_count: 120,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    description:
      "Learn React from scratch to pro with hooks, context, and performance optimization secrets. This course covers everything you need to build production-ready apps.",
    tags: [
      { id: 1, name: "React" },
      { id: 2, name: "Frontend" },
      { id: 3, name: "Laravel" },
    ],
    price: "450",
    discount: "399",
    category: "1",
    difficulty: "beginner",
    is_free: false,
  };

  const displayData = type === "course" ? [dummyCourse] : solutions || [];

  const totalPages = Math.max(1, Math.ceil(displayData.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayData.slice(indexOfFirstItem, indexOfLastItem);

  const pagination = {
    currentPage,
    lastPage: totalPages,
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [type, solutions]);

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
      const success = await deleteSolution(id);
      if (success) getSolutions();
    }
  };

  const handleSubmit = async (idOrPayload, payload) => {
    try {
      if (editingItem) {
        await updateSolution(idOrPayload, payload);
      } else {
        await createSolution(idOrPayload);
      }
      getSolutions();
      handleBack();
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
              +{addBtnText}
            </button>
          </div>

          <div className="ac-table-card">
            {/* Table Component */}
            <AdminContentTable
              type={type}
              data={currentItems}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {pagination && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="custom-pagination">
                  <Pagination.Prev
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  />
                  {[...Array(pagination.lastPage)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === pagination.currentPage}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={pagination.currentPage === pagination.lastPage}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  />
                </Pagination>
              </div>
            )}
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
