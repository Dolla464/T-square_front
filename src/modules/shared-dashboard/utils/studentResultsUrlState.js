/**
 * Build student-results list URL with filter query params for back navigation.
 */
export function buildStudentResultsBackUrl(
  role,
  { groupId, examId, studentId } = {},
) {
  const base =
    role === "instructor"
      ? "/instructor/student-results"
      : "/admin/student-results";

  const params = new URLSearchParams();
  if (groupId) params.set("group", String(groupId));
  if (examId) params.set("exam", String(examId));
  if (studentId) params.set("student", String(studentId));

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function readStudentResultsFilters(searchParams) {
  return {
    groupId: searchParams.get("group") || "",
    examId: searchParams.get("exam") || "",
    studentId: searchParams.get("student") || "",
  };
}
