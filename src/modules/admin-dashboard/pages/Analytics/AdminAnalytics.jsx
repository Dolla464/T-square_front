import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";

function AdminAnalytics() {
  const { t } = useTranslation("adminDashboard");
  return <ComingSoon pageTitle={t("sidebar.analytics")} icon="bi-bar-chart-line" />;
}
export default AdminAnalytics;
