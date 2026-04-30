import AdminContentPage from "../../components/shared/AdminContentPage/AdminContentPage";
// افتراضنا أنه تم ربط hook هنا كمثال. سننشئ useAdminCourses أو نستخدم useAdminSolutions كـ skeleton لو احتجنا
import { useAdminSolutions } from "../../hooks/useAdminSolutions"; // أو hook مشابه للكورسات

function AdminCourses() {
  return <AdminContentPage type="course" useDataHook={useAdminSolutions} />; // سنستخدمه مؤقتاً لتشغيل الـ shared state
}
export default AdminCourses;
