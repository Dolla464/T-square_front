import { useTranslation } from "react-i18next";
import { formatInstructorNames, getCourseInstructors } from "../../../../../utils/courseInstructors";
import { isArabicLocale } from "../../../../../utils/isArabicLocale";

function CourseTable({
  filteredCourses,
  loading,
  showTrash,
  t,
  handleView,
  handleEdit,
  handleDelete,
  handleRestore,
  handleForceDelete,
  handleStatusChange,
}) {
  const { i18n } = useTranslation("adminDashboard");
  const isArabic = isArabicLocale(i18n.language);

  return (
    <div className="table-responsive">
      <table
        className={`table ac-table mb-0 align-middle${showTrash ? " table-secondary" : ""}`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <thead>
          <tr>
            <th>{t("content.table.course")}</th>
            <th>{t("content.table.instructor")}</th>
            <th className="text-center">{t("content.table.revenue")}</th>
            <th className="text-center">{t("content.table.students")}</th>
            <th className="text-center">
              {showTrash
                ? t("courses_page.deleted_on")
                : t("content.table.status")}
            </th>
            <th className="text-center">{t("content.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">{t("courses_page.loading")}</span>
                </div>
              </td>
            </tr>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((item, index) => (
              <tr key={item.id || index}>
                <td className="fw-medium text-dark">
                  {item.name || item.title || t("courses_page.untitled")}
                </td>
                <td className="text-secondary">
                  {formatInstructorNames(getCourseInstructors(item)) || "N/A"}
                </td>
                <td className="text-secondary text-center">
                  {item.total_revenue || item.revenue || "0.00"}
                </td>
                <td className="text-secondary text-center">
                  {item.total_students || "0"}
                </td>

                <td className="text-center">
                  {showTrash ? (
                    <span className="badge bg-secondary px-3 py-2 rounded-pill">
                      <i className="bi bi-trash me-1"></i>
                      {item.deleted_at
                        ? (() => {
                            const d = new Date(item.deleted_at);
                            return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
                          })()
                        : t("courses_page.deleted")}
                    </span>
                  ) : (
                    <span
                      className={`badge rounded-pill cp ${item.status === "published" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                      style={{
                        cursor: "pointer",
                        padding: "8px 16px",
                      }}
                      onClick={() => handleStatusChange(item.id, item.status === "published" ? "draft" : "published")}
                    >
                      <i
                        className={`bi ${item.status === "draft" ? "bi-shield-exclamation" : "bi-patch-check-fill"} me-1`}
                      ></i>
                      {item.status === "draft"
                        ? t("content.status.draft")
                        : t("content.status.published")}
                    </span>
                  )}
                </td>

                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    {showTrash ? (
                      <>
                        <button
                          className="btn btn-sm ac-btn-view border-0"
                          title={t("courses_page.restore")}
                          onClick={() => handleRestore(item.id)}
                        >
                          <i className="bi bi-arrow-counterclockwise fs-6"></i>
                        </button>
                        <button
                          className="btn btn-sm ac-btn-deleteTable border-0"
                          title={t("courses_page.permanent_delete")}
                          onClick={() => handleForceDelete(item.id)}
                        >
                          <i className="bi bi-trash-fill fs-6"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm ac-btn-view border-0"
                          title={t("courses_page.view")}
                          onClick={() => handleView(item)}
                        >
                          <i className="bi bi-eye fs-6"></i>
                        </button>
                        <button
                          className="btn btn-sm ac-btn-edit border-0"
                          title={t("courses_page.edit")}
                          onClick={() => handleEdit(item)}
                        >
                          <i className="bi bi-pencil-square fs-6"></i>
                        </button>
                        <button
                          className="btn btn-sm ac-btn-deleteTable border-0"
                          title={t("courses_page.delete")}
                          onClick={() => handleDelete(item.id)}
                        >
                          <i className="bi bi-trash fs-6"></i>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-muted">
                {t("courses_page.no_data")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CourseTable;
