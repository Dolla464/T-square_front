import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import "./GroupAttendanceCardsBulk.css";

function GroupAttendanceCardsBulkPrint({
  cards,
  courseTitle,
  groupName,
  isArabic,
  selectedStudentIds,
  printAll,
}) {
  const { t } = useTranslation("adminDashboard");
  const ns = "groups_page.attendance_cards_bulk";

  const printable = cards.filter((row) => {
    if (row.status !== "success" || !row.token) {
      return false;
    }
    if (printAll) {
      return true;
    }
    return selectedStudentIds.has(row.student_id);
  });

  if (printable.length === 0) {
    return null;
  }

  return (
    <div
      id="group-attendance-cards-bulk-print-root"
      className="group-attendance-cards-bulk-print"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {printable.map((row) => (
        <article key={row.student_id} className="group-attendance-card-sheet">
          <p className="text-muted small mb-1">{t(`${ns}.print_label`)}</p>
          <h5 className="fw-bold mb-1">{row.full_name}</h5>
          {row.enrollment_number ? (
            <p className="text-secondary mb-2">
              {t("groups_page.student")}: {row.enrollment_number}
            </p>
          ) : null}
          {courseTitle ? (
            <p className="small mb-1">
              {t(`${ns}.course`)}: {courseTitle}
            </p>
          ) : null}
          {groupName ? (
            <p className="small mb-3">
              {t(`${ns}.group`)}: {groupName}
            </p>
          ) : null}
          <div className="attendance-card-qr-frame d-inline-block p-3 bg-white border rounded-4">
            <QRCodeSVG value={row.token} size={200} level="M" includeMargin />
          </div>
        </article>
      ))}
    </div>
  );
}

export default GroupAttendanceCardsBulkPrint;
