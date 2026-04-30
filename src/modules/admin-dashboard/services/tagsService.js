import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع العلامات (Tags) المستخدمة للحلول
// ----------------------------------------------------------------------------
export const getTags = async (params = {}) => {
  const response = await axiosClient.get("/admin/tags", { params });
  return response.data;
};
