import { useState } from "react";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import i18next from "i18next";
import studentImg from "../../../../assets/student-avatar.jpg";

const initialStudents = [
  {
    id: "stu-1",
    name: "Ahmed Awaden",
    email: "ahmed@gmail.com",
    role: "student",
    joinDate: "10-5-2026",
    enrolledCourses: 5,
    phone: "+20 100 123 4567",
    verified: "2026-02-19T08:30:00Z",
    status: "active",
    gender: "male",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "stu-2",
    name: "Ahmed Awaden2",
    email: "ahmed2@gmail.com",
    role: "student",
    joinDate: "10-5-2025",
    enrolledCourses: 1,
    phone: "+20 101 343 4567",
    verified: null,
    status: "active",
    gender: "male",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "stu-3",
    name: "Mohamed Salama",
    email: "salama@gmail.com",
    role: "student",
    joinDate: "30-4-2024",
    enrolledCourses: 10,
    phone: "+20 101 343 4567",
    verified: "2024-05-1T010:30:00Z",
    status: "active",
    gender: "male",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "stu-4",
    name: "Test Student",
    email: "Test.Student@example.com",
    role: "student",
    joinDate: "10-5-2026",
    enrolledCourses: null,
    phone: "+20 101 234 5678",
    verified: null,
    status: "pending",
    gender: "female",
    image: studentImg,
  },
];

const defaultFormData = {
  name: "",
  email: "",
  role: "student",
  password: "",
  phone: "",
  verified: null,
  status: "active",
  enrolledCourses: 0,
  joinDate: "",
  gender: "",
  image: studentImg,
};

