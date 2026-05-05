import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع الكورسات
// ----------------------------------------------------------------------------
export const getCourses = async (params = {}) => {
    const response = await axiosClient.get("/admin/courses", { params });
    return response.data;
};

// ----------------------------------------------------------------------------
// جلب كورس معين بالـ ID
// ----------------------------------------------------------------------------
export const getCourseById = async (id) => {
    const response = await axiosClient.get(`/admin/courses/${id}`);
    return response.data;
};

// ----------------------------------------------------------------------------
// إنشاء كورس جديد
// ----------------------------------------------------------------------------
export const createCourse = async (data) => {
    const response = await axiosClient.post("/admin/courses", data);
    return response.data;
};

// ----------------------------------------------------------------------------
// تحديث البيانات الخاصة بكورس
// ----------------------------------------------------------------------------
export const updateCourse = async (id, data) => {
    const response = await axiosClient.put(`/admin/courses/${id}`, data);
    return response.data;
};

// ----------------------------------------------------------------------------
// حذف كورس
// ----------------------------------------------------------------------------
export const deleteCourse = async (id) => {
    const response = await axiosClient.delete(`/admin/courses/${id}`);
    return response.data;
};