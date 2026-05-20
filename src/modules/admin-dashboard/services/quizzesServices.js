import axiosClient from "../../../api/axios";

/**
 * Get quizzes list with pagination/filters (Placeholder)
 */
export const getQuizzes = async (params = {}) => {
  // const response = await axiosClient.get("/admin/quizzes", { params });
  // return response.data;
  return { data: [], pagination: null };
};

/**
 * Get single quiz by ID (Placeholder)
 */
export const getQuizById = async (id) => {
  // const response = await axiosClient.get(`/admin/quizzes/${id}`);
  // return response.data;
  return { data: null };
};

/**
 * Create a new quiz (Placeholder)
 */
export const createQuiz = async (data) => {
  // const response = await axiosClient.post("/admin/quizzes", data);
  // return response.data;
  return { data: null };
};

/**
 * Update an existing quiz (Placeholder)
 */
export const updateQuiz = async (id, data) => {
  // const response = await axiosClient.put(`/admin/quizzes/${id}`, data);
  // return response.data;
  return { data: null };
};

/**
 * Delete a quiz (Placeholder)
 */
export const deleteQuiz = async (id) => {
  // const response = await axiosClient.delete(`/admin/quizzes/${id}`);
  // return response.data;
  return { success: true };
};

/**
 * Toggle a quiz active/inactive status (Placeholder)
 */
export const toggleQuizStatus = async (id, status) => {
  // const response = await axiosClient.patch(`/admin/quizzes/${id}/status`, { status });
  // return response.data;
  return { success: true };
};
