import axiosClient from "../../../api/axios";
import { buildSolutionPayload } from "../../../utils/buildPayload";

// ----------------------------------------------------------------------------
// جلب جميع الحلول البرمجية
// ----------------------------------------------------------------------------
export const getSolutions = async (params = {}) => {
  const response = await axiosClient.get("/admin/solutions", { params });
  return response.data;
};

// ----------------------------------------------------------------------------
// جلب حل برمجي معين بالـ ID
// ----------------------------------------------------------------------------
export const getSolutionById = async (id) => {
  const response = await axiosClient.get(`/admin/solutions/${id}`);
  return response.data;
};

// ----------------------------------------------------------------------------
// إنشاء حل برمجي جديد
// ----------------------------------------------------------------------------
export const createSolution = async (data, options = {}) => {
  const response = await axiosClient.post(
    "/admin/solutions",
    buildSolutionPayload(data, options),
  );
  return response.data;
};

// ----------------------------------------------------------------------------
// تحديث البيانات الخاصة بحل برمجي
// ----------------------------------------------------------------------------
export const updateSolution = async (id, data, options = {}) => {
  const response = await axiosClient.put(
    `/admin/solutions/${id}`,
    buildSolutionPayload(data, options),
  );
  return response.data;
};

// ----------------------------------------------------------------------------
// حذف حل برمجي 
// ----------------------------------------------------------------------------
export const deleteSolution = async (id) => {
  const response = await axiosClient.delete(`/admin/solutions/${id}`);
  return response.data;
};
