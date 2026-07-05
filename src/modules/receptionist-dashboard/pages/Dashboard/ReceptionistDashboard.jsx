import AdminSchedule from "../../../admin-dashboard/pages/Schedule/AdminSchedule";
import { useReceptionistSchedule } from "../../hooks/useReceptionistSchedule";

function ReceptionistDashboard() {
  return (
    <AdminSchedule
      useScheduleHook={useReceptionistSchedule}
      readOnly
    />
  );
}

export default ReceptionistDashboard;
