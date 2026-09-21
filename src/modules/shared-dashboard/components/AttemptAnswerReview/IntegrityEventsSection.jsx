import { useTranslation } from "react-i18next";

const EVENT_TYPE_LABELS = {
  tab_hidden: "integrity.event_tab_hidden",
  tab_visible: "integrity.event_tab_visible",
  window_blur: "integrity.event_window_blur",
  window_resized: "integrity.event_window_resized",
};

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function formatTimestamp(value, locale) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(locale);
}

function IntegrityEventsSection({ review }) {
  const { t, i18n } = useTranslation("studentDashboard");
  const summary = review?.integrity_summary;
  const events = Array.isArray(review?.integrity_events)
    ? review.integrity_events
    : [];

  if (!summary && events.length === 0) {
    return null;
  }

  return (
    <section
      className="integrity-events-section"
      aria-label={t("integrity.section_title")}
    >
      <h3 className="integrity-events-title">{t("integrity.section_title")}</h3>

      {summary ? (
        <div className="integrity-events-summary">
          <span>{t("integrity.summary_tab_hidden", { count: summary.tab_hidden_count ?? 0 })}</span>
          <span>
            {t("integrity.summary_total_hidden_duration", {
              duration: formatDuration(summary.total_hidden_duration_seconds ?? 0),
            })}
          </span>
          <span>{t("integrity.summary_window_blur", { count: summary.window_blur_count ?? 0 })}</span>
          <span>
            {t("integrity.summary_window_resized", {
              count: summary.window_resized_count ?? 0,
            })}
          </span>
        </div>
      ) : null}

      {events.length > 0 ? (
        <ul className="integrity-events-list">
          {events.map((event) => {
            const clientHiddenDuration = event.metadata?.hidden_duration_seconds;
            const labelKey = EVENT_TYPE_LABELS[event.event_type] ?? event.event_type;

            return (
              <li key={event.event_id || event.id} className="integrity-events-item">
                <div className="integrity-events-item-main">
                  <strong>{t(labelKey)}</strong>
                  <span>{formatTimestamp(event.occurred_at, i18n.language)}</span>
                </div>
                {clientHiddenDuration != null ? (
                  <div className="integrity-events-item-meta">
                    {t("integrity.client_hidden_duration_hint", {
                      duration: formatDuration(clientHiddenDuration),
                    })}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="integrity-events-empty">{t("integrity.no_events")}</p>
      )}
    </section>
  );
}

export default IntegrityEventsSection;
