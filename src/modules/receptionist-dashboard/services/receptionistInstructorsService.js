import axiosClient from "../../../api/axios";

export const getInstructors = async (params = {}) => {
  const response = await axiosClient.get("/receptionist/instructors", { params });
  return response.data;
};

export const getInstructorById = async (id) => {
  const response = await axiosClient.get(`/receptionist/instructors/${id}`);
  return response.data;
};
