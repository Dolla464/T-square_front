import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetAccessForbidden } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { useForbidden } from "../../contexts/ForbiddenContext";
import { getRouteByRole } from "../../config/routes";
import { registerRoleMismatchHandler } from "../../utils/authEvents";

/**
 * When the backend returns 403 (wrong role), re-sync user from /user and redirect.
 */
function RoleMismatchRedirect() {
  const navigate = useNavigate();
  const { token, syncUserFromServer } = useAuth();
  const { clearForbidden } = useForbidden();

  useEffect(() => {
    registerRoleMismatchHandler(async () => {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const serverUser = await syncUserFromServer();
        clearForbidden();
        resetAccessForbidden();
        navigate(getRouteByRole(serverUser?.role), { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    });
  }, [token, syncUserFromServer, navigate, clearForbidden]);

  return null;
}

export default RoleMismatchRedirect;
