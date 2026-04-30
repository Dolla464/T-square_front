import { useTranslation } from "react-i18next";
import { useCertificates } from "../../hooks/useCertificates";
import "./DashboardCertificates.css";
import StatCard from "../../components/StatCard";

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
                    src={cert.image}
                    alt={cert.courseTitle}
                    className="cert-img"
                  />
                </div>
                {/* تفاصيل */}
                <div className="cert-card-body">
                  <h6 className="cert-course-title">{cert.courseTitle}</h6>
                  <p className="cert-date">
                    {t("certificates_page.completed_on", {
                      date: cert.completedDate,
                    })}
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
