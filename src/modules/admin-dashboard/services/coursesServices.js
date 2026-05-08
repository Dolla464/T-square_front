import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع الكورسات مع pagination
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
    // If FormData, tell axios to use multipart (it adds boundary automatically)
    if (data instanceof FormData) {
        const response = await axiosClient.post("/admin/courses", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    }
    const response = await axiosClient.post("/admin/courses", data);
    return response.data;
};

// ----------------------------------------------------------------------------
// تحديث البيانات الخاصة بكورس
// ----------------------------------------------------------------------------
export const updateCourse = async (id, data) => {
    // FormData: POST + _method=PUT (Laravel method spoofing)
    if (data instanceof FormData) {
        data.append("_method", "PUT");
        const response = await axiosClient.post(`/admin/courses/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    }
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

// ----------------------------------------------------------------------------
// جلب الكاتيجوريز للـ dropdown
// ----------------------------------------------------------------------------
export const getCategories = async () => {
    const response = await axiosClient.get("/student/categories", {
        params: { type: "sub" },
    });
    return response.data;
};