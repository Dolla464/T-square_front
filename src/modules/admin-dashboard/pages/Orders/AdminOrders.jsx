import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { Pagination, Modal, Button } from "react-bootstrap";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";

import "../Reviews/review.css";

function AdminOrders() {
  const { t, i18n } = useTranslation("orderPayments");
  const isArabic = i18n.language?.startsWith("ar");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [reviews, setReviews] = useState([
    {
      id: 1,
      student_name: "Ahmed Ali",
      course_title: "React Course",
      rating: 5,
      overall_comment: "Excellent course and very helpful",
      content_rating: 5,
      instructor_rating: 5,
      center_rating: 4,
      created_at: "2026-05-09",
    },
    {
      id: 2,
      student_name: "Sara Mohamed",
      course_title: "Laravel Course",
      rating: 4,
      overall_comment: "Good explanation and organized content",
      content_rating: 4,
      instructor_rating: 4,
      center_rating: 5,
      created_at: "2026-05-08",
    },
    {
      id: 3,
      student_name: "Omar Khaled",
      course_title: "UI/UX Course",
      rating: 3,
      overall_comment: "Average experience",
      content_rating: 3,
      instructor_rating: 4,
      center_rating: 3,
      created_at: "2026-05-07",
    },
  ]);



  useEffect(() => { }, []);

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
    const data = reviews.find((item) => item.id === id);

    if (data) {
      setSelectedReview(data);
      setShowViewModal(true);
    }
  };

  const handleDelete = async (id) => {
    const review = reviews.find((r) => r.id === id);

    const confirmed = await showDeleteConfirm(
      review?.student_name || (isArabic ? "هذا التقييم" : "this review"),
    );

    if (confirmed) {
      setReviews((prev) => prev.filter((item) => item.id !== id));
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
        <div className="col-md-3 col-6">
          <div className="state">
            <div className="stat-label">{t("totalRevenue")}</div>
            <div className="stat-value my-2">$125,430</div>
            <div style={{ color: "#28a745" }} className="stat-sub">
              +12.5% {t("fromLastMonth")}
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="state ">
            <div className="stat-label">{t("totalOrders")}</div>
            <div>
              <div className="stat-value my-2">1,284</div>
              <div style={{ color: "#28a745" }} className="stat-sub">
                +8.2% {t("fromLastMonth")}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="state ">
            <div className="stat-label">{t("pending")}</div>
            <div className="stat-value my-2 text-warning">24</div>
            <div className="stat-sub text-muted">{t("awaitingPayment")}</div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="state ">
            <div className="stat-label">{t("refunded")}</div>
            <div className="stat-value my-2">8</div>
            <div className="stat-sub text-muted">{t("thisMonth")}</div>
          </div>
        </div>
      </div>

      <div className="table-responsive ac-rounded-table">
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

            <div className="d-flex w-25 gap-md-3">
              <select className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${ratingFilter !== "all"
                ? "border-danger bg-danger-subtle text-danger-emphasis"
                : "border-light bg-light text-muted"
                }`}
                onChange={(e) => setRatingFilter(e.target.value)}>
                <option value="all">{t("allStudents")}</option>
                <option value="completed">{t("completed")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="failed">{t("failed")}</option>
                <option value="refunded">{t("refunded")}</option>
              </select>
            </div>
          </div>

          <table className="table ac-table mb-0 align-middle" dir="ltr">
            <thead className="ac-table">
              <tr className="text-muted">
                <th>{t("orderId")}</th>
                <th>{t("student")}</th>
                <th>{t("course")}</th>
                <th>{t("amount")}</th>
                <th>{t("paymentMethod")}</th>
                <th>{t("status")}</th>
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
                    <td className="fw-medium text-dark">#{item.id}</td>

                    <td className="fw-medium text-dark">{item.student_name}</td>

                    <td className="fw-medium text-dark">{item.course_title}</td>

                    <td className="fw-medium text-dark">${item.rating * 20}</td>

                    <td className="text-secondary">Credit Card</td>

                    <td>
                      <span className="status completed">{t("completed")}</span>
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
  );
}

export default AdminOrders;
