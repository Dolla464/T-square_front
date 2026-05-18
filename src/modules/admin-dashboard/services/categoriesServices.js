import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع التصنيفات مع الفلاتر و pagination
// ----------------------------------------------------------------------------
export const getCategories = (params) =>
  axiosClient.get("/admin/categories", { params }).then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب التصنيفات للقوائم المنسدلة على شكل شجرة (بدون pagination)
// ----------------------------------------------------------------------------
export const getCategoriesTree = () =>
  axiosClient.get("/admin/categories/tree").then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب تصنيف معين بالـ ID
// ----------------------------------------------------------------------------
export const getCategoryById = (id) =>
  axiosClient.get(`/admin/categories/${id}`).then((res) => res.data);

// ----------------------------------------------------------------------------
// إنشاء تصنيف جديد
// ----------------------------------------------------------------------------
export const createCategory = (payload) =>
  axiosClient.post("/admin/categories", payload).then((res) => res.data);

// ----------------------------------------------------------------------------
// تحديث بيانات تصنيف
// ----------------------------------------------------------------------------
export const updateCategory = (id, payload) =>
  axiosClient.put(`/admin/categories/${id}`, payload).then((res) => res.data);
