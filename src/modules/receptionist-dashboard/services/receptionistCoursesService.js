import axiosClient from "../../../api/axios";

export const getCourses = async (params = {}) => {
  const response = await axiosClient.get("/receptionist/courses", { params });
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await axiosClient.get(`/receptionist/courses/${id}`);
  return response.data;
};
