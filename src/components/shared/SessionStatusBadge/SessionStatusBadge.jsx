import { getSessionStatusConfig } from "./sessionStatusConfig";

function SessionStatusBadge({ status, isArabic = false, className = "" }) {
  const cfg = getSessionStatusConfig(status);

  return (
    <span
      className={`badge rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 ${cfg.bg} ${className}`.trim()}
      style={{ fontSize: "0.75rem", fontWeight: 600 }}
    >
      <i className={`bi ${cfg.icon}`} />
      {isArabic ? cfg.labelAr : cfg.labelEn}
    </span>
  );
}

export default SessionStatusBadge;
