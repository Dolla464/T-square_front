import axiosClient from "../api/axios";

export const loginService = async (credentials) => {
  // نرجع الـ response بالكامل كما هو معتاد في الـ services
  return await axiosClient.post("/login", credentials);
};
