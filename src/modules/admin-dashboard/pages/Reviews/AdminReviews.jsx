import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { Button } from "react-bootstrap";
import DetailModal from "../../../../components/shared/DetailModal/DetailModal";
import AdminPagination from "../../components/shared/AdminPagination";
import { useReviews } from "../../hooks/useReviews";
import { getCompletedLearningGroupsSelection } from "../../services/learningGroupServices";
import { showConfirmCustom, showDeleteConfirm, showReviewPendingConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";

import "./review.css";

function AdminReviews() {
  const { i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [completedGroups, setCompletedGroups] = useState([]);
  const [commentPopup, setCommentPopup] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const notReviewedMessage = isArabic
    ? "لم يقم الطالب بعمل تقييم"
    : "Student has not reviewed";

  // حماية السيرفر من إرسال طلبات مكثفة أثناء الكتابة السريعة (Debounce)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
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

  useEffect(() => {
    getCompletedLearningGroupsSelection()
      .then((res) => setCompletedGroups(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => console.error("Error fetching completed groups:", err));
  }, []);

  const openCommentPopup = useCallback((event, comment) => {
    if (!comment) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const popupWidth = 320;
    const maxLeft = window.innerWidth - popupWidth - 16;

    setCommentPopup({
      text: comment,
      top: Math.min(rect.bottom + 8, window.innerHeight - 180),
      left: Math.min(Math.max(16, rect.left), Math.max(16, maxLeft)),
    });
  }, []);

  const closeCommentPopup = useCallback(() => {
    setCommentPopup(null);
  }, []);

  useEffect(() => {
    if (!commentPopup) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeCommentPopup();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commentPopup, closeCommentPopup]);

  // 1. الربط مع السيرفر
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: 10,
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "all") params.review_status = statusFilter;
    if (groupFilter !== "all") params.group_id = groupFilter;

    getReviews(params);
  }, [currentPage, debouncedSearch, statusFilter, groupFilter, getReviews]);

  // 2. الفلترة المتبقية بداخل الـ Frontend (مثل تقييم النجوم لتقليل حمل السيرفر)
  const filteredReviews = useMemo(() => {
    return (reviews || []).filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.student_name?.toLowerCase().includes(searchLower) ||
        item.course_title?.toLowerCase().includes(searchLower) ||
        item.overall_comment?.toLowerCase().includes(searchLower);

      const matchRating =
        ratingFilter === "all" ||
        (item.has_review !== false &&
          Math.floor(Number(item.rating)) === Number(ratingFilter));

      const matchStatus =
        statusFilter === "all" ||
        item.review_status === statusFilter;

      return matchSearch && matchRating && matchStatus;
    });
  }, [reviews, searchTerm, ratingFilter, statusFilter]);

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
    let newStatus = "";

    if (currentStatus === "pending") {
      const selectedAction = await showReviewPendingConfirm();
      if (!selectedAction) return; // تم النقر على إلغاء/تراجع
      newStatus = selectedAction;
    } else {
      newStatus = currentStatus === "accepted" ? "rejected" : "accepted";
      const ok = await showConfirmCustom({
        title: newStatus === "accepted"
          ? isArabic
            ? "قبول ونشر التقييم"
            : "Accept and Publish Review"
          : isArabic
            ? "رفض وإخفاء التقييم"
            : "Reject and Hide Review",

        message: newStatus === "rejected"
          ? isArabic
            ? "هل تريد رفض وإخفاء هذا التقييم؟"
            : "Do you want to reject and hide this review?"
          : isArabic
            ? "سيتم قبول التقييم ونشره ليصبح مرئياً للمستخدمين."
            : "The review will be accepted and published to be visible to users.",

        icon: newStatus === "rejected" ? "warning" : "info",
        variant: newStatus === "rejected" ? "danger" : "primary",
        confirmText: isArabic ? "استمرار" : "Proceed",
      });

      if (!ok) return;
    }

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
        {/* Card 1: Total Reviews */}
        <div className="col-lg-3 col-12 ">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", backgroundColor: "#f3e8ff", color: "#a855f7" }}
              >
                <i className="bi bi-chat-left-text fs-5"></i>
              </div>
              {/* <span className="fw-semibold" style={{ color: "#22c55e", fontSize: "0.85rem" }}>
                <i className="bi bi-arrow-up-right me-1"></i>+64
              </span> */}
              <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>
                {isArabic ? "كل الأوقات" : "All Time"}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.total_reviews || 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {isArabic ? "إجمالي التقييمات" : "Total Reviews"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Average Rating */}
        <div className="col-lg-3 col-12 ">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", backgroundColor: "#fef3c7", color: "#f59e0b" }}
              >
                <i className="bi bi-star-fill fs-5"></i>
              </div>
              <span className="text-warning" style={{ fontSize: "0.85rem" }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = Number(stats?.average_rating || 0);
                  if (rating >= star) {
                    return <i key={star} className="bi bi-star-fill me-1"></i>;
                  }
                  if (rating >= star - 0.5) {
                    return <i key={star} className="bi bi-star-half me-1"></i>;
                  }
                  return <i key={star} className="bi bi-star me-1"></i>;
                })}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.average_rating || 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {isArabic ? "متوسط التقييم" : "Avg Rating"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Reviews */}
        <div className="col-lg-3 col-6 ">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", backgroundColor: "#fffbeb", color: "#d97706" }}
              >
                <i className="bi bi-clock-history fs-5"></i>
              </div>
              <span className="fw-semibold text-warning" style={{ fontSize: "0.85rem" }}>
                {isArabic ? "قيد الانتظار" : "Awaiting"}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.pending_count || 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {isArabic ? "بانتظار المراجعة" : "Pending Review"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Rejected Reviews */}
        <div className="col-lg-3 col-6 ">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", backgroundColor: "#fee2e2", color: "#ef4444" }}
              >
                <i className="bi bi-shield-x fs-5"></i>
              </div>
              <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>
                {isArabic ? "كل الأوقات" : "All Time"}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.rejected_count || 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {isArabic ? "مرفوضة" : "Rejected"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ac-rounded-table p-3 p-md-0" dir="ltr">
        <div className="review-table-container">
          <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
            <div className="ac-search-input-wrapper position-relative">
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
            <div className="d-flex gap-3 flex-wrap flex-md-nowrap justify-content-md-end w-100">
              <select
                className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${
                  groupFilter !== "all"
                    ? "border-danger bg-danger-subtle text-danger-emphasis"
                    : "border-light bg-light text-muted"
                }`}
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ minWidth: "150px" }}
              >
                <option value="all">
                  {isArabic ? "جميع المجموعات" : "All Groups"}
                </option>
                {completedGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
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
                className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${statusFilter !== "all"
                  ? "border-danger bg-danger-subtle text-danger-emphasis"
                  : "border-light bg-light text-muted"
                  }`}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">{isArabic ? "جميع الحالات" : "All Status"}</option>
                <option value="accepted">{isArabic ? "مقبولة" : "Accepted"}</option>
                <option value="pending">{isArabic ? "قيد الانتظار" : "Pending"}</option>
                <option value="rejected">{isArabic ? "مرفوضة" : "Rejected"}</option>
                <option value="not_reviewed">{isArabic ? "لم يقيّم" : "Not Reviewed"}</option>
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
                  filteredReviews.map((item) => {
                    const rowKey = item.id ?? `student-${item.student_id}`;
                    const hasReview = item.has_review !== false;

                    if (!hasReview) {
                      return (
                        <tr key={rowKey}>
                          <td className="fw-medium text-dark">
                            {item.student_name}
                          </td>
                          <td className="fw-medium text-dark">
                            {item.course_title}
                          </td>
                          <td className="text-muted fst-italic small">
                            {notReviewedMessage}
                          </td>
                          <td className="text-muted fst-italic small">
                            {notReviewedMessage}
                          </td>
                          <td>
                            <span className="badge rounded-pill bg-secondary-subtle text-secondary px-3 py-2">
                              {isArabic ? "لم يقيّم" : "Not Reviewed"}
                            </span>
                          </td>
                          <td className="text-center text-muted">—</td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={rowKey}>
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
                        <td
                          className={`text-secondary ac-truncate-text ${item.overall_comment ? "review-comment-expandable" : ""}`}
                          title={
                            item.overall_comment
                              ? isArabic
                                ? "اضغط لعرض التعليق كاملاً"
                                : "Click to show full comment"
                              : undefined
                          }
                          onClick={(event) => openCommentPopup(event, item.overall_comment)}
                        >
                          {item.overall_comment || "—"}
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill cp ${item.review_status === "accepted" ? "bg-success-subtle text-success" : item.review_status === "pending" ? "bg-warning-subtle text-warning" : "bg-danger-subtle text-danger"}`}
                            style={{
                              cursor: "pointer",
                              padding: "8px 16px",
                            }}
                            onClick={() => handleStatusChange(item.id, item.review_status)}
                          >
                            <i
                              className={`bi ${item.review_status === "accepted" ? "bi-patch-check-fill" : item.review_status === "pending" ? "bi-exclamation-triangle-fill" : "bi-shield-exclamation"} me-1`}
                            ></i>
                            {item.review_status == "pending"
                              ? isArabic ? "قيد الانتظار" : "Pending"
                              : item.review_status == "accepted"
                                ? isArabic ? "مقبول" : "Accepted"
                                : isArabic ? "مرفوض" : "Rejected"}
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
                    );
                  })
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
        <AdminPagination pagination={apiPagination} onPageChange={handlePageChange} />
      )}

      {/* View Modal  */}
      <DetailModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        title={isArabic ? "تفاصيل التقييم" : "Review Details"}
        dir={isArabic ? "rtl" : "ltr"}
      >
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
                    className={`badge rounded-pill ${selectedReview.review_status === "accepted"
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
      </DetailModal>

      {commentPopup &&
        createPortal(
          <>
            <div
              className="review-comment-backdrop"
              onClick={closeCommentPopup}
              aria-hidden="true"
            />
            <div
              className="review-comment-popup"
              style={{ top: commentPopup.top, left: commentPopup.left }}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <p className="review-comment-popup__text mb-0">
                {commentPopup.text}
              </p>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

export default AdminReviews;
