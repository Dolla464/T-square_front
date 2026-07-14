import axiosClient from "../../../api/axios";

export const getStudents = async (params = {}) => {
  const response = await axiosClient.get("/receptionist/students", { params });
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await axiosClient.get(`/receptionist/students/${id}`);
  return response.data;
};

export const registerStudents = async (data) => {
  const response = await axiosClient.post("/receptionist/users", data);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await axiosClient.delete(`/receptionist/students/${id}`);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await axiosClient.post(`/receptionist/students/${id}`, data);
  return response.data;
};

export const updateStudentStatus = (id, status) => {
  return axiosClient.patch(`/receptionist/students/${id}/status`, { status });
};

export const toggleStudentVerify = (id) => {
  return axiosClient.post(`/receptionist/students/${id}/toggle-verify`);
};

export const updateStudentCourseGroup = (studentId, courseId, groupId) => {
  return axiosClient.put(
    `/receptionist/students/${studentId}/courses/${courseId}/group`,
    { group_id: groupId },
  );
};

export const updateStudentCourseStatus = (studentId, courseId, isCompleted) => {
  return axiosClient.put(
    `/receptionist/students/${studentId}/courses/${courseId}/status`,
    { is_completed: isCompleted },
  );
};