function AdminStudents() {
  const [students, setStudents] = useState(initialStudents);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("view");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [selectedGender, setSelectedGender] = useState("all");

  const isArabic = i18next.language === "ar";
  const item = editingItem || viewingItem;

  const filteredStudents = students.filter((student) => {
    const matchesSearch = [student.name, student.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" || student.status === selectedStatus;

    const matchesGender =
      selectedGender === "all" || student.gender === selectedGender;

    return matchesSearch && matchesStatus && matchesGender;
  });

  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setViewingItem(null);
    setEditingItem(student);
    setFormData({
      name: student.name,
      email: student.email,
      role: student.role || "student",
      password: "",
      phone: student.phone || "",
      verified: student.verified || null,
      status: student.status,
      enrolledCourses: student.enrolledCourses ?? 0,
      joinDate: student.joinDate || "",
      gender: student.gender || "",
      image: student.image,
    });
    setShowForm(true);
  };

  const handleView = (student) => {
    setEditingItem(null);
    setViewingItem(student);
    setFormData({
      name: student.name,
      email: student.email,
      role: student.role || "student",
      password: "",
      phone: student.phone || "",
      verified: student.verified || null,
      status: student.status,
      enrolledCourses: student.enrolledCourses ?? 0,
      joinDate: student.joinDate || "",
      gender: student.gender || "",
      image: student.image,
    });
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
    setActiveTab("view");
  };

  const handleDelete = (id) => {
    const student = students.find((item) => item.id === id);
    const confirmDelete = window.confirm(
      `Delete ${student?.name || "this student"}?`,
    );
    if (confirmDelete) {
      setStudents((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitWrapper = (e) => {
    e.preventDefault();
    if (editingItem) {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingItem.id
            ? {
                ...student,
                ...formData,
                role: "student",
              }
            : student,
        ),
      );
    } else {
      setStudents((prev) => [
        {
          id: `stu-${Date.now()}`,
          ...formData,
          role: "student",
          enrolledCourses: 0,
          joinDate: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    handleBack();
  };

  return (
    <div className="admin-content-page">
      {!showForm ? (
        <>
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">Students</h2>
              <p className="ac-subtitle text-muted mb-0">
                manage all students on the platform
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus fw-bolder"></i> Add Student
            </button>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="table-responsive ac-rounded-table">
                <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
                  <div className="ac-search-input-wrapper">
                    <i className="bi bi-search ac-search-icon"></i>
                    <input
                      type="text"
                      className="form-control ac-search-input"
                      placeholder="Search student"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-md-3">
                    <select
                      className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                    >
                      <option value="all">All genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <select
                      className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
                <table className="table ac-table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="text-center">Email</th>
                      <th className="text-center">Enrolled Courses</th>
                      <th className="text-center">Join Date</th>
                      <th className="text-center">Role</th>
                      <th className="text-center">Phone</th>
                      <th className="text-center">Gender</th>
                      <th className="text-center">Verified</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="fw-medium text-dark">
                            {student.name}
                          </td>
                          <td className="text-center text-secondary">
                            {student.email}
                          </td>
                          <td className="text-center text-secondary">
                            {student.enrolledCourses ?? 0}
                          </td>
                          <td className="text-center text-secondary">
                            {student.joinDate
                              ? new Date(student.joinDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="text-center text-secondary text-capitalize">
                            {student.role || "student"}
                          </td>
                          <td className="text-center text-secondary">
                            {student.phone || "-"}
                          </td>
                          <td className="text-center text-secondary text-capitalize">
                            {student.gender || "-"}
                          </td>
                          <td className="text-center text-secondary">
                            {student.verified ? "Yes" : "No"}
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-sm ac-btn-view border-0"
                                title="View"
                                onClick={() => handleView(student)}
                              >
                                <i className="bi bi-eye fs-6"></i>
                              </button>
                              <button
                                className="btn btn-sm ac-btn-edit border-0"
                                title="Edit"
                                onClick={() => handleEdit(student)}
                              >
                                <i className="bi bi-pencil-square fs-6"></i>
                              </button>
                              <button
                                className="btn btn-sm ac-btn-delete border-0"
                                title="Delete"
                                onClick={() => handleDelete(student.id)}
                              >
                                <i className="bi bi-trash fs-6"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-4 text-muted">
                          No students available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="ac-form-container">
          <div className="ac-form-header d-flex justify-content-between align-items-center mb-4">
            <button className="ac-back-btn" onClick={handleBack}>
              <i
                className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
              ></i>
              <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                {viewingItem
                  ? "View Student"
                  : editingItem
                    ? "Edit Student"
                    : "Add New Student"}
              </span>
            </button>
            {!viewingItem && (
              <div className="ac-form-actions d-flex gap-2">
                <button
                  className="btn btn-danger px-4 ac-publish-btn"
                  onClick={handleSubmitWrapper}
                >
                  {editingItem ? "Update Student" : "Create Student"}
                </button>
              </div>
            )}
          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            {activeTab === "view" && (
              <div className="ac-tab-content basic-info">
                {viewingItem && (
                  <div className="mb-4 text-center">
                    <div
                      className="ac-thumbnail-view border rounded-4 overflow-hidden shadow-sm d-inline-block"
                      style={{ maxWidth: "100%", width: "600px" }}
                    >
                      <img
                        src={formData.image}
                        alt={formData.name}
                        className="img-fluid w-100"
                        style={{ height: "300px", objectFit: "cover" }}
                      />
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    Student Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder="Enter student name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder="Enter student email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">Role</label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value="Student"
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!!viewingItem}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Gender</label>
                  <select
                    name="gender"
                    className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!!viewingItem || !!editingItem}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      Enrolled Courses
                    </label>
                    <input
                      type="number"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.enrolledCourses}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      Joined At
                    </label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.joinDate}
                      disabled
                    />
                  </div>
                </div>

                {!viewingItem && (
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Status</label>
                  <select
                    name="status"
                    className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    Verified
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      type="button"
                      className={`btn ${formData.verified ? "btn-success" : "btn-outline-secondary"}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          verified: prev.verified
                            ? null
                            : new Date().toISOString(),
                        }))
                      }
                      disabled={!!viewingItem}
                    >
                      {formData.verified ? "Verified" : "Not Verified"}
                    </button>
                    {formData.verified && (
                      <small className="text-muted">
                        Verified at{" "}
                        {new Date(formData.verified).toLocaleString()}
                      </small>
                    )}
                  </div>
                </div>

                {!viewingItem && (
                  <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                    <button
                      className="btn btn-danger px-5 py-2 fw-medium rounded-3"
                      onClick={handleSubmitWrapper}
                    >
                      {editingItem ? "Update Student" : "Add Student"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStudents;
