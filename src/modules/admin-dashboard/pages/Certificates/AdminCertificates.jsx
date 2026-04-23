import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";

function AdminCertificates() {
  const { t } = useTranslation("adminDashboard");
  return <ComingSoon pageTitle={t("sidebar.certificates")} icon="bi-award" />;
}
export default AdminCertificates;
