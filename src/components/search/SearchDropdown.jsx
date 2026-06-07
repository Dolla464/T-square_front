import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchUserCourses } from "../../api/courses";
import axios from "axios";
import "./SearchDropdown.css";

const STATIC_PAGES = [
  { key: "home", path: "/", icon: "bi-house-door", labelAr: "الرئيسية", labelEn: "Home" },
  { key: "courses", path: "/courses", icon: "bi-journal-bookmark", labelAr: "الكورسات", labelEn: "Courses" },
  { key: "solutions", path: "/solutions", icon: "bi-lightbulb", labelAr: "حلول برمجية", labelEn: "Software Solutions" },
  { key: "team", path: "/team", icon: "bi-people", labelAr: "الفريق", labelEn: "Team" },
  { key: "contact", path: "/contact", icon: "bi-envelope", labelAr: "تواصل معنا", labelEn: "Contact us" },
  { key: "login", path: "/login", icon: "bi-box-arrow-in-right", labelAr: "تسجيل دخول", labelEn: "Login" },
  { key: "signup", path: "/signup", icon: "bi-person-plus", labelAr: "إنشاء حساب", labelEn: "Sign up" },
  { key: "dashboard", path: "/dashboard", icon: "bi-person-badge", labelAr: "لوحة التحكم", labelEn: "Dashboard" },
  { key: "forgot_password", path: "/forgot_password", icon: "bi-lock", labelAr: "نسيت كلمة المرور", labelEn: "Forgot Password" },
  { key: "update_password", path: "/update_password", icon: "bi-key-fill", labelAr: "تحديث كلمة المرور", labelEn: "Update Password" },
  { key: "profile", path: "/profile", icon: "bi-person-vcard", labelAr: "الملف الشخصي", labelEn: "Profile" },
];

function SearchDropdown({ isDarkMode, Tbtn }) {
  const { t, i18n } = useTranslation(["navbar", "common"]);
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const searchInputRef = useRef(null);
  const searchBoxRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Lock/unlock body scroll when overlay opens/closes
  useEffect(() => {
    if (isOverlayOpen) {
      document.body.style.overflow = "hidden";
      // Focus input after overlay opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOverlayOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOverlayOpen) {
        closeOverlay();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOverlayOpen]);

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

        // Filter static pages locally — match against Arabic, English labels, and key
        const normalizedQuery = query.toLowerCase();
        const matchedStatic = STATIC_PAGES.filter(page =>
          page.labelAr.includes(normalizedQuery) ||
          page.labelEn.toLowerCase().includes(normalizedQuery) ||
          page.key.toLowerCase().includes(normalizedQuery)
        );

        setResults([
          ...matchedStatic.map(page => ({
            id: `static-${page.key}`,
            title: isArabic ? page.labelAr : page.labelEn,
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

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  const handleSelect = useCallback((path) => {
    closeOverlay();
    navigate(path);
  }, [navigate, closeOverlay]);

  const handleOverlayClick = useCallback((e) => {
    // Close only if clicking the backdrop itself, not the search box
    if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
      closeOverlay();
    }
  }, [closeOverlay]);

  // The search icon button rendered inside Navbar
  const searchIcon = (
    <button
      className={`search-trigger-btn ${Tbtn}`}
      onClick={() => setIsOverlayOpen(true)}
      aria-label={isArabic ? "بحث" : "Search"}
      title={isArabic ? "بحث" : "Search"}
    >
      <i className="bi bi-search"></i>
    </button>
  );

  // The overlay rendered via portal (outside Navbar DOM)
  const overlay = isOverlayOpen
    ? createPortal(
        <div
          className={`search-overlay ${isOverlayOpen ? "search-overlay--visible" : ""}`}
          onClick={handleOverlayClick}
        >
          <div className="search-overlay-box" ref={searchBoxRef}>
            {/* Close button */}
            <button className="search-overlay-close" onClick={closeOverlay} aria-label="Close">
              <i className="bi bi-x-lg"></i>
            </button>

            {/* Search input */}
            <div className="search-overlay-input-wrapper">
              <i className="bi bi-search search-overlay-search-icon"></i>
              <input
                ref={searchInputRef}
                type="text"
                className="search-overlay-input"
                placeholder={isArabic ? "ابحث عن كورسات، صفحات..." : "Search courses, pages..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query && (
                <button className="search-overlay-clear" onClick={() => setQuery("")}>
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            {/* Results area */}
            {(query.trim() || loading) && (
              <div className="search-overlay-results">
                {loading ? (
                  <div className="search-overlay-loading">
                    <span className="spinner-border spinner-border-sm text-danger" role="status"></span>
                    <span>{isArabic ? "جاري البحث..." : "Searching..."}</span>
                  </div>
                ) : results.length === 0 ? (
                  <div className="search-overlay-empty">
                    <i className="bi bi-emoji-frown"></i>
                    <span>{isArabic ? "لا توجد نتائج مطابقة" : "No matching results"}</span>
                  </div>
                ) : (
                  <div className="search-overlay-results-list">
                    {results.map((item) => (
                      <div
                        key={item.id}
                        className="search-overlay-result-item"
                        onClick={() => handleSelect(item.path)}
                      >
                        <div className="search-overlay-result-icon">
                          <i className={`bi ${item.icon}`}></i>
                        </div>
                        <div className="search-overlay-result-content">
                          <div className="search-overlay-result-title">{item.title}</div>
                          <div className="search-overlay-result-desc">{item.description}</div>
                        </div>
                        <i className="bi bi-arrow-return-left search-overlay-result-arrow"></i>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Keyboard hint */}
            <div className="search-overlay-hint">
              <kbd>ESC</kbd>
              <span>{isArabic ? "للإغلاق" : "to close"}</span>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {searchIcon}
      {overlay}
    </>
  );
}

export default React.memo(SearchDropdown);
