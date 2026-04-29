import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import "./AdminContentPage.css";

function AdminContentTable({ type, data, loading, onView, onEdit, onDelete }) {
  const { t } = useTranslation("adminDashboard");

  // تعليق: إعداد أعمدة الجدول بناءً على التصنيف (Type)
  const isCourse = type === "course";
  const isSolution = type === "solution";
  return (
    <div className="ac-table-container">
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <div className="table-responsive ac-rounded-table">
          <table className="table ac-table mb-0 align-middle">
            <thead>
              <tr>
                <th>
                  {isCourse
                    ? t("content.table.course")
                    : t("content.table.solution")}
                </th>
                {isCourse && <th>{t("content.table.instructor")}</th>}
                {isSolution && <th>{t("content.table.description")}</th>}
                {isCourse && <th>{t("content.table.revenue")}</th>}
                {isCourse && (
                  <th className="text-center">{t("content.table.students")}</th>
                )}
                <th>{t("content.table.tags")}</th>
                <th className="text-center">{t("content.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="fw-medium text-dark">
                      {item.name || item.title || "Untitled"}
                    </td>
                    {isCourse && (
                      <td className="text-secondary">
                        {item.instructor?.name || "N/A"}
                      </td>
                    )}

                    {isSolution && (
                      <td className="text-secondary ac-truncate-text">
                        {item.description || "N/A"}
                      </td>
                    )}

                    {isCourse && (
                      <td className="text-secondary">
                        {item.revenue || "0.00 EGY"}
                      </td>
                    )}
                    {isCourse && (
                      <td className="text-secondary  text-center">
                        {item.students_count || 0}
                      </td>
                    )}

                    <td>
                      <div className="d-flex gap-1 flex-wrap justify-content-start">
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.map((tag) => (
                            <span
                              key={tag.tag_id || tag.id || tag}
                              className="badge bg-light text-dark border"
                            >
                              {tag.tag_name || tag.name || tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">N/A</span>
                        )}
                      </div>
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
                          className="btn btn-sm ac-btn-delete border-0"
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
                  <td
                    colSpan={isCourse ? 6 : 5}
                    className="text-center py-4 text-muted"
                  >
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
