import AdminContentPage from "../../components/shared/AdminContentPage/AdminContentPage";
import { useAdminCourses } from "../../hooks/useAdminCourses";

function AdminCourses() {
  return <AdminContentPage type="course" useDataHook={useAdminCourses} />;
}
export default AdminCourses;
