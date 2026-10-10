import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useContactInfo } from "../../../../hooks/useDiscovery";
import { openExternalUrl } from "../../../../utils/openExternalUrl";

function PendingEnrollmentBanner({ courseTitle, whatsappLink }) {
  const { t } = useTranslation("studentDashboard");
  const { whatsapp } = useContactInfo();

  const resolvedWhatsAppUrl = useMemo(() => {
    if (typeof whatsappLink === "string" && whatsappLink.trim() !== "") {
      return whatsappLink;
    }

    const number = String(whatsapp || "").replace(/[^\d]/g, "");
    if (!number) {
      return null;
    }

    const message = courseTitle
      ? `أهلاً، أود متابعة اشتراكي في كورس '${courseTitle}'.`
      : "أهلاً، أود متابعة اشتراكي في الكورس.";

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }, [whatsappLink, whatsapp, courseTitle]);

  const handleWhatsAppClick = () => {
    if (resolvedWhatsAppUrl) {
      openExternalUrl(resolvedWhatsAppUrl);
    }
  };

  return (
    <section className="cd-pending-banner" aria-live="polite">
      <div className="cd-pending-banner-icon">
        <i className="bi bi-hourglass-split" aria-hidden="true"></i>
      </div>
      <div className="cd-pending-banner-content">
        <h2 className="cd-pending-banner-title">{t("course_pending.banner_title")}</h2>
        <p className="cd-pending-banner-message">{t("course_pending.banner_message")}</p>
        {resolvedWhatsAppUrl && (
          <button
            type="button"
            className="cd-pending-whatsapp-btn"
            onClick={handleWhatsAppClick}
          >
            <i className="bi bi-whatsapp" aria-hidden="true"></i>
            {t("course_pending.whatsapp_button")}
          </button>
        )}
      </div>
    </section>
  );
}

export default PendingEnrollmentBanner;
