import AdminPagination from "../../../components/shared/AdminPagination";

function CourseTable({
  filteredCourses,
  loading,
  showTrash,
  isArabic,
  t,
  handleView,
  handleEdit,
  handleDelete,
  handleRestore,
  handleForceDelete,
  handleStatusChange,
  apiPagination,
  handlePageChange,
}) {
  return (
    <>
      <div className="table-responsive">
        <table
          className={`table ac-table mb-0 align-middle${showTrash ? " table-secondary" : ""}`}
        >
        <thead>
          <tr>
            <th>{t("content.table.course")}</th>
            <th>{t("content.table.instructor")}</th>
            <th className="text-center">{t("content.table.revenue")}</th>
            <th className="text-center">{t("content.table.students")}</th>
            <th className="text-center">
              {showTrash
                ? isArabic
                  ? "تاريخ الحذف"
                  : "Deleted On"
                : isArabic
                  ? "الحالة"
                  : "Status"}
            </th>
            <th className="text-center">{t("content.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((item, index) => (
              <tr key={item.id || index}>
                <td className="fw-medium text-dark">
                  {item.name || item.title || "Untitled"}
                </td>
                <td className="text-secondary">
                  {item.instructor?.full_name || item.instructor?.name || "N/A"}
                </td>
                <td className="text-secondary text-center">
                  {item.total_revenue || item.revenue || "0.00"}
                </td>
                <td className="text-secondary text-center">
                  {item.total_students || "0"}
                </td>

                {/* Status column */}
                <td className="text-center">
                  {showTrash ? (
                    <span className="badge bg-secondary px-3 py-2 rounded-pill">
                      <i className="bi bi-trash me-1"></i>
                      {item.deleted_at
                        ? (() => {
                          const d = new Date(item.deleted_at);
                          return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
                        })()
                        : isArabic
                          ? "محذوف"
                          : "Deleted"}
                    </span>
                  ) : (
                    // <select
                    //   className={`px-3 status-select ${
                    //     item.status === "published"
                    //       ? "bg-success-subtle text-success border-success"
                    //       : "bg-danger-subtle text-danger border-danger"
                    //   }`}
                    //   value={item.status}
                    //   onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    // >
                    //   <option value="published">
                    //     &#x2B9B; {isArabic ? "منشور" : "Published"}
                    //   </option>
                    //   <option value="draft">
                    //     &#x2B9B; {isArabic ? "مسودة" : "Draft"}
                    //   </option>
                    // </select>
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
                      {item.status == "draft"
                        ? isArabic ? "مسودة" : "Draft"
                        : isArabic ? "منشور" : "Published"}
                    </span>
                  )}
                </td>

                {/* Actions column */}
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    {showTrash ? (
                      <>
                        <button
                          className="btn btn-sm ac-btn-view border-0"
                          title={isArabic ? "استعادة" : "Restore"}
                          onClick={() => handleRestore(item.id)}
                        >
                          <i className="bi bi-arrow-counterclockwise fs-6"></i>
                        </button>
                        <button
                          className="btn btn-sm ac-btn-deleteTable border-0"
                          title={isArabic ? "حذف نهائي" : "Permanent Delete"}
                          onClick={() => handleForceDelete(item.id)}
                        >
                          <i className="bi bi-trash-fill fs-6"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm ac-btn-view border-0"
                          title="View"
                          onClick={() => handleView(item)}
                        >
                          <i className="bi bi-eye fs-6"></i>
                        </button>
                        <button
                          className="btn btn-sm ac-btn-edit border-0"
                          title="Edit"
                          onClick={() => handleEdit(item)}
                        >
                          <i className="bi bi-pencil-square fs-6"></i>
                        </button>
                        <button
                          className="btn btn-sm ac-btn-deleteTable border-0"
                          title="Delete"
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
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      <AdminPagination
        pagination={apiPagination}
        onPageChange={handlePageChange}
      />
    </>
  );
}

export default CourseTable;
