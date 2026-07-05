import axiosClient from "../../../api/axios";

export const getCourses = async (params = {}) => {
  const response = await axiosClient.get("/instructor/courses", { params });
  return response.data;
};
