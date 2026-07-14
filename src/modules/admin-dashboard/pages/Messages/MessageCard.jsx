import { useTranslation } from "react-i18next";

function MessageCard({ message, onView, onWhatsapp }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");

  return (
    <div
      className="card mb-3 border-0 shadow-sm rounded-4 p-3 overflow-hidden transition-all align-middle"
      style={{
        backgroundColor: "#ffffff",
        borderLeft: isArabic ? "none" : "4px solid #dc3545",
        borderRight: isArabic ? "4px solid #dc3545" : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
        <div className="d-flex flex-column flex-grow-1">
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-1.5 fw-bold small">
              {message.title || message.subject}
            </span>
          </div>

          <p
            className="text-dark fw-bold mb-0 mt-3"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <i className="bi bi-envelope mx-1"></i>
            {message.content || message.message}
          </p>

          <p className="my-1 small text-secondary">
            <i className="bi bi-person mx-1"></i> {message.name}
          </p>
        </div>

        <div className="d-flex gap-2 align-self-center">
          <button
            className="btn btn-sm ac-btn-view border-0 d-flex align-items-center justify-content-center"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
            }}
            title={isArabic ? "عرض التفاصيل" : "View Details"}
            onClick={() => onView(message.id)}
          >
            <i className="bi bi-eye fs-6"></i>
          </button>

          <button
            className="btn btn-sm ac-btn-whatsapp border-0"
            title="WhatsApp"
            onClick={() =>
              onWhatsapp(
                message.id,
                message.name,
                message.content || message.message,
              )
            }
          >
            <i className="bi bi-whatsapp fs-6"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
