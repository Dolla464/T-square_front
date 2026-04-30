import React from "react";
import { useTranslation } from "react-i18next";
import DashboardCard from "./DashboardCard";

/**
 * مكون مشترك لعرض قسم الكورسات أو الكويزات
 *
 * @param {string} title - عنوان القسم
 * @param {array} items - البيانات (مفلترة مسبقاً)
 * @param {string} type - نوع الكارد ("course" | "quiz")
 * @param {function} t - دالة الترجمة
 * @param {string} emptyClassName - كلاس CSS للحالة الفارغة
 * @param {string} emptyIcon - أيقونة Bootstrap للحالة الفارغة
 */
function DashboardItemsSection({
  title,
  items,
  type,
  t,
  emptyClassName = "items-empty",
  emptyIcon = "bi-search",
}) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");

  return (
    <>
      {/* عنوان القسم */}
      <h5 className="section-title">{title}</h5>

      {/* حالة عدم وجود نتائج */}
      {items.length === 0 ? (
        <div className={emptyClassName}>
          <i className={`bi ${emptyIcon} ${emptyClassName}-icon`}></i>
          <p>{isArabic ? "لا توجد نتائج" : "No results found"}</p>
        </div>
      ) : (
        <div className={`${type === "course" ? "courses-grid" : "quizzes-grid"}`}>
          {items.map((item) => (
            <DashboardCard key={item.id} item={item} type={type} t={t} />
          ))}
        </div>
      )}
    </>
  );
}

export default DashboardItemsSection;