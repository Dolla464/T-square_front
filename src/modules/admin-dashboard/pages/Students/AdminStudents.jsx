import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";

function AdminStudents() {
  const { t } = useTranslation("adminDashboard");
  return <ComingSoon pageTitle={t("sidebar.students")} icon="bi-people" />;
}
export default AdminStudents;
