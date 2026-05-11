import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { Pagination, Modal, Button } from "react-bootstrap";
import { useReviews } from "../../hooks/useReviews";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";

import "./review.css";

function AdminReviews() {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const {
    reviews,
    pagination: apiPagination,
    loading,
    getReviews,
    getReviewById,
    deleteReview
  } = useReviews();

  useEffect(() => {
    getReviews({ page: currentPage });
  }, [currentPage, getReviews]);

  // Frontend search and filtering
  const filteredReviews = (reviews || []).filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      item.student_name?.toLowerCase().includes(searchLower) ||
      item.course_title?.toLowerCase().includes(searchLower) ||
      item.overall_comment?.toLowerCase().includes(searchLower);

    const matchRating =
      ratingFilter === "all" ||
      Math.floor(Number(item.rating)) === Number(ratingFilter);

    return matchSearch && matchRating;
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

  const handleDelete = async (id) => {
    const review = reviews.find(r => r.id === id);
    const confirmed = await showDeleteConfirm(review?.student_name || (isArabic ? "هذا التقييم" : "this review"));

    if (confirmed) {
      const success = await deleteReview(id);
      if (success) {
        getReviews({ page: currentPage });
      }
    }
  };

  return (
    <div className="admin-content-page">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{isArabic ? "تقييمات الطلاب" : "Student Reviews"}</h2>
          <p className="ac-subtitle text-muted mb-0">
            {isArabic ? "إدارة ومراجعة تقييمات الطلاب للكورسات والمحاضرين" : "Manage and review student feedback for courses and instructors"}
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="state">
            <div className="stat-label">{isArabic ? "إجمالي التقييمات" : "Total Reviews"}</div>
            <div className="stat-value my-2">{apiPagination?.total || 0}</div>
            <div style={{ color: "#28a745" }} className="stat-sub">+5% this month</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="state ">
            <div className="stat-label">{isArabic ? "متوسط التقييم" : "Avg Rating"}</div>
            <div className="d-flex align-items-center">
              <div className="stat-value my-2">4.8</div>
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
        <div className="col-md-3 col-6">
          <div className="state ">
            <div className="stat-label">{isArabic ? "بانتظار المراجعة" : "Pending Review"}</div>
            <div className="stat-value my-2 text-warning">12</div>
            <div className="stat-sub text-muted">Awaiting</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="state ">
            <div className="stat-label">{isArabic ? "مرفوضة" : "Rejected"}</div>
            <div className="stat-value my-2">3</div>
            <div className="stat-sub text-muted">All Time</div>
          </div>
        </div>
      </div>

      <div className="table-responsive ac-rounded-table">
        <div className="review-table-container ">
          <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
            <div className="ac-search-input-wrapper">
              <i className="bi bi-search ac-search-icon"></i>
              <input
                type="text"
                className="form-control ac-search-input"
                placeholder={isArabic ? "بحث في التقييمات..." : "Search reviews..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="d-flex w-25 gap-md-3">
              <select
                className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">{isArabic ? "جميع التقييمات" : "All Ratings"}</option>
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>{num} {isArabic ? "نجوم" : "Stars"}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="table ac-table mb-0 align-middle" dir="ltr">
            <thead className="ac-table">
              <tr className="text-muted">
                <th>{isArabic ? "الطالب" : "Student"}</th>
                <th>{isArabic ? "الكورس" : "Course"}</th>
                <th>{isArabic ? "التقييم" : "Rating"}</th>
                <th>{isArabic ? "التعليق" : "Comment"}</th>
                <th>{isArabic ? "الحالة" : "Status"}</th>
                <th className="text-center">{isArabic ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border text-danger" role="status"></div>
                  </td>
                </tr>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-medium text-dark">{item.student_name}</td>
                    <td className="fw-medium text-dark">{item.course_title}</td>
                    <td className="align-content-center">
                      <span className="text-warning" style={{ fontSize: "12px" }}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const rating = Number(item.rating);
                          if (rating >= star) return <i key={star} className="bi bi-star-fill"></i>;
                          if (rating >= star - 0.5) return <i key={star} className="bi bi-star-half"></i>;
                          return <i key={star} className="bi bi-star"></i>;
                        })}
                      </span>
                    </td>
                    <td className="ac-truncate-text text-secondary">{item.overall_comment}</td>
                    <td>
                      <select className="status-select">
                        <option value="active" className="text-success">{isArabic ? "نشط" : "Active"}</option>
                        <option value="rejected" className="text-danger">{isArabic ? "مرفوض" : "Rejected"}</option>
                      </select>
                    </td>
                    <td className="text-center">


                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm ac-btn-view border-0"
                          title="View"
                          onClick={() => handleView(item.id)}                        >
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
                  <td colSpan="6" className="text-center py-4 text-secondary fw-bold">
                    {isArabic ? "لا توجد بيانات" : "No data found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              onClick={() =>
                handlePageChange(apiPagination.current_page + 1)
              }
            />

          </Pagination>
        </div>
      )}

      {/* View Modal  */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md" className="cert-detail-modal">
        <div className="d-flex align-items-center justify-content-between pt-2 px-3" dir={isArabic ? "rtl" : "ltr"}>
          <Modal.Title className="fs-5 fw-bold">{isArabic ? "تفاصيل التقييم" : "Review Details"}</Modal.Title>
          <Modal.Header closeButton className="border-0"></Modal.Header>
        </div>
        <Modal.Body className="pt-0">
          {selectedReview && (
            <div className="cert-modal-content">
              <div className="cert-info-list p-3 bg-light rounded-3 mt-3">
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "اسم الطالب:" : "Student Name:"}</span>
                  <span className="fw-medium">{selectedReview.student_name}</span>
                </div>
                <div className="info-item d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "اسم الكورس:" : "Course Title:"}</span>
                  <span className="fw-medium text-end ms-2" style={{ maxWidth: "200px" }}>{selectedReview.course_title}</span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "المحتوى:" : "Content Rating:"}</span>
                  <span className="fw-medium text-warning">{selectedReview.content_rating} / 5</span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "المحاضر:" : "Instructor Rating:"}</span>
                  <span className="fw-medium text-warning">{selectedReview.instructor_rating} / 5</span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "المركز:" : "Center Rating:"}</span>
                  <span className="fw-medium text-warning">{selectedReview.center_rating} / 5</span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "التقييم الإجمالي:" : "Overall Rating:"}</span>
                  <span className="fw-bold text-danger">{selectedReview.rating} / 5</span>
                </div>
                <div className="info-item d-flex flex-column mt-3">
                  <span className="text-muted mb-1">{isArabic ? "التعليق:" : "Comment:"}</span>
                  <p className="mb-0 bg-white p-3 rounded-3 border small text-dark" style={{ lineHeight: "1.6" }}>
                    {selectedReview.overall_comment}
                  </p>
                </div>
                <div className="info-item d-flex justify-content-between mt-3">
                  <span className="text-muted">{isArabic ? "تاريخ التقييم:" : "Review Date:"}</span>
                  <span className="fw-medium small">{selectedReview.created_at}</span>
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
