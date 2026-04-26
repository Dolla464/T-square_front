import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../contexts/AuthContext";
import { useDashboard } from "../../hooks/useDashboard";
import StatCard from "../../components/StatCard";
import DashboardItemsSection from "../../components/DashboardItemsSection";
import { Link } from "react-router-dom";
import "../../styles/dashboardShared.css";

function DashboardHome() {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const { user } = useAuth();
  const { stats, enrolledCourses, loading } = useDashboard();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // فلترة الكورسات
  const filtered = (enrolledCourses || []).filter((c) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "in_progress" && c.status === "in_progress") ||
      (filter === "completed" && c.status === "completed");
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const STAT_CARDS = [
    {
      icon: "bi-journals",
      iconBg: "#fff0f0",
      iconColor: "#be1522",
      key: "allCourses",
      label: t("stats.all_courses"),
    },
    {
      icon: "bi-clock-history",
      iconBg: "#eef3ff",
      iconColor: "#4a6cf7",
      key: "inProgress",
      label: t("stats.in_progress"),
    },
    {
      icon: "bi-check2-circle",
      iconBg: "#efffef",
      iconColor: "#22c55e",
      key: "completedCourses",
      label: t("stats.completed_courses"),
    },
    {
      icon: "bi-bag-check",
      iconBg: "#fffbee",
      iconColor: "#f59e0b",
      key: "purchasedCourses",
      label: t("stats.purchased_courses"),
    },
  ];

  return (
    <div className="dash-home">
      {/* عنوان الصفحة */}
      <h4 className="dash-page-title d-md-none d-block">
        {t("welcome", { name: user?.name?.split(" ")[0] || "Student" })}
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
          <div className="stats-grid">
            {STAT_CARDS.map(({ key, ...cardProps }) => (
              <StatCard key={key} {...cardProps} value={stats?.[key] ?? 0} />
            ))}
          </div>

          {/* شريط البحث والفلتر */}
          <div className="courses-toolbar">
            <div className="search-wrap">
              <i className="bi bi-search search-icon" aria-hidden="true"></i>
              <input
                className="search-input"
                placeholder={isArabic ? "ابحث عن كورس..." : "Search courses..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-tabs">
              {[
                { key: "all", icon: "bi-grid-3x3-gap" },
                { key: "in_progress", icon: "bi-clock-history" },
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

          {/* مكون مشترك لعرض الكورسات */}
          <DashboardItemsSection
            title={t("active_courses.title")}
            items={filtered}
            type="course"
            t={t}
            emptyClassName="courses-empty"
            emptyIcon="bi-search"
          />
        </>
      )}
    </div>
  );
}

export default DashboardHome;