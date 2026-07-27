import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForbidden } from "../../contexts/ForbiddenContext";

function ForbiddenAccess({ backTo = null, backLabel = null }) {
  const { resourcePath } = useForbidden();
  const { t } = useTranslation("common");

  return (
    <div className="text-center py-5 px-3">
      <i className="bi bi-shield-lock fs-1 text-danger d-block mb-3" />
      <h2 className="h4 mb-2">{t("forbidden.title")}</h2>
      <p className="text-muted mb-4">{t("forbidden.message")}</p>
      {resourcePath ? (
        <p className="small text-muted mb-3">{resourcePath}</p>
      ) : null}
      {backTo ? (
        <Link to={backTo} className="btn btn-outline-secondary btn-sm">
          {backLabel || t("forbidden.back")}
        </Link>
      ) : null}
    </div>
  );
}

export default ForbiddenAccess;
