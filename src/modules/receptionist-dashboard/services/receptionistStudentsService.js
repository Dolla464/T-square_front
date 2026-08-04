import axiosClient from "../../../api/axios";
import {
  buildStudentCreateFormData,
  buildStudentCreatePayload,
  STUDENT_CREATE_ALLOWED,
  toFormData,
} from "../../../utils/buildPayload";

const buildPayloadFromInput = (data) => {
  if (data instanceof FormData) {
    const obj = { role: "student" };
    STUDENT_CREATE_ALLOWED.forEach((key) => {
      if (data.has(key)) {
        obj[key] = data.get(key);
      }
    });
    return toFormData(obj);
  }

  if (data?.avatar instanceof File) {
    return buildStudentCreateFormData(data);
  }

  return buildStudentCreatePayload(data);
};

export const getStudents = async (params = {}) => {
  const response = await axiosClient.get("/receptionist/students", { params });
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await axiosClient.get(`/receptionist/students/${id}`);
  return response.data;
};

export const registerStudents = async (data) => {
  const payload = buildPayloadFromInput(data);

  const response = await axiosClient.post("/receptionist/users", payload, {
    headers:
      payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
  });
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
