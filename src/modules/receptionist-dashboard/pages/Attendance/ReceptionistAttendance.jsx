import InstructorAttendance from "../../../instructor-dashboard/pages/Attendance/InstructorAttendance";
import { useReceptionistAttendance } from "../../hooks/useReceptionistAttendance";
import { getSessionRecords } from "../../services/receptionistAttendanceService";

function ReceptionistAttendance() {
  return (
    <InstructorAttendance
      useAttendanceHook={useReceptionistAttendance}
      getRecordsFn={getSessionRecords}
    />
  );
}

export default ReceptionistAttendance;
