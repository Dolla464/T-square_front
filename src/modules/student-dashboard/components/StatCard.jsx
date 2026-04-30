import React from "react";

/**
 * كومبوننت كارت الإحصائيات - قابل لإعادة الاستخدام
 * @param {string} icon - أيقونة Bootstrap
 * @param {string} iconBg - لون خلفية الأيقونة
 * @param {string} iconColor - لون الأيقونة
 * @param {number|string} value - القيمة المعروضة
 * @param {string} label - النص التحت
 */
function StatCard({ icon, iconBg, iconColor, value, label }) {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default StatCard;
