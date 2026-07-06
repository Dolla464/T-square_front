import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع العلامات (Tags)
// ----------------------------------------------------------------------------
export const getTags = async (params = {}) => {
  const response = await axiosClient.get("/admin/tags", { params });
  return response.data;
};

export const createTag = async (data) => {
  const response = await axiosClient.post("/admin/tags", data);
  return response.data;
};

export const updateTag = async (id, data) => {
  const response = await axiosClient.put(`/admin/tags/${id}`, data);
  return response.data;
};

export const deleteTag = async (id) => {
  const response = await axiosClient.delete(`/admin/tags/${id}`);
  return response.data;
};
