import axiosClient from "../../../api/axios";

export const getLearningGroupsSelection = () =>
  axiosClient.get("/instructor/learning-groups/selection").then((res) => res.data);

export const getLearningGroupExams = (groupId) =>
  axiosClient
    .get(`/instructor/learning-groups/${groupId}/exams`)
    .then((res) => res.data);

export const getExamResults = (groupId, examId) =>
  axiosClient
    .get(`/instructor/learning-groups/${groupId}/exams/${examId}/results`)
    .then((res) => res.data);

export const getStudentExamResults = (groupId, studentId, examId) =>
  axiosClient
    .get(`/instructor/learning-groups/${groupId}/students/${studentId}/exam-results`, {
      params: { exam_id: examId },
    })
    .then((res) => res.data);

const downloadExportBlob = (response) => {
  const { content, filename, mime } = response.data?.data ?? {};

  if (!content) throw new Error("Export response missing content.");

  const byteChars = atob(content);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: mime });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportExamResults = async (groupId, examId, format = "pdf") => {
  const response = await axiosClient.get(
    `/instructor/learning-groups/${groupId}/exams/${examId}/results/export`,
    { params: { format } }
  );
  downloadExportBlob(response);
};

export const toggleGroupExamActivation = (groupId, examId, isActivated) =>
  axiosClient
    .patch(`/instructor/learning-groups/${groupId}/exams/${examId}/toggle-activation`, {
      is_activated: isActivated,
    })
    .then((res) => res.data);
