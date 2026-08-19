import axiosClient, { initCsrf } from "../api/axios";

export const loginService = async (credentials) => {
  await initCsrf();
  return axiosClient.post("/login", credentials);
};
