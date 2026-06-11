import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { Pagination, Modal, Spinner } from "react-bootstrap";
import { useCertificates } from "../../hooks/useCertificates";
import { useGroups } from "../../hooks/useGroups";
import { showConfirmCustom } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import "../Reviews/review.css";

function AdminCertificates() {
  const { i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedCert, setSelectedCert] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Custom Hooks
  const { selectionGroups, getGroupsSelection } = useGroups();
  const {
    certificates,
    stats,
    pagination: apiPagination,
    loading,
    getCertificates,
    getCertificatePreview,
    downloadCertificate,
  } = useCertificates();

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch groups for select filter
  useEffect(() => {
    getGroupsSelection();
  }, [getGroupsSelection]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, groupFilter, statusFilter]);

  // Fetch certificates from backend
  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: 10,
    };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (groupFilter !== "all") params.group_id = groupFilter;
    if (statusFilter !== "all") params.status = statusFilter;

    getCertificates(params);
  }, [
    currentPage,
    debouncedSearchTerm,
    groupFilter,
    statusFilter,
    getCertificates,
  ]);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = async (cert) => {
    setSelectedCert(cert);
    setShowViewModal(true);
    setPreviewLoading(true);

    // 1. تنظيف الرابط القديم من الذاكرة لو موجود لتجنب الـ Memory Leaks
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      // 2. استدعاء السيرفيس (الآن هي ترجع الـ Object URL الجاهز والمحمي من الـ IDM)
      const url = await getCertificatePreview(cert.id);

      // 3. حفظ الرابط مباشرة في الـ State لتقديمه للـ Modal أو الـ Iframe
      setPreviewUrl(url);
    } catch (err) {
      console.error("Error loading certificate preview:", err);
    } finally {
      setPreviewLoading(false);
    }
  };



  const handleDownload = async (id, certificateNum) => {
    await downloadCertificate(id, certificateNum || "certificate");
  };

  return (
    <div className="admin-content-page position-relative">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{isArabic ? "الشهادات" : "Certificates"}</h2>
          <p className="ac-subtitle text-muted mb-0">
            {isArabic
              ? "إدارة ومراجعة شهادات الطلاب"
              : "Manage and review student certificates"}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Issued Certificates */}
        <div className="col-lg-4 col-12">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#e0f2fe", color: "#0ea5e9" }}
              >
                <i className="bi bi-mortarboard fs-5"></i>
              </div>
              <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>
                {isArabic ? "هذا الشهر" : "This month"}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.issued ?? 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {isArabic ? "إجمالي الشهادات" : "Total Issued Certificates"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Certificates */}
        <div className="col-lg-4 col-6">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#fffbeb", color: "#d97706" }}
              >
                <i className="bi bi-clock-history fs-5"></i>
              </div>
              <span className="fw-semibold text-warning" style={{ fontSize: "0.85rem" }}>
                {isArabic ? "قيد الانتظار" : "Pending"}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.pending ?? 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {isArabic ? "الشهادات المعلقة" : "Pending Certificates"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Revoked Certificates */}
        <div className="col-lg-4 col-6">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#fee2e2", color: "#ef4444" }}
              >
                <i className="bi bi-shield-x fs-5"></i>
              </div>
              <span className="fw-semibold text-danger" style={{ fontSize: "0.85rem" }}>
                {isArabic ? "الملغاة" : "Revoked"}
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>
                {stats?.revoked ?? 0}
              </h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>
                {isArabic ? "الملغاة" : "Revoked Certificates"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="ac-rounded-table p-3 p-md-0">
        <div className="review-table-container">
          <div className="ac-filters-bar d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-3">
            {/* Search Input */}
            <div className="ac-search-input-wrapper position-relative" >
              <i
                className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${
                  searchTerm ? "text-danger fw-bold" : "text-muted"
                }`}
                style={{ zIndex: 3 }}
              ></i>
              <input
                type="text"
                className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${
                  searchTerm
                    ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium"
                    : "border-light bg-light text-muted"
                }`}
                placeholder={
                  isArabic ? "بحث في الشهادات..." : "Search certificates..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Dropdown Filters */}
            <div className="d-flex gap-3 w-100 justify-content-md-end flex-wrap flex-md-nowrap">
              {/* Learning Groups Filter */}
              <select
                className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${
                  groupFilter !== "all"
                    ? "border-danger bg-danger-subtle text-danger-emphasis"
                    : "border-light bg-light text-muted"
                }`}
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                style={{ minWidth: "150px" }}
              >
                <option value="all">
                  {isArabic ? "جميع المجموعات" : "All Groups"}
                </option>
                {selectionGroups &&
                  selectionGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {isArabic
                        ? group.name_ar || group.name
                        : group.name_en || group.name}
                    </option>
                  ))}
              </select>

              {/* Status Filter */}
              <select
                className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${
                  statusFilter !== "all"
                    ? "border-danger bg-danger-subtle text-danger-emphasis"
                    : "border-light bg-light text-muted"
                }`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ minWidth: "150px" }}
              >
                <option value="all">
                  {isArabic ? "جميع الحالات" : "All Status"}
                </option>
                <option value="issued">{isArabic ? "اصدر" : "Issued"}</option>
                <option value="pending">
                  {isArabic ? "المنتظرة" : "Pending"}
                </option>
                <option value="revoked">
                  {isArabic ? "الملغاة" : "Revoked"}
                </option>
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
                  <th className="text-center">
                    {isArabic ? "الحالة" : "Status"}
                  </th>
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
                ) : certificates.length > 0 ? (
                  certificates.map((item) => (
                    <tr key={item.id}>
                      <td className="fw-medium text-dark">
                        {item.certificate_num ?? "N/A"}
                      </td>
                      <td className="fw-medium text-dark">
                        {item.student?.full_name ?? "N/A"}
                      </td>
                      <td className="align-content-center">
                        {isArabic
                          ? item.course?.title_ar || item.course?.title || "N/A"
                          : item.course?.title_en ||
                            item.course?.title ||
                            item.course?.title_ar ||
                            "N/A"}
                      </td>
                      <td className="ac-truncate-text text-secondary">
                        {item.issued_at
                          ? new Date(item.issued_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge rounded-pill cp ${
                            item.status === "issued"
                              ? "bg-success-subtle text-success"
                              : item.status === "pending"
                                ? "bg-warning-subtle text-warning"
                                : "bg-danger-subtle text-danger"
                          }`}
                          style={{ padding: "8px 16px" }}
                         
                        >
                          <i
                            className={`bi ${
                              item.status === "issued"
                                ? "bi-patch-check-fill"
                                : item.status === "pending"
                                  ? "bi-exclamation-triangle-fill"
                                  : "bi-shield-exclamation"
                            } me-1`}
                          ></i>
                          {item.status === "issued"
                            ? isArabic
                              ? "مُصْدَر"
                              : "Issued"
                            : item.status === "pending"
                              ? isArabic
                                ? "قيد الانتظار"
                                : "Pending"
                              : isArabic
                                ? "ملغى"
                                : "Revoked"}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm ac-btn-view border-0"
                            title="View"
                            onClick={() => handleView(item)}
                          >
                            <i className="bi bi-eye fs-6"></i>
                          </button>
                          <button
                            className="btn btn-sm ac-btn-deleteTable border-0"
                            title="Download"
                            onClick={() =>
                              handleDownload(item.id, item.certificate_num)
                            }
                          >
                            <i className="bi bi-download fs-6"></i>
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

      {/* Pagination */}
      {apiPagination && apiPagination.total_pages > 1 && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination className="custom-pagination">
            <Pagination.Prev
              disabled={apiPagination.current_page === 1}
              onClick={() => handlePageChange(apiPagination.current_page - 1)}
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
              onClick={() => handlePageChange(apiPagination.current_page + 1)}
            />
          </Pagination>
        </div>
      )}

      {/* View Certificate Details Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        size="lg"
        className="cert-detail-modal"
      >
        <div
          className="d-flex align-items-center justify-content-between pt-2 px-3"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <Modal.Title className="fs-5 fw-bold">
            {isArabic ? "تفاصيل الشهادة" : "Certificate Details"}
          </Modal.Title>
          <Modal.Header closeButton className="border-0"></Modal.Header>
        </div>
        <Modal.Body className="pt-0">
          {selectedCert && (
            <div className="cert-modal-content">
              {/* dynamic iframe preview */}
              <div
                className="cert-modal-img-wrap mb-4 position-relative"
                style={{ minHeight: "350px" }}
              >
                {previewLoading ? (
                  <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <div
                      className="spinner-border text-danger"
                      role="status"
                    ></div>
                    <p className="mt-2 text-muted">
                      {isArabic
                        ? "جاري تحميل المعاينة..."
                        : "Loading preview..."}
                    </p>
                  </div>
                ) : previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title="Certificate Preview"
                    width="100%"
                    height="400px"
                    style={{ border: "none", borderRadius: "8px" }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center border rounded-3 bg-light"
                    style={{ height: "350px" }}
                  >
                    <p className="mb-0 text-muted">
                      {isArabic
                        ? "تعذر تحميل المعاينة"
                        : "Could not load preview"}
                    </p>
                  </div>
                )}
              </div>

              <div className="cert-info-list p-3 bg-light rounded-3">
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "اسم الطالب:" : "Student Name:"}
                  </span>
                  <span className="fw-medium">
                    {selectedCert.student?.full_name ?? "N/A"}
                  </span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "اسم الكورس:" : "Course Title:"}
                  </span>
                  <span className="fw-medium">
                    {isArabic
                      ? selectedCert.course?.title_ar ||
                        selectedCert.course?.title ||
                        "N/A"
                      : selectedCert.course?.title_en ||
                        selectedCert.course?.title ||
                        selectedCert.course?.title_ar ||
                        "N/A"}
                  </span>
                </div>
                <div className="info-item d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    {isArabic ? "رقم الشهادة:" : "Certificate ID:"}
                  </span>
                  <span className="fw-medium">
                    {selectedCert.certificate_num ?? "N/A"}
                  </span>
                </div>
                <div className="info-item d-flex justify-content-between">
                  <span className="text-muted">
                    {isArabic ? "تاريخ الإصدار:" : "Issued At:"}
                  </span>
                  <span className="fw-medium">
                    {selectedCert.issued_at
                      ? new Date(selectedCert.issued_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              <button
                className="btn-download-pdf mt-3 w-100"
                onClick={() =>
                  handleDownload(selectedCert.id, selectedCert.certificate_num)
                }
                disabled={loading}
              >
                {loading ? (
                  <div
                    className="spinner-border spinner-border-sm text-light me-1"
                    role="status"
                  ></div>
                ) : (
                  <>
                    <i className="bi bi-download me-1"></i>
                    {isArabic ? "تحميل " : "Download "}
                  </>
                )}
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default AdminCertificates;
