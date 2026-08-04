import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resetAccessForbidden } from "../../api/axios";
import { useForbidden } from "../../contexts/ForbiddenContext";

function ForbiddenRouteWatcher() {
  const location = useLocation();
  const { clearForbidden } = useForbidden();

  useEffect(() => {
    clearForbidden();
    resetAccessForbidden();
  }, [location.pathname, clearForbidden]);

  return null;
}

export default ForbiddenRouteWatcher;
