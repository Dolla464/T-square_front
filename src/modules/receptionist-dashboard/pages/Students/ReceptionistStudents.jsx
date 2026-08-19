import AdminStudents from "../../../admin-dashboard/pages/Students/AdminStudents";
import { useReceptionistStudents } from "../../hooks/useReceptionistStudents";
import { useReceptionistGroups } from "../../hooks/useReceptionistGroups";

function ReceptionistStudents() {
  return (
    <AdminStudents
      allowEmailEdit={false}
      useStudentsHook={useReceptionistStudents}
      useGroupsHook={useReceptionistGroups}
    />
  );
}

export default ReceptionistStudents;
