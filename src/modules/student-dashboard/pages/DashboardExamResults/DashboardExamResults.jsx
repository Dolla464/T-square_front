import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../contexts/AuthContext";
import { useQuizzes } from "../../hooks/useQuizzes";
import StatCard from "../../components/StatCard";
import QuizResultCard from "../../components/QuizResultCard";
import {
  computeExamResultsStats,
  filterExamResults,
  filterExamResultsByStatus,
  matchesExamResultsSearch,
} from "../../utils/filterExamResults";
import "../../styles/dashboardShared.css";
import "./DashboardExamResults.css";

function DashboardExamResults() {
  const { t } = useTranslation("studentDashboard");
  const { user } = useAuth();
  const { quizzes, loading } = useQuizzes();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const examResults = useMemo(() => filterExamResults(quizzes), [quizzes]);
  const stats = useMemo(() => computeExamResultsStats(quizzes), [quizzes]);

  const filteredResults = useMemo(() => {
    return filterExamResultsByStatus(examResults, filter).filter((quiz) =>
      matchesExamResultsSearch(quiz, search),
    );
  }, [examResults, filter, search]);

  const statCards = useMemo(
    () => [
      {
        key: "total",
        icon: "bi-bar-chart-line",
        iconBg: "#fff0f0",
        iconColor: "#be1522",
        label: t("exam_results.stats.total"),
      },
      {
        key: "passed",
        icon: "bi-check2-circle",
        iconBg: "#efffef",
        iconColor: "#22c55e",
        label: t("exam_results.stats.passed"),
      },
      {
        key: "failed",
        icon: "bi-x-circle",
        iconBg: "#fee2e2",
        iconColor: "#ef4444",
        label: t("exam_results.stats.failed"),
      },
    ],
    [t],
  );

  return (
    <div className="dash-quizzes dash-exam-results">
      <h4 className="dash-page-title d-md-none d-block">
        {t("exam_results.page_title", { name: user?.name?.split(" ")[0] || "" })}
      </h4>

      {loading ? (
        <div className="dash-loading">
          <div className="spinner-border text-danger" role="status" />
        </div>
      ) : examResults.length === 0 ? (
        <div className="exam-results-empty">
          <i className="bi bi-bar-chart-line exam-results-empty-icon" />
          <p className="mb-3">{t("exam_results.empty")}</p>
          <Link to="/student/quizzes" className="btn btn-danger">
            {t("exam_results.empty_cta")}
          </Link>
        </div>
      ) : (
        <>
          <div className="stats-grid-quizzes">
            {statCards.map(({ key, ...cardProps }) => (
              <StatCard key={key} {...cardProps} value={String(stats[key] ?? 0)} />
            ))}
          </div>

          <div className="quizzes-toolbar">
            <div className="search-wrap">
              <i className="bi bi-search search-icon" aria-hidden="true" />
              <input
                className="search-input"
                placeholder={t("exam_results.search_placeholder")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="filter-tabs">
              {[
                { key: "all", icon: "bi-grid-3x3-gap" },
                { key: "passed", icon: "bi-check2-circle" },
                { key: "failed", icon: "bi-x-circle" },
              ].map(({ key, icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`filter-tab ${filter === key ? "filter-tab-active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  <i className={`bi ${icon} me-1`} />
                  {t(`exam_results.filters.${key}`)}
                </button>
              ))}
            </div>
          </div>

          <h5 className="section-title">{t("exam_results.section_title")}</h5>

          {filteredResults.length === 0 ? (
            <div className="quizzes-empty">
              <i className="bi bi-search quizzes-empty-icon" />
              <p>{t("exam_results.no_matches")}</p>
            </div>
          ) : (
            <div className="quizzes-grid">
              {filteredResults.map((quiz) => (
                <QuizResultCard key={quiz.id} quiz={quiz} t={t} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardExamResults;
