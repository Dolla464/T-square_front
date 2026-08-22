import axiosClient from "../../../api/axios";

export const getCourseLessons = async (courseId) => {
  const response = await axiosClient.get(`/admin/courses/${courseId}/lessons`);
  return response.data;
};

export const createCourseLesson = async (courseId, data) => {
  const response = await axiosClient.post(`/admin/courses/${courseId}/lessons`, data);
  return response.data;
};

export const updateCourseLesson = async (courseId, lessonId, data) => {
  const response = await axiosClient.put(`/admin/courses/${courseId}/lessons/${lessonId}`, data);
  return response.data;
};

export const deleteCourseLesson = async (courseId, lessonId) => {
  const response = await axiosClient.delete(`/admin/courses/${courseId}/lessons/${lessonId}`);
  return response.data;
};
