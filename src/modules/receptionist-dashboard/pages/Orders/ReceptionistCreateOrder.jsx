import AdminCreateOrder from "../../../admin-dashboard/pages/Orders/AdminCreateOrder";
import { useReceptionistOrders } from "../../hooks/useReceptionistOrders";
import { getStudents } from "../../services/receptionistStudentsService";
import { getCourses } from "../../services/receptionistCoursesService";

function ReceptionistCreateOrder() {
  return (
    <AdminCreateOrder
      useOrdersHook={useReceptionistOrders}
      getStudentsFn={getStudents}
      getCoursesFn={getCourses}
      basePath="/receptionist"
    />
  );
}

export default ReceptionistCreateOrder;
