import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع المجموعات الدراسية مع الفلاتر و pagination
// ----------------------------------------------------------------------------
export const getLearningGroups = (params) =>
  axiosClient.get("/admin/learning-groups", { params }).then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب المجموعات الدراسية للقوائم المنسدلة (بدون pagination)
// ----------------------------------------------------------------------------
export const getLearningGroupsSelection = () =>
  axiosClient.get("/admin/learning-groups/selection").then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب مجموعة دراسية معينة بالـ ID
// ----------------------------------------------------------------------------
export const getLearningGroupById = (id) =>
  axiosClient.get(`/admin/learning-groups/${id}`).then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب الطلاب المتاحين (غير المسجلين) لمجموعة دراسية معينة
// ----------------------------------------------------------------------------
export const getAvailableStudents = (id) =>
  axiosClient.get(`/admin/learning-groups/${id}/unassigned-students`).then((res) => res.data);

// ----------------------------------------------------------------------------
// إنشاء مجموعة دراسية جديدة
// ----------------------------------------------------------------------------
export const createLearningGroup = (payload) =>
  axiosClient
    .post("/admin/learning-groups", payload)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// تحديث بيانات مجموعة دراسية
// ----------------------------------------------------------------------------
export const updateLearningGroup = (id, payload) =>
  axiosClient
    .put(`/admin/learning-groups/${id}`, payload)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// حذف مجموعة دراسية
// ----------------------------------------------------------------------------
export const deleteLearningGroup = (id) =>
  axiosClient
    .delete(`/admin/learning-groups/${id}`)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// إضافة مجموعة من الطلاب إلى مجموعة دراسية
// ----------------------------------------------------------------------------
export const bulkAssignStudents = (id, payload) =>
  axiosClient
    .post(`/admin/learning-groups/${id}/bulk-assign`, payload)
    .then((res) => res.data);
