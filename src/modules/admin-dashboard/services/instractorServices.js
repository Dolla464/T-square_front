import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب كل الـ instructors + pagination
// ----------------------------------------------------------------------------
export const getInstructors = async (params = {}) => {
  const response = await axiosClient.get("/admin/instructors", { params });
  return response.data;
};

// ----------------------------------------------------------------------------
// جلب instructor واحد
// ----------------------------------------------------------------------------
export const getInstructorById = async (id) => {
  const response = await axiosClient.get(`/admin/instructors/${id}`);
  return response.data;
};

// ----------------------------------------------------------------------------
// إنشاء instructor
// ----------------------------------------------------------------------------
export const createInstructor = async (data) => {
  const response = await axiosClient.post("/admin/users", data);
  return response.data;
};

// ----------------------------------------------------------------------------
// تحديث instructor
// ----------------------------------------------------------------------------
export const updateInstructor = async (id, data) => {
  const response = await axiosClient.post(`/admin/instructors/${id}`, data);
  return response.data;
};

// ----------------------------------------------------------------------------
// حذف instructor
// ----------------------------------------------------------------------------
export const deleteInstructor = async (id) => {
  const response = await axiosClient.delete(`/admin/instructors/${id}`);
  return response.data;
};
