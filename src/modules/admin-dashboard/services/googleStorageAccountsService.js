import axiosClient from "../../../api/axios";

export const getGoogleStorageAccounts = async () => {
  const response = await axiosClient.get("/admin/google-storage-accounts");
  return response.data;
};

export const createGoogleStorageAccount = async (data) => {
  const response = await axiosClient.post("/admin/google-storage-accounts", data);
  return response.data;
};

export const updateGoogleStorageAccount = async (id, data) => {
  const response = await axiosClient.put(`/admin/google-storage-accounts/${id}`, data);
  return response.data;
};

export const deleteGoogleStorageAccount = async (id) => {
  const response = await axiosClient.delete(`/admin/google-storage-accounts/${id}`);
  return response.data;
};

export const connectGoogleStorageAccount = async (id) => {
  const response = await axiosClient.post(`/admin/google-storage-accounts/${id}/connect`);
  return response.data;
};

export const disconnectGoogleStorageAccount = async (id) => {
  const response = await axiosClient.post(`/admin/google-storage-accounts/${id}/disconnect`);
  return response.data;
};

export const testGoogleStorageAccountConnection = async (id) => {
  const response = await axiosClient.post(`/admin/google-storage-accounts/${id}/test-connection`);
  return response.data;
};
