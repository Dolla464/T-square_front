import { useTranslation } from "react-i18next";
import { useCertificates } from "../../hooks/useCertificates";
import "./DashboardCertificates.css";

// ── كارت إحصائية الشهادات ──
function CertStatCard({ icon, iconBg, value, label }) {
  return (
    <div className="cert-stat-card">
      <div className="cert-stat-icon" style={{ backgroundColor: iconBg }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <div className="cert-stat-value">{value}</div>
        <div className="cert-stat-label">{label}</div>
      </div>
    </div>
  );
}

function DashboardCertificates() {
  const { t } = useTranslation("studentDashboard");
  const { certificates, certStats, loading } = useCertificates();

  const handleDownload = (cert) => {
    // TODO: ربط بـ API لتحميل الشهادة كـ PDF
    alert(`Download: ${cert.certificateNum}`);
  };

  return (
    <div className="dash-certs">
      <h4 className="dash-page-title">{t("certificates_page.title")}</h4>

      {loading ? (
        <div className="dash-loading">
          <div className="spinner-border text-danger" role="status" />
        </div>
      ) : (
        <>
          {/* ── إحصائيات ── */}
          <div className="cert-stats-row">
            <CertStatCard
              icon="bi-award-fill"
              iconBg="#fffbf0"
              value={certStats?.earned ?? 0}
              label={t("stats.certificates_earned")}
            />
            <CertStatCard
              icon="bi-shield-fill"
              iconBg="#f0f4ff"
              value={certStats?.inProgress ?? 0}
              label={t("stats.in_progress")}
            />
            <CertStatCard
              icon="bi-mortarboard-fill"
              iconBg="#fff0f0"
              value={certStats?.enrolled ?? 0}
              label={t("stats.courses_enrolled")}
            />
          </div>

          {/* ── شبكة الشهادات ── */}
          <div className="certs-grid">
            {certificates.map((cert) => (
              <div className="cert-card" key={cert.id}>
                {/* صورة الشهادة */}
                <div className="cert-img-wrap">
                  <img
                    src={cert.image}
                    alt={cert.courseTitle}
                    className="cert-img"
                  />
                </div>
                {/* تفاصيل */}
                <div className="cert-card-body">
                  <h6 className="cert-course-title">{cert.courseTitle}</h6>
                  <p className="cert-date">
                    {t("certificates_page.completed_on", { date: cert.completedDate })}
                  </p>
                  <button
                    className="btn-download-pdf"
                    onClick={() => handleDownload(cert)}
                  >
                    <i className="bi bi-download me-1"></i>
                    {t("certificates_page.download_pdf")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── العداد في الأسفل ── */}
          <p className="certs-counter">
            {certificates.length} — {t("certificates_page.title")}
          </p>
        </>
      )}
    </div>
  );
}

export default DashboardCertificates;
