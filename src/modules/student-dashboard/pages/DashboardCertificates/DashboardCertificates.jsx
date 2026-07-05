import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DetailModal from "../../../../components/shared/DetailModal/DetailModal";
import { useCertificates } from "../../hooks/useCertificates";
import "./DashboardCertificates.css";
import StatCard from "../../components/StatCard";

import { getStudentCourses } from "../../hooks/useCourses";

function DashboardCertificates() {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const {
    certificates,
    loading,
    downloading,
    getCertificatePreview,
    downloadCertificate,
  } = useCertificates();

  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState({});

  // Load preview URLs for all certificates
  useEffect(() => {
    let active = true;
    if (certificates && certificates.length > 0) {
      certificates.forEach(async (cert) => {
        try {
          const url = await getCertificatePreview(cert.id);
          if (active) {
            setPreviewUrls((prev) => ({ ...prev, [cert.id]: url }));
          }
        } catch (err) {
          console.error(`Failed to load preview for cert ${cert.id}:`, err);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [certificates, getCertificatePreview]);

  // Cleanup all preview URLs on unmount
  useEffect(() => {
    return () => {
      setPreviewUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url) window.URL.revokeObjectURL(url);
        });
        return {};
      });
    };
  }, []);

  // Calculate stats manually since they're no longer in the hook
  const { stats } = getStudentCourses() || {};
  const certStats = {
    earned: certificates?.length ?? 0,
    inProgress: stats?.in_progress ?? 0,
    enrolled: stats?.total_enrolled ?? 0,
  };

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleView = async (cert) => {
    setSelectedCert(cert);
    setShowModal(true);
    setPreviewLoading(true);

    // Free the previous Object URL (if any) to avoid memory leaks.
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      const url = await getCertificatePreview(cert.id);
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

  const STAT_CARDS = [
    {
      icon: "bi-award-fill",
      iconBg: "#fffbf0",
      iconColor: "#be1522",
      label: t("stats.certificates_earned"),
      key: "earned",
    },
    {
      icon: "bi-clock-history",
      iconBg: "#f0f4ff",
      iconColor: "#be1522",
      label: t("stats.in_progress"),
      key: "inProgress",
    },
    {
      icon: "bi-mortarboard-fill",
      iconBg: "#fff0f0",
      iconColor: "#be1522",
      label: t("stats.courses_enrolled"),
      key: "enrolled",
    },
  ];

  return (
    <div className="dash-certs">
      <h4 className="dash-page-title d-md-none d-block ">
        {t("certificates_page.title")}
      </h4>

      {loading ? (
        <div className="dash-loading">
          <div className="spinner-border text-danger" role="status" />
        </div>
      ) : (
        <>
          {/* ── إحصائيات ── */}
          <div className="cert-stats-row">
            {STAT_CARDS.map(({ key, ...cardProps }) => (
              <StatCard
                key={key}
                {...cardProps}
                value={certStats?.[key] ?? 0}
              />
            ))}
          </div>

          {/* ── شبكة الشهادات ── */}
          <div className="certs-grid">
            {certificates.map((cert) => (
              <div className="cert-card" key={cert.id}>
                {/* صورة الشهادة */}
                <div className="cert-img-wrap">
                  {previewUrls[cert.id] ? (
                    <iframe
                      src={`${previewUrls[cert.id]}#toolbar=0&navpanes=0&scrollbar=0`}
                      title={cert?.course_title ?? "Certificate"}
                      className="cert-img"
                      style={{ border: "none", width: "100%", height: "100%", pointerEvents: "none" }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-light">
                      <div className="spinner-border spinner-border-sm text-danger" role="status" />
                    </div>
                  )}
                </div>
                {/* تفاصيل */}
                <div className="cert-card-body">
                  <h6 className="cert-course-title">
                    {cert?.course_title ?? (isArabic ? "غير متاح" : "N/A")}
                  </h6>
                  <p className="cert-date">
                    {t("certificates_page.completed_on", {
                      date: cert?.issued_at
                        ? new Date(cert.issued_at).toLocaleDateString()
                        : "-",
                    })}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn-download-pdf flex-grow-1"
                      onClick={() =>
                        handleDownload(cert.id, cert?.certificate_num)
                      }
                    >
                      <i className="bi bi-download me-1"></i>
                      {t("certificates_page.download_pdf")}
                    </button>
                    <button
                      className="btn-view-cert"
                      onClick={() => handleView(cert)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── العداد في الأسفل ── */}
          <p className="certs-counter">
            {certificates.length} — {t("certificates_page.title")}
          </p>

          {/* ── مودال تفاصيل الشهادة ── */}
          <DetailModal
            show={showModal}
            onHide={() => setShowModal(false)}
            title={isArabic ? "تفاصيل الشهادة" : "Certificate Details"}
            dir={isArabic ? "rtl" : "ltr"}
          >
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
                        {selectedCert?.student_name ?? "N/A"}
                      </span>
                    </div>
                    <div className="info-item d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        {isArabic ? "اسم الكورس:" : "Course Title:"}
                      </span>
                      <span className="fw-medium ">
                        {selectedCert?.course_title ?? "N/A"}
                      </span>
                    </div>
                    <div className="info-item d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        {isArabic ? "رقم الشهادة:" : "Certificate ID:"}
                      </span>
                      <span className="fw-medium">
                        {selectedCert?.certificate_num ?? "N/A"}
                      </span>
                    </div>
                    <div className="info-item d-flex justify-content-between">
                      <span className="text-muted">
                        {isArabic ? "تاريخ الإصدار:" : "Issued At:"}
                      </span>
                      <span className="fw-medium">
                        {selectedCert?.issued_at
                          ? new Date(
                              selectedCert.issued_at,
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn-download-pdf mt-3 w-100"
                    onClick={() =>
                      handleDownload(
                        selectedCert.id,
                        selectedCert?.certificate_num,
                      )
                    }
                    disabled={downloading}
                  >
                    {downloading ? (
                      <div
                        className="spinner-border spinner-border-sm text-light me-1"
                        role="status"
                      ></div>
                    ) : (
                      <>
                        <i className="bi bi-download me-1"></i>
                        {t("certificates_page.download_pdf")}
                      </>
                    )}
                  </button>
                </div>
              )}
          </DetailModal>
        </>
      )}
    </div>
  );
}

export default DashboardCertificates;
