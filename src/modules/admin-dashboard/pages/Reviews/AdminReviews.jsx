import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { Pagination, Modal, Button } from "react-bootstrap";
import { useReviews } from "../../hooks/useReviews";
import {
  showConfirmCustom,
  showDeleteConfirm,
} from "../../../../components/shared/ConfirmDialog/confirmDialog";

import "./review.css";

function AdminReviews() {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // حماية السيرفر من إرسال طلبات مكثفة أثناء الكتابة السريعة (Debounce)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setSearchTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const {
    reviews,
    stats,
    pagination: apiPagination,
    loading,
    getReviews,
    getReviewById,
    changeReviewStatus,
    deleteReview,
  } = useReviews();

  // 1. الربط مع السيرفر: يتم جلب البيانات بناءً على الصفحة والبحث والفلتر المختار
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: 10,
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "all") params.review_status = statusFilter; // متوافق مع الحالات الجديدة

    getReviews(params);
  }, [currentPage, debouncedSearch, statusFilter, getReviews]);

  // 2. الفلترة المتبقية بداخل الـ Frontend (مثل تقييم النجوم لتقليل حمل السيرفر)
  const filteredReviews = (reviews || []).filter((item) => {
    const matchRating =
      ratingFilter === "all" ||
      Math.floor(Number(item.rating)) === Number(ratingFilter);

    return matchRating;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = async (id) => {
    const data = await getReviewById(id);
    if (data) {
      setSelectedReview(data);
      setShowViewModal(true);
    }
  };

  // 3. تعديل منطق تغيير الحالة ليتناسب مع الانتقال بين الحالات (accepted, pending, rejected)
  const handleStatusChange = async (id, currentStatus) => {
    // دورة التنقل التلقائي عند الضغط على الـ Badge: من pending إلى accepted، ومن accepted إلى rejected، ومن rejected إلى pending
    let newStatus = "pending";
    if (currentStatus === "pending") newStatus = "accepted";
    else if (currentStatus === "accepted") newStatus = "rejected";

    let title = isArabic ? "تغيير حالة التقييم" : "Change Status";
    let message = isArabic
      ? "هل تريد تغيير حالة هذا التقييم؟"
      : "Do you want to change this review status?";
    let variant = "primary";

    if (newStatus === "accepted") {
      title = isArabic ? "نشر وقبول التقييم" : "Publish Review";
      message = isArabic
        ? "سيتم نشر التقييم وسيصبح متاحاً للمنتسبين."
        : "The review will be published and visible.";
      variant = "success";
    } else if (newStatus === "rejected") {
      title = isArabic ? "رفض وحجب التقييم" : "Reject Review";
      message = isArabic
        ? "سيتم نقل التقييم إلى المرفوضات وحجبه."
        : "The review will be hidden and rejected.";
      variant = "danger";
    }

    const ok = await showConfirmCustom({
      title,
      message,
      icon: newStatus === "rejected" ? "warning" : "info",
      variant,
      confirmText: isArabic ? "استمرار" : "Proceed",
    });

    if (!ok) return;

    try {
      // بعد تعديل الـ Hook والـ Service، هذا السطر سيقوم بتحديث السيرفر والـ State محلياً فوراً
      await changeReviewStatus(id, newStatus);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleDelete = async (id) => {
    const review = reviews.find((r) => r.id === id);
    const confirmed = await showDeleteConfirm(
      review?.student_name || (isArabic ? "هذا التقييم" : "this review"),
    );

    if (confirmed) {
      await deleteReview(id);
    }
  };

  return (
    <div className="admin-content-page">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">
            {isArabic ? "تقييمات الطلاب" : "Student Reviews"}
          </h2>
          <p className="ac-subtitle text-muted mb-0">
            {isArabic
              ? "إدارة ومراجعة تقييمات الطلاب للكورسات والمحاضرين"
              : "Manage and review student feedback for courses and instructors"}
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-12 mb-3 mb-md-0">
          <div className="state">
            <div className="stat-label">
              {isArabic ? "إجمالي التقييمات" : "Total Reviews"}
            </div>
            <div className="stat-value my-2">{stats?.total_reviews || 0}</div>
            <div style={{ color: "#28a745" }} className="stat-sub">
              +5% this month
            </div>
          </div>
        </div>
        <div className="col-md-3 col-12 mb-3 mb-md-0">
          <div className="state ">
            <div className="stat-label">
              {isArabic ? "متوسط التقييم" : "Avg Rating"}
            </div>
            <div className="d-flex align-items-center">
              <div className="stat-value my-2">
                {stats?.average_rating || 0}
              </div>
              <span className="text-warning fs-5 ms-2">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-half"></i>
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-12 mb-3 mb-md-0">
          <div className="state ">
            <div className="stat-label">
              {isArabic ? "بانتظار المراجعة" : "Pending Review"}
            </div>
            <div className="stat-value my-2 text-warning">
              {stats?.pending_count || 0}
            </div>
            <div className="stat-sub text-muted">Awaiting</div>
          </div>
        </div>
        <div className="col-md-3 col-12 mb-3 mb-md-0">
          <div className="state ">
            <div className="stat-label">{isArabic ? "مرفوضة" : "Rejected"}</div>
            <div className="stat-value my-2">{stats?.rejected_count || 0}</div>
            <div className="stat-sub text-muted">All Time</div>
          </div>
        </div>
      </div>

      <div className="ac-rounded-table p-3 p-md-0">
        <div className="review-table-container ">
          <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
            <div className="ac-search-input-wrapper position-relative ">
              <i
                className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${searchTerm ? "text-danger fw-bold" : "text-muted"}`}
                style={{ zIndex: 3 }}
              ></i>
              <input
                type="text"
                className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${searchTerm ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium" : "border-light bg-light text-muted"}`}
                placeholder={
                  isArabic ? "بحث في التقييمات..." : "Search reviews..."
                }
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="d-flex gap-3">
              <select
                className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${ratingFilter !== "all" ? "border-danger bg-danger-subtle text-danger-emphasis" : "border-light bg-light text-muted"}`}
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">
                  {isArabic ? "جميع التقييمات" : "All Ratings"}
                </option>
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>
                    {num} {isArabic ? "نجوم" : "Stars"}
                  </option>
                ))}
              </select>
              <select
                className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${statusFilter !== "all" ? "border-danger bg-danger-subtle text-danger-emphasis" : "border-light bg-light text-muted"}`}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">
                  {isArabic ? "جميع الحالات" : "All Status"}
                </option>
                <option value="pending">
                  {isArabic ? "قيد الانتظار" : "Pending"}
                </option>
                <option value="accepted">
                  {isArabic ? "منشورة / مقبولة" : "Accepted"}
                </option>
                <option value="rejected">
                  {isArabic ? "مرفوضة" : "Rejected"}
                </option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table ac-table mb-0 align-middle" dir="ltr">
              <thead className="ac-table">
                <tr className="text-muted">
                  <th>{isArabic ? "الطالب" : "Student"}</th>
                  <th>{isArabic ? "الكورس" : "Course"}</th>
                  <th>{isArabic ? "التقييم" : "Rating"}</th>
                  <th>{isArabic ? "التعليق" : "Comment"}</th>
                  <th>{isArabic ? "الحالة" : "Status"}</th>
                  <th className="text-center">
                    {isArabic ? "إجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div
                        className="spinner-border text-danger"
                        role="status"
                      ></div>
                    </td>
                  </tr>
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-medium text-dark">
                        {item.student_name}
                      </td>
                      <td className="fw-medium text-dark">
                        {item.course_title}
                      </td>
                      <td className="align-content-center">
                        <span
                          className="text-warning"
                          style={{ fontSize: "12px" }}
                        >
                          {[1, 2, 3, 4, 5].map((star) => {
                            const rating = Number(item.rating);
                            if (rating >= star)
                              return (
                                <i key={star} className="bi bi-star-fill"></i>
                              );
                            if (rating >= star - 0.5)
                              return (
                                <i key={star} className="bi bi-star-half"></i>
                              );
                            return <i key={star} className="bi bi-star"></i>;
                          })}
                        </span>
                      </td>
                      <td className="ac-truncate-text text-secondary">
                        {item.overall_comment}
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill cp ${
                            item.review_status === "accepted"
                              ? "bg-success-subtle text-success"
                              : item.review_status === "rejected"
                                ? "bg-danger-subtle text-danger"
                                : "bg-warning-subtle text-warning-emphasis"
                          }`}
                          style={{
                            cursor: "pointer",
                            padding: "8px 16px",
                          }}
                          onClick={() =>
                            handleStatusChange(item.id, item.review_status)
                          }
                        >
                          <i
                            className={`bi ${
                              item.review_status === "accepted"
                                ? "bi-patch-check-fill"
                                : item.review_status === "rejected"
                                  ? "bi-x-circle-fill"
                                  : "bi-shield-exclamation"
                            } me-1`}
                          ></i>
                          {item.review_status === "pending" &&
                            (isArabic ? "قيد الانتظار" : "Pending")}
                          {item.review_status === "accepted" &&
                            (isArabic ? "مقبول" : "Accepted")}
                          {item.review_status === "rejected" &&
                            (isArabic ? "مرفوض" : "Rejected")}
                        </span>
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
                            className="btn btn-sm ac-btn-deleteTable border-0"
                            title="Delete"
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
                    <td
                      colSpan="6"
                      className="text-center py-4 text-secondary fw-bold"
                    >
                      {isArabic ? "لا توجد بيانات" : "No data found"}
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
              onClick={() => handlePageChange(apiPagination.current_page - 1)}
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
              onClick={() => handlePageChange(apiPagination.current_page + 1)}
            />
          </Pagination>
        </div>
      )}

      {/* View Modal  */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        size="md"
        className="cert-detail-modal"
      >
        <div
          className="d-flex align-items-center justify-content-between pt-2 px-3"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <Modal.Title className="fs-5 fw-bold">
            {isArabic ? "تفاصيل التقييم" : "Review Details"}
          </Modal.Title>
          <Modal.Header closeButton className="border-0"></Modal.Header>
        </div>
        <Modal.Body className="pt-0">
          {selectedReview && (
            <div className="cert-modal-content">
              <div className="cert-info-list p-3 bg-light rounded-3 mt-3">
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "اسم الطالب:" : "Student Name:"}
                  </span>
                  <span className="fw-medium">
                    {selectedReview.student_name}
                  </span>
                </div>
                <div className="info-item d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "اسم الكورس:" : "Course Title:"}
                  </span>
                  <span
                    className="fw-medium text-end ms-2"
                    style={{ maxWidth: "200px" }}
                  >
                    {selectedReview.course_title}
                  </span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "المحتوى:" : "Content Rating:"}
                  </span>
                  <span className="fw-medium text-warning">
                    {selectedReview.content_rating} / 5
                  </span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "المحاضر:" : "Instructor Rating:"}
                  </span>
                  <span className="fw-medium text-warning">
                    {selectedReview.instructor_rating} / 5
                  </span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "المركز:" : "Center Rating:"}
                  </span>
                  <span className="fw-medium text-warning">
                    {selectedReview.center_rating} / 5
                  </span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "التقييم الإجمالي:" : "Overall Rating:"}
                  </span>
                  <span className="fw-bold text-danger">
                    {selectedReview.rating} / 5
                  </span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "الحالة الحالية:" : "Current Status:"}
                  </span>
                  <span
                    className={`badge rounded-pill ${
                      selectedReview.review_status === "accepted"
                        ? "bg-success-subtle text-success"
                        : selectedReview.review_status === "rejected"
                          ? "bg-danger-subtle text-danger"
                          : "bg-warning-subtle text-warning-emphasis"
                    }`}
                  >
                    {selectedReview.review_status === "pending" &&
                      (isArabic ? "قيد الانتظار" : "Pending")}
                    {selectedReview.review_status === "accepted" &&
                      (isArabic ? "مقبول" : "Accepted")}
                    {selectedReview.review_status === "rejected" &&
                      (isArabic ? "مرفوض" : "Rejected")}
                  </span>
                </div>
                <div className="info-item d-flex flex-column mt-3">
                  <span className="text-muted mb-1">
                    {isArabic ? "التعليق:" : "Comment:"}
                  </span>
                  <p
                    className="mb-0 bg-white p-3 rounded-3 border small text-dark"
                    style={{ lineHeight: "1.6" }}
                  >
                    {selectedReview.overall_comment}
                  </p>
                </div>
                <div className="info-item d-flex justify-content-between mt-3">
                  <span className="text-muted">
                    {isArabic ? "تاريخ التقييم:" : "Review Date:"}
                  </span>
                  <span className="fw-medium small">
                    {selectedReview.created_at}
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

export default AdminReviews;
