import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetAccessForbidden } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { registerSessionExpiredHandler } from "../../utils/authEvents";
import { toastWarning } from "../shared/Toaster/toaster";

function SessionExpiredRedirect() {
  const navigate = useNavigate();
  const { isLoggedIn, clearSessionLocally } = useAuth();
  const { t } = useTranslation("common");
  const isLoggedInRef = useRef(isLoggedIn);
  const clearSessionRef = useRef(clearSessionLocally);
  const navigateRef = useRef(navigate);
  const toastMessageRef = useRef(t("sessionExpired.toast"));

  isLoggedInRef.current = isLoggedIn;
  clearSessionRef.current = clearSessionLocally;
  navigateRef.current = navigate;
  toastMessageRef.current = t("sessionExpired.toast");

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      if (!isLoggedInRef.current) {
        return;
      }

      if (window.location.pathname === "/login") {
        return;
      }

      clearSessionRef.current();
      resetAccessForbidden();
      toastWarning(toastMessageRef.current);
      navigateRef.current("/login", {
        replace: true,
        state: { sessionExpired: true },
      });
    });
  }, []);

  return null;
}

export default SessionExpiredRedirect;
