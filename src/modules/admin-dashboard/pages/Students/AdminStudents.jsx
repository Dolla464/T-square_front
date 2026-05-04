import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "react-bootstrap";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastSuccess } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
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
    joinDate: "3-4-2024",
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

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  // const item = editingItem || viewingItem;

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


  // الواتساببب 
  const handleWhatsapp = (id) => {
    // 1. هات الطالب من الليست
    const student = students.find((s) => s.id === id);
    if (!student) return;

    // 2. ظبط رقم الموبايل (مصر)
    let phone = student.phone || "";
    phone = phone.replace(/\D/g, ""); // شيل أي حروف
    if (phone.startsWith("0")) {
      phone = "20" + phone.slice(1);
    }

    // 3. ابني الرسالة
    const message = `
 شكرا لانضمامك معانا 
 اسم الطالب: ${student.name || "-"}
 رقم الهاتف: ${student.phone || "-"}
 البريد الإلكتروني: ${student.email || "-"}
 كلمة المرور: ${student.password || "-"}

 ملحوظة:
يُرجى تسجيل الدخول وتغيير كلمة المرور من داخل المنصة حفاظًا على أمان حسابك.
`;

    // 4. encode + open
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };




  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const pagination = {
    currentPage,
    lastPage: totalPages,
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedGender]);

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

  const handleDelete = async (id) => {
    const student = students.find((item) => item.id === id);
    const ok = await showDeleteConfirm(student?.name || "");
    if (ok) {
      setStudents((prev) => prev.filter((item) => item.id !== id));
      toastSuccess(t("students_page.deleted_success"));
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
      toastSuccess(t("students_page.updated_success"));
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

      toastSuccess(isArabic ? "تم إضافة الطالب بنجاح" : "Student added successfully");
    }
    handleBack();
  };

  return (
    <div className="admin-content-page">
      {!showForm ? (
        <>
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">{t("students_page.title")}</h2>
              <p className="ac-subtitle text-muted mb-0">
                {t("students_page.subtitle")}
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              + {t("students_page.add_student")}
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
                      placeholder={t("students_page.search_placeholder")}
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
                      <option value="all">
                        {t("students_page.all_genders")}
                      </option>
                      <option value="male">
                        {t("students_page.male_option")}
                      </option>
                      <option value="female">
                        {t("students_page.female_option")}
                      </option>
                    </select>
                    <select
                      className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">
                        {t("students_page.all_statuses")}
                      </option>
                      <option value="active">
                        {t("students_page.active_status")}
                      </option>
                      <option value="pending">
                        {t("students_page.pending_status")}
                      </option>
                    </select>
                  </div>
                </div>
                <table className="table ac-table mb-0 align-middle" dir="ltr">
                  <thead>
                    <tr>
                      <th>{t("students_page.table_name")}</th>
                      <th className="">
                        {t("students_page.table_email")}
                      </th>
                      <th className="">
                        {t("students_page.table_enrolled_courses")}
                      </th>
                      <th className="">
                        {t("students_page.table_join_date")}
                      </th>
                      <th className="">
                        {t("students_page.table_role")}
                      </th>
                      <th className="">
                        {t("students_page.table_phone")}
                      </th>
                      <th className="">
                        {t("students_page.table_gender")}
                      </th>
                      <th className="">
                        {t("students_page.table_verified")}
                      </th>
                      <th className="text-center">
                        {t("students_page.table_actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.length > 0 ? (
                      currentStudents.map((student) => (
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
                            {student.verified
                              ? t("students_page.verified_yes")
                              : t("students_page.verified_no")}
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
                                className="btn btn-sm ac-btn-deleteTable border-0"
                                title="Delete"
                                onClick={() => handleDelete(student.id)}
                              >
                                <i className="bi bi-trash fs-6"></i>
                              </button>
                              <button
                                className="btn btn-sm ac-btn-whatsapp border-0"
                                title="WhatsApp"
                                onClick={() => handleWhatsapp(student.id)}
                              >
                                <i className="bi bi-whatsapp fs-6"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-4 text-muted">
                          {t("students_page.no_students")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="custom-pagination">
                  <Pagination.Prev
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  />
                  {[...Array(pagination.lastPage)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === pagination.currentPage}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={pagination.currentPage === pagination.lastPage}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  />
                </Pagination>
              </div>
            )}
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
                  ? t("students_page.view_student")
                  : editingItem
                    ? t("students_page.edit_student")
                    : t("students_page.add_student_title")}
              </span>
            </button>
            {!viewingItem && (
              <div className="ac-form-actions d-flex gap-2">
                <button
                  className="btn btn-danger px-4 ac-publish-btn"
                  onClick={handleSubmitWrapper}
                >
                  {editingItem
                    ? t("students_page.update_student")
                    : t("students_page.create_student")}
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
                    {t("students_page.name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("students_page.name_placeholder")}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("students_page.email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={t("students_page.email_placeholder")}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  />
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      {t("students_page.role")}
                    </label>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={t("students_page.role_value")}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      {t("students_page.phone")}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder={t("students_page.phone_placeholder")}
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!!viewingItem}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("students_page.gender")}
                  </label>
                  <select
                    name="gender"
                    className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!!viewingItem || !!editingItem}
                  >
                    <option value="">{t("students_page.select_gender")}</option>
                    <option value="male">
                      {t("students_page.male_option")}
                    </option>
                    <option value="female">
                      {t("students_page.female_option")}
                    </option>
                  </select>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      {t("students_page.enrolled_courses")}
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
                      {t("students_page.joined_at")}
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
                      {t("students_page.password")}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      placeholder={t("students_page.password_placeholder")}
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
                    <option value="active">
                      {t("students_page.active_status")}
                    </option>
                    <option value="pending">
                      {t("students_page.pending_status")}
                    </option>
                    <option value="inactive">
                      {t("students_page.inactive_status")}
                    </option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("students_page.verified")}
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
                      {formData.verified
                        ? t("students_page.verified_yes")
                        : t("students_page.verified_no")}
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
                      {editingItem
                        ? t("students_page.update_student")
                        : t("students_page.add_student")}
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
