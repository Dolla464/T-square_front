import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuizzes } from "../../hooks/useQuizzes";
import StatCard from "../../components/StatCard";
import DashboardItemsSection from "../../components/DashboardItemsSection";
import "../../styles/dashboardShared.css";

/**
 * صفحة الاختبارات - DashboardQuizzes
 * إعادة استخدام مكون DashboardItemsSection المشترك
 */
function DashboardQuizzes() {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language == "ar";
  const { user } = useAuth();
  const { quizzes, stats, loading } = useQuizzes();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // فلترة الكويزات حسب الحالة
  const filtered = (quizzes || []).filter((q) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "Pending" && q.status === "pending") ||
      (filter === "completed" && q.status === "completed");
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.courseName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // كروت الإحصائيات
  const STAT_CARDS = [
    {
      icon: "bi-pencil-square",
      iconBg: "#fff0f0",
      iconColor: "#be1522",
      key: "total",
      label: t("quizzes.stats.total"),
    },
    {
      icon: "bi-play-circle",
      iconBg: "#e0f2fe",
      iconColor: "#0ea5e9",
      key: "open",
      label: t("active_courses.filter.Pending"),
    },

    {
      icon: "bi-check2-circle",
      iconBg: "#efffef",
      iconColor: "#22c55e",
      key: "completed",
      label: t("quizzes.stats.completed"),
    },
  ];

  return (
    <div className="dash-quizzes">
      {/* عنوان الصفحة */}
      <h4 className="dash-page-title d-md-none d-block">
        {t("quizzes.page_title", { name: user?.name?.split(" ")[0] || "" })}
      </h4>

      {loading ? (
        <div className="dash-loading">
          <div className="spinner-border text-danger" role="status" />
        </div>
      ) : (
        <>
          {/* تنبيه الحساب غير مفعل */}
          {!user?.email_verified_at && (
            <div className="activation-banner">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>
                {isArabic
                  ? `الحساب غير مفعل - برجاء مراجعة البريد الإلكتروني: ${user?.email}`
                  : `Account not activated - please check your email: ${user?.email}`}
              </span>
            </div>
          )}

          {/* إحصائيات */}
          <div className="stats-grid-quizzes">
            {STAT_CARDS.map(({ key, valueSuffix, ...cardProps }) => (
              <StatCard
                key={key}
                {...cardProps}
                value={`${stats?.[key] ?? 0}${valueSuffix || ""}`}
              />
            ))}
          </div>

          {/* شريط البحث والفلتر */}
          <div className="quizzes-toolbar">
            <div className="search-wrap">
              <i className="bi bi-search search-icon" aria-hidden="true"></i>
              <input
                className="search-input"
                placeholder={isArabic ? "ابحث عن كويز..." : "Search quizzes..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-tabs">
              {[
                { key: "all", icon: "bi-grid-3x3-gap" },
                { key: "Pending", icon: "bi-clock-history" },
                { key: "completed", icon: "bi-check2-circle" },
              ].map(({ key, icon }) => (
                <button
                  key={key}
                  className={`filter-tab ${filter === key ? "filter-tab-active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  <i className={`bi ${icon} me-1`}></i>
                  {t(`active_courses.filter.${key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* مكون مشترك لعرض الكويزات */}
          <DashboardItemsSection
            title={isArabic ? "اختباراتي" : "My Quizzes"}
            items={filtered}
            type="quiz"
            t={t}
            emptyClassName="quizzes-empty"
            emptyIcon="bi-search"
          />
        </>
      )}
    </div>
  );
}

export default DashboardQuizzes;
