import axiosClient from "../../../api/axios";

export async function fetchStudentAttendanceCard(studentId, { signal } = {}) {
  const response = await axiosClient.get(
    `/admin/students/${studentId}/attendance-card`,
    { signal },
  );
  return response.data;
}

export async function issueStudentAttendanceCard(studentId, { signal } = {}) {
  const response = await axiosClient.post(
    `/admin/students/${studentId}/attendance-card`,
    undefined,
    { signal },
  );
  return response.data;
}

export async function reissueStudentAttendanceCard(
  studentId,
  payload = {},
  { signal } = {},
) {
  const response = await axiosClient.post(
    `/admin/students/${studentId}/attendance-card/reissue`,
    payload,
    { signal },
  );
  return response.data;
}

export async function revokeStudentAttendanceCard(
  studentId,
  payload = {},
  { signal } = {},
) {
  const response = await axiosClient.post(
    `/admin/students/${studentId}/attendance-card/revoke`,
    payload,
    { signal },
  );
  return response.data;
}
