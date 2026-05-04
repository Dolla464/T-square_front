import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "react-bootstrap";
import { useCertificates } from "../../hooks/useCertificates";
import { downloadStudentCertificate, showStudentCertificate } from "../../services/dashboardService";
import "./DashboardCertificates.css";
import StatCard from "../../components/StatCard";
import certImg from "../../../../assets/certificat.jpeg";
import { getStudentCourses } from "../../hooks/useCourses";
import { toastCustom } from "../../../../components/shared/Toaster/toaster";
import i18next from "i18next";



function DashboardCertificates() {
  const { t } = useTranslation("studentDashboard");
  const isArabic = i18next.language === "ar";
  const { certificates, loading } = useCertificates();
  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [fetchingCert, setFetchingCert] = useState(false);

  // Calculate stats manually since they're no longer in the hook
  const { stats } = getStudentCourses() || {};
  const certStats = {
    earned: certificates?.length || 0,
    inProgress: stats?.in_progress ?? 0,
    enrolled: stats?.total_enrolled ?? 0,
  };

  const handleView = async (certId) => {
    try {
      setFetchingCert(true);
      const response = await showStudentCertificate(certId);
      setSelectedCert(response.data?.data || response.data);
      setShowModal(true);
    } catch (error) {
      toastCustom({
        message: isArabic ? "حدث خطأ أثناء تحميل تفاصيل الشهادة." : "Error loading certificate details.",
        type: "error",
      });
    } finally {
      setFetchingCert(false);
    }
  };

  const handleDownload = async (certId) => {
    try {
      const response = await downloadStudentCertificate(certId);
      // Assuming the response data contains the download URL or we can use the cert's own URL
      if (response.data?.download_url) {
        window.open(response.data.download_url, "_blank");
      } else {
        // Fallback to the url in the cert object if available
        const cert = certificates.find(c => c.id === certId);
        if (cert?.certificate_url) {
          window.open(cert.certificate_url, "_blank");
        }
      }
    } catch (error) {
      toastCustom({
        message: isArabic ? "ملف الشهادة غير موجود." : "Certificate file not found.",
        type: "error",
      });
    }
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
      <h4 className="dash-page-title d-md-none d-block ">{t("certificates_page.title")}</h4>

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
                  <img
                    src={certImg}
                    alt={cert.course_title}
                    className="cert-img"
                  />
                </div>
                {/* تفاصيل */}
                <div className="cert-card-body">
                  <h6 className="cert-course-title">{cert.course_title}</h6>
                  <p className="cert-date">
                    {t("certificates_page.completed_on", {
                      date: cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "-",
                    })}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn-download-pdf flex-grow-1"
                      onClick={() => handleDownload(cert.id)}
                    >
                      <i className="bi bi-download me-1"></i>
                      {t("certificates_page.download_pdf")}
                    </button>
                    <button
                      className="btn-view-cert"
                      onClick={() => handleView(cert.id)}
                      disabled={fetchingCert}
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
          <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md" className="cert-detail-modal">
            <div className="d-flex align-items-center justify-content-between pt-2 px-3" dir={isArabic ? "rtl" : "ltr"}>

              <Modal.Title className="fs-5 fw-bold">{isArabic ? "تفاصيل الشهادة" : "Certificate Details"}</Modal.Title>
              <Modal.Header closeButton className="border-0 ">
              </Modal.Header>
            </div>
            <Modal.Body className="pt-0">
              {selectedCert && (
                <div className="cert-modal-content">
                  <div className="cert-modal-img-wrap mb-4">
                    <img src={certImg} alt={selectedCert.course_title} className="w-100 rounded-3 shadow-sm" />
                  </div>
                  <div className="cert-info-list p-3 bg-light rounded-3">
                    <div className="info-item d-flex justify-content-between mb-2">
                      <span className="text-muted">{isArabic ? "اسم الطالب:" : "Student Name:"}</span>
                      <span className="fw-medium">{selectedCert.student_name}</span>
                    </div>
                    <div className="info-item d-flex justify-content-between mb-2">
                      <span className="text-muted">{isArabic ? "اسم الكورس:" : "Course Title:"}</span>
                      <span className="fw-medium ">{selectedCert.course_title}</span>
                    </div>
                    <div className="info-item d-flex justify-content-between mb-2">
                      <span className="text-muted">{isArabic ? "رقم الشهادة:" : "Certificate ID:"}</span>
                      <span className="fw-medium">{selectedCert.certificate_num}</span>
                    </div>
                    <div className="info-item d-flex justify-content-between">
                      <span className="text-muted">{isArabic ? "تاريخ الإصدار:" : "Issued At:"}</span>
                      <span className="fw-medium">{selectedCert.issued_at ? new Date(selectedCert.issued_at).toLocaleDateString() : "-"}</span>
                    </div>

                  </div>
                  <button
                    className="btn-download-pdf mt-3 w-100"
                    onClick={() => handleDownload(selectedCert.id)}
                  >
                    <i className="bi bi-download me-1"></i>
                    {t("certificates_page.download_pdf")}
                  </button>
                </div>
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </div>
  );
}

export default DashboardCertificates;
