import axiosClient from "../../../api/axios";

export const getQuizzes = async (params = {}) => {
  const response = await axiosClient.get("/instructor/exams", { params });
  return response.data;
};

export const getQuizById = async (id) => {
  const response = await axiosClient.get(`/instructor/exams/${id}`);
  return response.data;
};

export const createQuiz = async (payload) => {
  const response = await axiosClient.post("/instructor/exams", payload);
  return response.data;
};

export const updateQuiz = async (id, payload) => {
  const response = await axiosClient.put(`/instructor/exams/${id}`, payload);
  return response.data;
};

export const deleteQuiz = async (id) => {
  const response = await axiosClient.delete(`/instructor/exams/${id}`);
  return response.data;
};

export const toggleQuizStatus = async (id, status) => {
  const response = await axiosClient.patch(`/instructor/exams/${id}/toggle-status`, {
    exam_id: id,
    is_active: status,
  });
  return response.data;
};

export const getTrashedQuizzes = async (params = {}) => {
  const response = await axiosClient.get("/instructor/exams/trash", { params });
  return response.data;
};

export const restoreQuiz = async (id) => {
  const response = await axiosClient.post(`/instructor/exams/${id}/restore`);
  return response.data;
};

export const forceDeleteQuiz = async (id) => {
  const response = await axiosClient.delete(`/instructor/exams/${id}/force-delete`);
  return response.data;
};

export const getQuestionsForExam = async (examId) => {
  const response = await axiosClient.get(`/instructor/questions?exam_id=${examId}`);
  return response.data;
};

export const getQuestionById = async (questionId) => {
  const response = await axiosClient.get(`/instructor/questions/${questionId}`);
  return response.data;
};

export const createQuestion = async (payload) => {
  const response = await axiosClient.post("/instructor/questions", payload);
  return response.data;
};

export const updateQuestion = async (id, payload) => {
  const response = await axiosClient.put(`/instructor/questions/${id}`, payload);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await axiosClient.delete(`/instructor/questions/${id}`);
  return response.data;
};

export const getTrashedQuestions = async (params = {}) => {
  const response = await axiosClient.get("/instructor/questions/trash", { params });
  return response.data;
};

export const restoreQuestion = async (id) => {
  const response = await axiosClient.post(`/instructor/questions/${id}/restore`);
  return response.data;
};

export const forceDeleteQuestion = async (id) => {
  const response = await axiosClient.delete(`/instructor/questions/${id}/force-delete`);
  return response.data;
};
