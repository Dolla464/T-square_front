import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";

function AdminInstructor() {
  const { t } = useTranslation("adminDashboard");
  return <ComingSoon pageTitle={t("sidebar.instructor")} icon="bi-person-badge" />;
}
export default AdminInstructor;
