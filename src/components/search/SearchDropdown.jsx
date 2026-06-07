import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchUserCourses } from "../../api/courses";
import axios from "axios";
import "./SearchDropdown.css";

const STATIC_PAGES = [
  { key: "home", path: "/", icon: "bi-house-door" },
  { key: "courses", path: "/courses", icon: "bi-journal-bookmark" },
  { key: "solutions", path: "/solutions", icon: "bi-lightbulb" },
  { key: "team", path: "/team", icon: "bi-people" },
  { key: "contact", path: "/contact", icon: "bi-envelope" },
  { key: "login", path: "/login", icon: "bi-box-arrow-in-right" },
];

function SearchDropdown({ isDarkMode, tbn }) {
  const { t, i18n } = useTranslation(["navbar", "common"]);
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Perform search with debounce and cancellation
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      // Abort previous request if active
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const res = await fetchUserCourses(
          { search: query, per_page: 5 },
          { signal: abortControllerRef.current.signal }
        );

        const apiCourses = res.data.data || [];

        // Filter static pages locally
        const normalizedQuery = query.toLowerCase();
        const matchedStatic = STATIC_PAGES.filter(page =>
          t(`navbar:${page.key}`, { defaultValue: page.key }).toLowerCase().includes(normalizedQuery) ||
          page.key.toLowerCase().includes(normalizedQuery)
        );

        setResults([
          ...matchedStatic.map(page => ({
            id: `static-${page.key}`,
            title: t(`navbar:${page.key}`, { defaultValue: page.key }),
            description: isArabic ? "صفحة بالموقع" : "Website Page",
            path: page.path,
            icon: page.icon,
            isStatic: true
          })),
          ...apiCourses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.short_description || course.description || "",
            path: `/courses/course_details/${course.slug}`,
            icon: "bi-book",
            isStatic: false
          }))
        ]);
      } catch (err) {
        if (axios.isCancel(err)) {
          return;
        }
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, t, isArabic]);

  const handleSelect = useCallback((path) => {
    setQuery("");
    setIsOpen(false);
    navigate(path);
  }, [navigate]);

  return (
    <div className={`search-dropdown-wrapper ${isDarkMode ? "dark-theme " : "light-theme "} ${tbn}`} ref={dropdownRef}>
      <div className="search-input-container">
        <i className="bi bi-search search-icon"></i>
        <input
          type="text"
          className="search-input"
          placeholder={isArabic ? "ابحث عن كورسات..." : "Search courses..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button className="search-clear-btn" onClick={() => setQuery("")}>
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>

      {isOpen && (query.trim() || loading) && (
        <div className="search-results-dropdown shadow-lg">
          {loading ? (
            <div className="search-loading py-3 text-center text-muted">
              <span className="spinner-border spinner-border-sm me-2 text-danger" role="status"></span>
              {isArabic ? "جاري البحث..." : "Searching..."}
            </div>
          ) : results.length === 0 ? (
            <div className="search-no-results py-3 text-center text-muted">
              {isArabic ? "لا توجد نتائج مطابقة" : "No matching results"}
            </div>
          ) : (
            <div className="search-results-list">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="search-result-item d-flex align-items-center gap-3"
                  onClick={() => handleSelect(item.path)}
                >
                  <div className="search-result-icon-box">
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <div className="search-result-content">
                    <div className="search-result-title fw-bold">{item.title}</div>
                    <div className="search-result-desc text-muted text-truncate">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(SearchDropdown);
