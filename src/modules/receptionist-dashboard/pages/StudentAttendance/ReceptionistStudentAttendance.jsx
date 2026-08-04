import AdminStudentAttendance from "../../../admin-dashboard/pages/StudentAttendance/AdminStudentAttendance";
import { useReceptionistStudentAttendance } from "../../hooks/useReceptionistStudentAttendance";

function ReceptionistStudentAttendance() {
  return (
    <AdminStudentAttendance
      useAttendanceHook={useReceptionistStudentAttendance}
    />
  );
}

export default ReceptionistStudentAttendance;
