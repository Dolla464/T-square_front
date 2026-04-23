import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../contexts/AuthContext";
import { useDashboard } from "../../hooks/useDashboard";
import "./DashboardHome.css";
import { Link } from "react-router-dom";

// ── كارت الإحصائية ──
function StatCard({ icon, iconBg, iconColor, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

// ── كارت الكورس ──
function CourseCard({ course, t }) {
  const isCompleted = course.status === "completed";
  return (
    <div className="course-card">
      <div className="course-card-img-wrapper">
        <img src={course.image} alt={course.title} className="course-card-img" />
        <span className={`course-badge ${isCompleted ? "badge-completed" : "badge-progress"}`}>
          {isCompleted
            ? t("active_courses.filter.completed")
            : t("active_courses.filter.in_progress")}
        </span>
      </div>
      <div className="course-card-body">
        <h6 className="course-card-title">{course.title}</h6>
        <p className="course-card-meta">
          <span>{course.instructor}</span>
          <span className="meta-dot"> · </span>
          <span>{course.category}</span>
        </p>
        {/* Progress مبني على عدد الكويزات */}
        <div className="course-progress-row">
          <div className="course-progress-bar-wrap">
            <div className="course-progress-bar" style={{ width: `${course.progress}%` }} />
          </div>
          <span className="course-progress-pct">{course.progress}%</span>
        </div>
        <div className="course-quiz-meta">
          <i className="bi bi-pencil-square me-1"></i>
          {course.quizzesCompleted}/{course.totalQuizzes} quizzes
        </div>

        {isCompleted
          ? <Link to='/student/certificates' className="btn-continue text-decoration-none"><><i className="bi bi-eye me-1"></i>{t("active_courses.review")}</></Link>
          : <Link to='/student/quizzes' className="btn-continue text-decoration-none"><><i className="bi bi-play-fill me-1"></i>{t("active_courses.continue")}</></Link>
        }

      </div>
    </div>
  );
}

function DashboardHome() {
  const { t, i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const { user } = useAuth();
  const { stats, enrolledCourses, continueLearning, loading } = useDashboard();
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
    { icon: "bi-journals", iconBg: "#fff0f0", iconColor: "#be1522", key: "allCourses", label: t("stats.all_courses") },
    { icon: "bi-clock-history", iconBg: "#eef3ff", iconColor: "#4a6cf7", key: "inProgress", label: t("stats.in_progress") },
    { icon: "bi-check2-circle", iconBg: "#efffef", iconColor: "#22c55e", key: "completedCourses", label: t("stats.completed_courses") },
    { icon: "bi-bag-check", iconBg: "#fffbee", iconColor: "#f59e0b", key: "purchasedCourses", label: t("stats.purchased_courses") },
  ];

  return (
    <div className="dash-home">
      {/* عنوان الصفحة */}
      <h4 className="dash-page-title">
        {t("welcome", { name: user?.name?.split(" ")[0] || "Student" })}
      </h4>

      {loading ? (
        <div className="dash-loading">
          <div className="spinner-border text-danger" role="status" />
        </div>
      ) : (
        <>
          {/* ── تنبيه الحساب غير مفعل ── */}
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

          {/* ── إحصائيات ── */}
          <div className="stats-grid">
            {STAT_CARDS.map(({ key, ...cardProps }) => (
              <StatCard key={key} {...cardProps} value={stats?.[key] ?? 0} />
            ))}
          </div>

          {/* ── بانر متابعة التعلم ── */}
          {continueLearning && (
            <div className="continue-banner">
              {/* الصورة المصغرة */}
              <img
                src={enrolledCourses?.[0]?.image}
                alt=""
                className="continue-thumb"
              />

              {/* محتوى الكورس */}
              <div className="continue-info">
                <span className="continue-tag">{t("continue_learning.title")}</span>
                <h5 className="continue-title">{continueLearning.title}</h5>
                <p className="continue-sub">{continueLearning.lessonInfo}</p>
                <div className="continue-progress-row">
                  <div className="continue-progress-wrap">
                    <div
                      className="continue-progress-bar"
                      style={{ width: `${continueLearning.progress}%` }}
                    />
                  </div>
                  <span className="continue-pct">
                    {t("continue_learning.complete", { percentage: continueLearning.progress })}
                  </span>
                </div>
              </div>



              {/* زر المتابعة */}
              <button className="btn-continue-main" dir="rtl">
                {isArabic ? (
                  <>
                    {t("continue_learning.button")}
                    <i className="bi bi-play-fill me-1"></i>
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-fill me-1"></i>
                    {t("continue_learning.button")}
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── شريط البحث والفلتر ── */}
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

          {/* ── كورساتي النشطة ── */}
          <h5 className="section-title">{t("active_courses.title")}</h5>

          {filtered.length === 0 ? (
            <div className="courses-empty">
              <i className="bi bi-search courses-empty-icon"></i>
              <p>{isArabic ? "لا توجد نتائج" : "No courses found"}</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} t={t} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardHome;
