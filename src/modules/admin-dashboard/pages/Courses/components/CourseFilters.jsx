import { selectClass } from "../../../components/shared/adminUiStyles";

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
  t,
}) {
  return (
    <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
      <div className="ac-search-input-wrapper position-relative ">
        <i
          className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${
            searchTerm ? "text-danger fw-bold" : "text-muted"
          }`}
          style={{ zIndex: 3 }}
        ></i>
        <input
          type="text"
          className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${
            searchTerm
              ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium"
              : "border-light bg-light text-muted"
          }`}
          placeholder={t("content.search_courses")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="d-flex gap-md-3">
        {showTrash ? (
          <select
            className="form-select ac-form-select bg-light border-0 rounded-3 text-muted"
            value={trashPeriod}
            onChange={(e) => setTrashPeriod(e.target.value)}
          >
            <option value="">{t("courses_page.all_periods")}</option>
            <option value="today">{t("courses_page.today")}</option>
            <option value="last_month">{t("courses_page.last_month")}</option>
            <option value="last_year">{t("courses_page.last_year")}</option>
          </select>
        ) : (
          <>
            <select
              className={selectClass(selectedStatus !== "all")}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">{t("courses_page.all_statuses")}</option>
              <option value="published">{t("content.status.published")}</option>
              <option value="draft">{t("content.status.draft")}</option>
            </select>
            <select
              className={selectClass(selectedCategory !== "all")}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t("courses_page.all_categories")}</option>
              {categories.map(
                (cat) =>
                  cat.children &&
                  cat.children.map((child) => (
                    <option key={child.id} value={String(child.id)}>
                      {child.name} ({cat.name})
                    </option>
                  )),
              )}
            </select>
          </>
        )}
      </div>
    </div>
  );
}

export default CourseFilters;
