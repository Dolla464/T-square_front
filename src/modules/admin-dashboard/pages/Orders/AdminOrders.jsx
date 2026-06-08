import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { Pagination, Modal, Button } from "react-bootstrap";
import { showDeleteConfirm, showPaymentStatusConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { useOrders } from "../../hooks/useOrders";

import "../Reviews/review.css";

function AdminOrders() {
  const { t, i18n } = useTranslation("orderPayments");
  const isArabic = i18n.language?.startsWith("ar");

  const { orders, loading, stats, pagination, getOrders, getOrderById, updateOrderStatus, deleteOrder } = useOrders();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    getOrders({
      page: currentPage,
      search: debouncedSearch,
      status: statusFilter === "all" ? "" : statusFilter,
    });
  }, [getOrders, currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Frontend filtering fallback
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((item) => {
      const searchLower = debouncedSearch.toLowerCase();
      const matchSearch =
        !debouncedSearch ||
        item["student.full_name"]?.toLowerCase().includes(searchLower) ||
        item["enrollments.course.title"]?.toLowerCase().includes(searchLower) ||
        item.billing_name?.toLowerCase().includes(searchLower) ||
        String(item.id).includes(searchLower);

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, debouncedSearch, statusFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = async (id) => {
    try {
      const data = await getOrderById(id);
      if (data) {
        setSelectedOrder(data);
        setShowViewModal(true);
      }
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = await showPaymentStatusConfirm(currentStatus);
    if (newStatus) {
      const success = await updateOrderStatus(id, newStatus);
      if (success) {
        getOrders({
          page: currentPage,
          search: debouncedSearch,
          status: statusFilter === "all" ? "" : statusFilter,
        });
      }
    }
  };

  const handleDelete = async (id) => {
    const order = orders.find((r) => r.id === id);
    const confirmed = await showDeleteConfirm(
      order?.["student.full_name"] || order?.billing_name || (isArabic ? "هذا الطلب" : "this order"),
    );

    if (confirmed) {
      await deleteOrder(id);
      getOrders({
        page: currentPage,
        search: debouncedSearch,
        status: statusFilter === "all" ? "" : statusFilter,
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed": return "bg-success-subtle text-success";
      case "pending": return "bg-warning-subtle text-warning";
      case "cancelled": return "bg-danger-subtle text-danger";
      case "refunded": return "bg-secondary-subtle text-secondary";
      default: return "bg-light text-dark";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return "bi-check-circle-fill";
      case "pending": return "bi-clock-fill";
      case "cancelled": return "bi-x-circle-fill";
      case "refunded": return "bi-arrow-counterclockwise";
      default: return "bi-info-circle-fill";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return isArabic ? "مكتمل" : "Completed";
      case "pending": return isArabic ? "قيد الانتظار" : "Pending";
      case "cancelled": return isArabic ? "ملغي" : "Cancelled";
      case "refunded": return isArabic ? "مسترجع" : "Refunded";
      default: return status;
    }
  };

  return (
    <div className="admin-content-page">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{t("orders")}</h2>
          <p className="ac-subtitle text-muted mb-0">{t("track")}</p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* Card 1: Total Revenue */}
        <div className="col-lg-3 col-md-6 col-12">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", backgroundColor: "#e2f9eb", color: "#22c55e" }}
              >
                <i className="bi bi-currency-dollar fs-5"></i>
              </div>
              {/* <span className="fw-semibold" style={{ color: "#22c55e", fontSize: "0.85rem" }}>
                <i className="bi bi-arrow-up-right me-1"></i>+12.5%
              </span> */}
              <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>
                {t("thisMonth")}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.total_revenue || 0} EGP
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {t("totalRevenue")}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="col-lg-3 col-md-6 col-12">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", backgroundColor: "#e0f2fe", color: "#0ea5e9" }}
              >
                <i className="bi bi-cart-check fs-5"></i>
              </div>
              {/* <span className="fw-semibold" style={{ color: "#22c55e", fontSize: "0.85rem" }}>
                <i className="bi bi-arrow-up-right me-1"></i>+8.2%
              </span> */}
              <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>
                {t("thisMonth")}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.total_orders || 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {t("totalOrders")}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="col-lg-3 col-md-6 col-12">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", backgroundColor: "#fffbeb", color: "#d97706" }}
              >
                <i className="bi bi-clock fs-5"></i>
              </div>
              <span className="fw-semibold text-warning" style={{ fontSize: "0.85rem" }}>
                {t("awaitingPayment")}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.pending_count || 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {t("pending")}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Refunded Orders */}
        <div className="col-lg-3 col-md-6 col-12">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", backgroundColor: "#fee2e2", color: "#ef4444" }}
              >
                <i className="bi bi-arrow-counterclockwise fs-5"></i>
              </div>
              <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>
                {t("thisMonth")}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.refunded_count || 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {t("refunded")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ac-rounded-table p-3 p-md-0">
        <div className="review-table-container ">
          <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
            <div className="ac-search-input-wrapper position-relative ">
              <i
                className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${searchTerm ? "text-danger fw-bold" : "text-muted"
                  }`}
                style={{ zIndex: 3 }}
              ></i>
              <input
                type="text"
                className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${searchTerm
                  ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium"
                  : "border-light bg-light text-muted"}`}
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="d-flex  gap-md-3">
              <select className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${statusFilter !== "all"
                ? "border-danger bg-danger-subtle text-danger-emphasis"
                : "border-light bg-light text-muted"
                }`}
                onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">{t("allStudents")}</option>
                <option value="completed">{t("completed")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="refunded">{t("refunded")}</option>
                <option value="cancelled">{isArabic ? "ملغي" : "Cancelled"}</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table ac-table mb-0 align-middle" dir="ltr">
              <thead className="ac-table">
                <tr className="text-muted">
                  <th>{t("orderId")}</th>
                  <th className="text-center">{t("student")}</th>
                  <th className="text-center">{t("course")}</th>
                  <th className="text-center">{t("amount")}</th>
                  <th className="text-center">{t("status")}</th>
                  <th className="text-center">{isArabic ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-bold text-dark">#{item.id}</td>

                      <td className="text-center fw-medium text-dark">
                        {item["student.full_name"] || item.billing_name || "N/A"}
                      </td>

                      <td className="text-center fw-medium text-dark">
                        {item["enrollments.course.title"] || "N/A"}
                      </td>

                      <td className="text-center fw-bold text-success"><span className="text-muted">EGP</span> {item.total_amount || 0}</td>



                      <td className="text-center">
                        <span
                          className={`badge rounded-pill cp ${getStatusBadge(item.status || "pending")}`}
                          style={{
                            cursor: "pointer",
                            padding: "8px 16px",
                          }}
                          onClick={() => handleStatusChange(item.id, item.status || "pending")}
                        >
                          <i className={`bi ${getStatusIcon(item.status || "pending")} me-1`}></i>
                          {getStatusText(item.status || "pending")}
                        </span>
                      </td>

                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm ac-btn-view border-0"
                            title={isArabic ? "عرض التفاصيل" : "View Details"}
                            onClick={() => handleView(item.id)}
                          >
                            <i className="bi bi-eye fs-6"></i>
                          </button>
                          <button
                            className="btn btn-sm ac-btn-deleteTable border-0"
                            title={isArabic ? "حذف" : "Delete"}
                            onClick={() => handleDelete(item.id)}
                          >
                            <i className="bi bi-trash fs-6"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary fw-bold">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <i className="bi bi-inbox fs-1 text-muted mb-2"></i>
                        {isArabic ? "لا توجد طلبات دفع" : "No payment orders found"}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Always visible if data exists */}
          {pagination && (
            <div className="d-flex justify-content-center mt-5 pb-3" dir="ltr">
              <Pagination className="custom-pagination mb-0">
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(pagination.last_page)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    style={{ margin: "0 3px" }}
                    active={idx + 1 === currentPage}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  style={{ margin: "0 6px 0" }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                />
              </Pagination>
            </div>
          )}

        </div>
      </div>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md" className="cert-detail-modal">
        <div className="d-flex align-items-center justify-content-between pt-2 px-3" dir={isArabic ? "rtl" : "ltr"}>
          <Modal.Title className="fs-5 fw-bold">{isArabic ? "تفاصيل الطلب" : "Order Details"}</Modal.Title>
          <Modal.Header closeButton className="border-0"></Modal.Header>
        </div>
        <Modal.Body className="pt-0">
          {selectedOrder && (
            <div className="cert-modal-content">
              <div className="cert-info-list p-3 bg-light rounded-3 mt-3">
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "رقم الطلب:" : "Order ID:"}</span>
                  <span className="fw-bold text-dark">#{selectedOrder.id}</span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "اسم الطالب:" : "Student Name:"}</span>
                  <span className="fw-medium">{selectedOrder["student.full_name"] || selectedOrder.billing_name}</span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "البريد الإلكتروني:" : "Email:"}</span>
                  <span className="fw-medium text-muted">{selectedOrder["student.user.email"] || "N/A"}</span>
                </div>
                <div className="info-item d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "الكورس:" : "Course:"}</span>
                  <span className="fw-medium text-end ms-2" style={{ maxWidth: "200px" }}>{selectedOrder["enrollments.course.title"] || "N/A"}</span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "المبلغ:" : "Amount:"}</span>
                  <span className="fw-bold text-success">${selectedOrder.total_amount || 0}</span>
                </div>

                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "حالة الدفع:" : "Status:"}</span>
                  <span className={`badge rounded-pill ${getStatusBadge(selectedOrder.status || "pending")}`}>
                    {getStatusText(selectedOrder.status || "pending")}
                  </span>
                </div>

              </div>
              <Button
                variant="dark"
                className="mt-3 w-100 rounded-3 py-2 fw-bold"
                onClick={() => setShowViewModal(false)}
                style={{ backgroundColor: "#1a1a1a" }}
              >
                {isArabic ? "إغلاق" : "Close"}
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>

    </div>
  );
}

export default AdminOrders;
