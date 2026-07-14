import axiosClient from "../../../api/axios";

export const getReviews = async (params = {}) => {
  const response = await axiosClient.get("/receptionist/payments", { params });
  return response.data;
};

export const getReviewById = async (id) => {
  const response = await axiosClient.get(`/receptionist/payments/${id}`);
  return response.data;
};

export const updatePaymentOrdersById = async (id, payload) => {
  const response = await axiosClient.put(`/receptionist/payments/${id}`, payload);
  return response.data;
};

export const createOrder = async (payload) => {
  const response = await axiosClient.post("/receptionist/payments", payload);
  return response.data;
};
