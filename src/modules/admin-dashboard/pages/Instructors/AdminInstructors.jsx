import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";

function AdminInstructors() {
  const { t } = useTranslation("adminDashboard");
  return <ComingSoon pageTitle={t("sidebar.instructors")} icon="bi-person-lines-fill" />;
}
export default AdminInstructors;
