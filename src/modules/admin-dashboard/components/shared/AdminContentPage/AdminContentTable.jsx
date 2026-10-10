import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import "./AdminContentPage.css";
import { useState, useMemo } from "react";
import React from "react";
import { isArabicLocale } from "../../../../../utils/isArabicLocale";

const AdminContentTableRow = React.memo(({ item, onView, onEdit, onDelete, t }) => {
  return (
    <tr>
      <td className="fw-medium text-dark">
        {item.name || item.title || t("content.untitled")}
      </td>
      <td className="text-secondary ac-truncate-text">
        {item.description || t("content.not_available")}
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm ac-btn-view border-0"
            onClick={() => onView(item)}
            title={t("courses_page.view")}
          >
            <i className="bi bi-eye fs-6"></i>
          </button>
          <button
            className="btn btn-sm ac-btn-edit border-0"
            onClick={() => onEdit(item)}
            title={t("courses_page.edit")}
          >
            <i className="bi bi-pencil-square fs-6"></i>
          </button>
          <button
            className="btn btn-sm ac-btn-deleteTable border-0"
            onClick={() => onDelete(item.id)}
            title={t("courses_page.delete")}
          >
            <i className="bi bi-trash fs-6"></i>
          </button>
        </div>
      </td>
    </tr>
  );
});

function AdminContentTable({ data, loading, onView, onEdit, onDelete }) {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = isArabicLocale(i18n.language);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      const matchesSearch =
        (item.title || item.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter =
        selectedFilter === "all" || item.status === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, selectedFilter]);

  return (
   
        <div className="ac-rounded-table p-3 p-md-0" dir={isArabic ? "rtl" : "ltr"}>

          <div className="ac-filters-bar d-flex align-items-center mb-3">
            <div className="ac-search-input-wrapper position-relative">
              <i
                className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${searchTerm ? "text-danger fw-bold" : "text-muted"}`}
                style={{ zIndex: 3 }}
              ></i>
              <input
                type="text"
                className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${searchTerm ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium" : "border-light bg-light text-muted"}`}
                placeholder={t("content.search_solutions")}
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table ac-table mb-0 align-middle" dir={isArabic ? "rtl" : "ltr"}>
              <thead>
                <tr>
                  <th>{t("content.table.solution")}</th>
                  <th>{t("content.table.description")}</th>
                  <th className="text-center">{t("content.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-5">
                      <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">{t("categories_page.loading")}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData && filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <AdminContentTableRow
                      key={item.id || index}
                      item={item}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      t={t}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">
                      {t("content.no_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      
    
  );
}

export default React.memo(AdminContentTable);
