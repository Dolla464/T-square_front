import { useTranslation } from "react-i18next";
import "./ComingSoon.css";

/**
 * صفحة "قريباً" — تظهر في كل صفحات الأدمن
 * تستقبل العنوان ديناميكياً من الراوت
 */
function ComingSoon({ pageTitle, icon = "bi-tools" }) {
  const { t } = useTranslation("adminDashboard");

  return (
    <div className="coming-soon-page">
      <h4 className="coming-soon-page-title">{pageTitle}</h4>
      <div className="coming-soon-card">
        <div className="coming-soon-icon-wrap">
          <i className={`bi ${icon}`}></i>
        </div>
        <h5 className="coming-soon-title">{t("coming_soon.title")}</h5>
        <p className="coming-soon-subtitle">{t("coming_soon.subtitle")}</p>
      </div>
    </div>
  );
}

export default ComingSoon;
