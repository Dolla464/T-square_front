import { useTranslation } from "react-i18next";

const STATUS_CONFIG = {
  present: { bg: "#e6f4ea", color: "#137333", icon: "bi-check-circle-fill" },
  absent: { bg: "#fce8e6", color: "#c5221f", icon: "bi-x-circle-fill" },
  late: { bg: "#fef7e0", color: "#b06000", icon: "bi-clock-fill" },
  not_marked: { bg: "#f1f3f4", color: "#3c4043", icon: "bi-dash-circle" },
};

export default function StatusBadge({ status, compact = false }) {
  const { t } = useTranslation("studentDashboard");
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_marked;

  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center gap-1 ${
        compact ? "attendance-history-status-badge" : "px-3 py-2"
      }`}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <i className={`bi ${cfg.icon}`} />
      {t(`attendance.statusLabels.${status}`, status)}
    </span>
  );
}
