import axiosClient from "../../../api/axios";

/**
 * جلب قائمة الطلاب مع دعم الفلترة والبحث والصفحات
 */
export const getStudents = async (params = {}) => {
    const response = await axiosClient.get("/admin/students", { params });
    return response.data;
};

/**
 * جلب بيانات طالب معين بالـ ID
 */
export const getStudentById = async (id) => {
    const response = await axiosClient.get(`/admin/students/${id}`);
    return response.data;
};

/**
 * تسجيل طالب جديد
 */
export const registerStudents = async (data) => {
    // ملاحظة: قد تحتاج لاستخدام FormData إذا كان هناك رفع صور
    const response = await axiosClient.post("/admin/users", data);
    return response.data;
};

/**
 * تحديث بيانات طالب
 */
export const updateStudent = async (id, data) => {
    const res = await axiosClient.post(`/admin/students/${id}`, data);
    return res.data;
};

/**
 * حذف طالب
 */
export const deleteStudent = async (id) => {
    const response = await axiosClient.delete(`/admin/students/${id}`);
    return response.data;
};