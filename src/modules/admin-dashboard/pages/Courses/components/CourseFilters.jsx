function CourseFilters({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedCategory,
  setSelectedCategory,
  categories,
  showTrash,
  trashPeriod,
  setTrashPeriod,
  isArabic,
  t,
}) {
  return (
    <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
      {/* Search input */}
      <div className="ac-search-input-wrapper">
        <i className="bi bi-search ac-search-icon"></i>
        <input
          type="text"
          className="form-control ac-search-input"
          placeholder={t("content.search_courses")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter dropdowns */}
      <div className="d-flex gap-md-3">
        {showTrash ? (
          /* Trash mode – period filter only */
          <select
            className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
            value={trashPeriod}
            onChange={(e) => setTrashPeriod(e.target.value)}
          >
            <option value="">{isArabic ? "كل الفترات" : "All Time"}</option>
            <option value="today">{isArabic ? "اليوم" : "Today"}</option>
            <option value="last_month">{isArabic ? "الشهر الماضي" : "Last Month"}</option>
            <option value="last_year">{isArabic ? "السنة الماضية" : "Last Year"}</option>
          </select>
        ) : (
          /* Active mode – status + category */
          <>
            <select
              className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${selectedStatus !== "all"
                ? "border-danger bg-danger-subtle text-danger-emphasis"
                : "border-light bg-light text-muted"
                }`} value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              className={`form-select ac-form-select py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${selectedCategory !== "all"
                ? "border-danger bg-danger-subtle text-danger-emphasis"
                : "border-light bg-light text-muted"
                }`} value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">
                {t("courses_page.all_categories", "All Categories")}
              </option>
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.children && cat.children.length > 0 ? (
                    cat.children.map((child) => (
                      <option key={child.id} value={String(child.id)}>
                        {child.name} ({cat.name})
                      </option>
                    ))
                  ) : (
                    <option value={String(cat.id)} disabled>
                      {cat.name} (No subcategories)
                    </option>
                  )}
                </optgroup>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}

export default CourseFilters;
