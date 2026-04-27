import AdminContentPage from "../../components/shared/AdminContentPage/AdminContentPage";
import { useAdminSolutions } from "../../hooks/useAdminSolutions";

function AdminSolutions() {
  return <AdminContentPage type="solution" useDataHook={useAdminSolutions} />;
}
export default AdminSolutions;
