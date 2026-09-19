import axiosClient from "../../../api/axios";

export const getPendingGradingAttempts = () =>
  axiosClient.get("/instructor/exam-grading");

export const getGradingAttemptDetails = (attemptId) =>
  axiosClient.get(`/instructor/exam-grading/${attemptId}`);

export const submitAttemptGrades = (attemptId, answers) =>
  axiosClient.post(`/instructor/exam-grading/${attemptId}`, { answers });
