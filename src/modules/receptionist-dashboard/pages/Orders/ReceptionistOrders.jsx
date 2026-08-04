import AdminOrders from "../../../admin-dashboard/pages/Orders/AdminOrders";
import { useReceptionistOrders } from "../../hooks/useReceptionistOrders";

function ReceptionistOrders() {
  return (
    <AdminOrders
      useOrdersHook={useReceptionistOrders}
      basePath="/receptionist"
      canExport={false}
      canDelete={false}
      showStats={false}
    />
  );
}

export default ReceptionistOrders;
