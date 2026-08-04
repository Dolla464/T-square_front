import { createAttendanceHook } from "../../admin-dashboard/hooks/useAdminAttendance";
import {
  getLearningGroupsSelection,
  getLearningGroupSessions,
  getSessionAttendance,
  getGroupAttendanceSummary,
  getStudentCourseAttendance,
  exportSessionAttendance,
  exportStudentCourseAttendance,
  markSessionAttendance,
} from "../services/receptionistLearningGroupService";

export const useReceptionistStudentAttendance = createAttendanceHook({
  getLearningGroupsSelection,
  getLearningGroupSessions,
  getSessionAttendance,
  getGroupAttendanceSummary,
  getStudentCourseAttendance,
  exportSessionAttendance,
  exportStudentCourseAttendance,
  markSessionAttendance,
});
