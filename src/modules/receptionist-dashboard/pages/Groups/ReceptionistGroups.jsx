import AdminGroups from "../../../admin-dashboard/pages/Groups/AdminGroups";
import { useReceptionistGroups } from "../../hooks/useReceptionistGroups";
import { useReceptionistCourses } from "../../hooks/useReceptionistCourses";
import { useReceptionistInstructors } from "../../hooks/useReceptionistInstructors";
import {
  getLearningGroupSessions,
  exportGroupStudents,
} from "../../services/receptionistLearningGroupService";
import { exportSchedule } from "../../services/receptionistScheduleService";

function ReceptionistGroups() {
  return (
    <AdminGroups
      useGroupsHook={useReceptionistGroups}
      useCoursesHook={useReceptionistCourses}
      useInstructorsHook={useReceptionistInstructors}
      getLearningGroupSessionsFn={getLearningGroupSessions}
      exportGroupStudentsFn={exportGroupStudents}
      exportScheduleFn={exportSchedule}
    />
  );
}

export default ReceptionistGroups;
