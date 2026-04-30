//import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
function AdminStudents() {
  //const { t } = useTranslation("adminDashboard");

  return (
    <div className="admin-content-page">
      {/* Header */}
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">Student</h2>
          <p className="ac-subtitle text-muted mb-0">
            manage all student on the platform
          </p>
        </div>
        <button className="btn btn-danger ac-add-btn">
          <i className="bi bi-plus-lg me-1"></i> Add Student
        </button>
      </div>

      <div className="table-responsive ac-rounded-table">
        <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
          <div className="ac-search-input-wrapper">
            <i className="bi bi-search ac-search-icon"></i>
            <input
              type="text"
              className="form-control ac-search-input"
              placeholder="Search student"
            />
          </div>
        </div>
        <table className="table ac-table mb-0 align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th className="text-center">Email</th>
              <th className="text-center">Enrolled Courses</th>
              <th className="text-center">Join Date</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i}>
                <td className="align-content-center">ahmed awaden</td>
                <td className="text-center align-content-center">
                  ahmed@gmail.com
                </td>
                <td className="text-center align-content-center">3</td>
                <td className="text-center align-content-center">2026-02-19</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm ac-btn-view border-0"
                      title="View"
                    >
                      <i className="bi bi-eye fs-6"></i>
                    </button>
                    <button
                      className="btn btn-sm ac-btn-edit border-0"
                      title="Edit"
                    >
                      <i className="bi bi-pencil-square fs-6"></i>
                    </button>
                    <button
                      className="btn btn-sm ac-btn-delete border-0"
                      title="Delete"
                    >
                      <i className="bi bi-trash fs-6"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminStudents;