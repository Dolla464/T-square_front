import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";

function InstructorOverview() {
  const { t } = useTranslation("adminDashboard");
  return <ComingSoon pageTitle={t("sidebar.dashboard")} icon="bi-grid-1x2" />;
}
export default InstructorOverview;
