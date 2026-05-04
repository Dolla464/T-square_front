import AdminContentPage from "../../components/shared/AdminContentPage/AdminContentPage";
import { useAdminSolutions } from "../../hooks/useAdminSolutions";

function AdminCourses() {
  return <AdminContentPage type="course" useDataHook={useAdminSolutions} />;
}
export default AdminCourses;
