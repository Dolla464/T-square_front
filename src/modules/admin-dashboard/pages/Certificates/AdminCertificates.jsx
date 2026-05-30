import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { Pagination, Modal, Button } from "react-bootstrap";
import { useReviews } from "../../hooks/useReviews";
import { showConfirmCustom, showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import Mock_Certificate_image from "../../../../assets/certificat.jpeg"

import "../Reviews/review.css";

function AdminCertificates() {
  const { i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  // const [selectedReview, setSelectedReview] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const {
    reviews,
    pagination: apiPagination,
    loading,
    getReviews,
    getReviewById,
    changeReviewStatus,
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

    const matchStatus =
      statusFilter === "all" ||
      item.status === statusFilter;

    return matchSearch && matchRating && matchStatus;
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = async (id) => {
    const data = await getReviewById(id);
    if (data) {
      // setSelectedReview(data);
      setShowViewModal(true);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const ok = await showConfirmCustom({
      title: newStatus === "active"
        ? isArabic
          ? "نشر التقييم"
          : "Publish Review"
        : isArabic
          ? "إخفاء التقييم"
          : "Hide Review",

      message: newStatus === "inactive"
        ? isArabic
          ? "هل تريد إخفاء هذا التقييم؟"
          : "Do you want to hide this review?"
        : isArabic
          ? "سيتم نشر التقييم وسيصبح متاحاً للمستخدمين."
          : "The review will be published and visible to users.",

      icon: newStatus == "inactive" ? "warning" : "info",
      variant: newStatus == "inactive" ? "danger" : "primary",
      confirmText: isArabic ? "استمرار" : "Proceed",
    });

    if (!ok) return;

    try {
      await changeReviewStatus(id, newStatus);
      getReviews({ page: currentPage });
    } catch (err) {
      console.error("Status update failed:", err);
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
          <h2 className="ac-title">{isArabic ? "الشهادات" : "Certificates"}</h2>
          <p className="ac-subtitle text-muted mb-0">
            {isArabic ? "إدارة ومراجعة شهادات الطلاب" : "Manage and review student certificates"}
          </p>
        </div>
      </div>
      {/* استاتيك */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-12 mb-3 mb-md-0">
          <div className="state">
            <div className="stat-label">{isArabic ? "إجمالي الشهادات" : "Total Issued Certificates"}</div>
            <div className="stat-value my-2">2</div>
          </div>
        </div>
        <div className="col-md-4 col-12 mb-3 mb-md-0">
          <div className="state ">
            <div className="stat-label">{isArabic ? "الشهادات المعلقة" : "Pending Certificates"}</div>
            <div className="d-flex align-items-center">
              <div className="stat-value my-2 text-warning">12</div>

            </div>
          </div>
        </div>

        <div className="col-md-4 col-12 mb-3 mb-md-0">
          <div className="state ">
            <div className="stat-label">{isArabic ? "الملغاة" : "Revoked Certificates"}</div>
            <div className="stat-value my-2">3</div>
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
              {/* استاتيك */}
              <input
                type="text"
                className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${searchTerm
                  ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium"
                  : "border-light bg-light text-muted"}`}
                placeholder={isArabic ? "بحث في التقييمات..." : "Search reviews..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="d-flex gap-3">
              {/* استاتيك */}
              <select
                className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${ratingFilter !== "all"
                  ? "border-danger bg-danger-subtle text-danger-emphasis"
                  : "border-light bg-light text-muted"
                  }`}
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">{isArabic ? "جميع المجموعات" : "All Groups"}</option>
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value="group name">group name</option>
                ))}
              </select>

              {/* استاتيك */}
              <select
                className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${statusFilter !== "all"
                  ? "border-danger bg-danger-subtle text-danger-emphasis"
                  : "border-light bg-light text-muted"
                  }`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{isArabic ? "جميع الحالات" : "All Status"}</option>
                <option value="issued">{isArabic ? "اصدر" : "Issued"}</option>
                <option value="pending">{isArabic ? "المنتظرة" : "Pending"}</option>
                <option value="revoked">{isArabic ? "الملغاة" : "Revoked"}</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table ac-table mb-0 align-middle" dir="ltr">
              <thead className="ac-table">
                <tr className="text-muted">
                  <th>{isArabic ? "رقم الشهادة" : "Certificate ID"}</th>
                  <th>{isArabic ? "اسم الطالب" : "Student name"}</th>
                  <th>{isArabic ? "عنوان الكورس" : "Course title"}</th>
                  <th>{isArabic ? "تاريخ الاصدار" : "Date issued"}</th>
                  <th className="text-center">{isArabic ? "الحالة" : "Status"}</th>
                  <th className="text-center">{isArabic ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              {/* استاتيك */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border text-danger" role="status"></div>
                    </td>
                  </tr>
                ) :
                  // {/* استاتيك */}
                  //  filteredReviews.length > 0 ? (
                  true ? (
                    [1, 2, 3, 4, 5].map((item) => (
                      // <tr key={item.id}>
                      <tr>
                        <td className="fw-medium text-dark">1</td>
                        <td className="fw-medium text-dark">Mohamed Salama</td>
                        <td className="align-content-center">Frontend development</td>
                        <td className="ac-truncate-text text-secondary">2024-12-30</td>
                        <td className="text-center">

                          <span
                            className={`badge rounded-pill cp ${'active' === "active" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                            style={{
                              cursor: "pointer",
                              padding: "8px 16px",
                            }}
                          // onClick={() => handleStatusChange(item.id, item.status)}
                          >
                            <i
                              className={`bi ${"Issued" === "Issued" ? "bi-patch-check-fill" : "bi-shield-exclamation"} me-1`}
                            ></i>
                            {"Issued" === "Issued"
                              ? isArabic ? "غير منشور" : "Issued"
                              : isArabic ? "منشور" : "Revoked"}
                          </span>



                        </td>
                        <td className="text-center">


                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm ac-btn-view border-0"
                              title="View"
                              onClick={() => handleView(1)}
                            >
                              <i className="bi bi-eye fs-6"></i>
                            </button>

                            <button
                              className="btn btn-sm ac-btn-deleteTable border-0"
                              title="Download"
                            // onClick={() => handleDelete(item.id)}
                            >
                              <i className="bi bi-download fs-6"></i>
                              
                            </button>
                          </div>
                        </td>
                      </tr>

                    ))) : (
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
      </div>
      {/* استاتيك */}
      {/* {apiPagination && (
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
      )} */}
      {/* استاتيك */}
      {/* View Modal  */}
      {/* ── مودال تفاصيل الشهادة ── */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="md" className="cert-detail-modal">
        <div className="d-flex align-items-center justify-content-between pt-2 px-3" dir={isArabic ? "rtl" : "ltr"}>

          <Modal.Title className="fs-5 fw-bold">{isArabic ? "تفاصيل الشهادة" : "Certificate Details"}</Modal.Title>
          <Modal.Header closeButton className="border-0 ">
          </Modal.Header>
        </div>
        <Modal.Body className="pt-0">
          {true && (
            <div className="cert-modal-content">
              <div className="cert-modal-img-wrap mb-4">
                <img src={Mock_Certificate_image} alt={""} className="w-100 rounded-3 shadow-sm" />
              </div>
              <div className="cert-info-list p-3 bg-light rounded-3">
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "اسم الطالب:" : "Student Name:"}</span>
                  <span className="fw-medium">Mohamed Salama</span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "اسم الكورس:" : "Course Title:"}</span>
                  <span className="fw-medium">Frontend development</span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">{isArabic ? "رقم الشهادة:" : "Certificate ID:"}</span>
                  <span className="fw-medium">1</span>
                </div>
                <div className="info-item d-flex justify-content-between">
                  <span className="text-muted">{isArabic ? "تاريخ الإصدار:" : "Issued At:"}</span>
                  <span className="fw-medium">2024-12-30</span>
                </div>

              </div>
              <button
                className="btn-download-pdf mt-3 w-100"
              //  onClick={() => handleDownload(selectedCert.id)}
              >
                <i className="bi bi-download me-1"></i>
                {isArabic ? "تحميل " : "Download "}
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AdminCertificates;
