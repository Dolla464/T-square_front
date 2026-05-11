import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import "./AdminContentPage.css";
import { useState } from "react";

function AdminContentTable({  data, loading, onView, onEdit, onDelete }) {
  const { t } = useTranslation("adminDashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      (item.title || item.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" || item.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="ac-table-container">
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <div className="table-responsive ac-rounded-table" dir="ltr">
          <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
            <div className="ac-search-input-wrapper">
              <i className="bi bi-search ac-search-icon"></i>
              <input
                type="text"
                className="form-control ac-search-input"
                placeholder={t("content.search_solutions")}
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <table className="table ac-table mb-0 align-middle">
            <thead>
              <tr>
                <th>{t("content.table.solution")}</th>
                <th>{t("content.table.description")}</th>
                <th className="text-center">{t("content.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="fw-medium text-dark">
                      {item.name || item.title || "Untitled"}
                    </td>

                    <td className="text-secondary ac-truncate-text">
                      {item.description || "N/A"}
                    </td>

                    

                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm ac-btn-view border-0"
                          onClick={() => onView(item)}
                          title="View"
                        >
                          <i className="bi bi-eye fs-6"></i>
                        </button>
                        <button
                          className="btn btn-sm ac-btn-edit border-0"
                          onClick={() => onEdit(item)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square fs-6"></i>
                        </button>
                        <button
                          className="btn btn-sm ac-btn-deleteTable border-0"
                          onClick={() => onDelete(item.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash fs-6"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminContentTable;
