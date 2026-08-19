import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axiosClient, { initCsrf } from "../api/axios";
import { fetchCurrentUser } from "../services/auth";
import { normalizeAuthUser } from "../utils/normalizeAuthUser";
import Loading from "../Loading";

const AuthContext = createContext();

const QUIZ_STATE_PREFIX = "quiz_state_";
const QUIZ_COMPLETED_PREFIX = "quiz_completed_";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSynced, setUserSynced] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);

  const clearLegacyAuthStorage = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }, []);

  const clearSensitiveSessionData = useCallback(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(QUIZ_STATE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(sessionStorage).forEach((key) => {
      if (
        key.startsWith(QUIZ_STATE_PREFIX) ||
        key.startsWith(QUIZ_COMPLETED_PREFIX)
      ) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  const persistUser = useCallback((nextUser) => {
    if (!nextUser) {
      return;
    }

    sessionStorage.setItem("user", JSON.stringify(nextUser));
  }, []);

  const syncUserFromServer = useCallback(async () => {
    const serverUser = await fetchCurrentUser();
    if (!serverUser?.role) {
      throw new Error("Invalid user payload from server");
    }

    setUser(serverUser);
    persistUser(serverUser);
    setUserSynced(true);

    return serverUser;
  }, [persistUser]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axiosClient.get("/profile");
      if (response.data.status === "success") {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }, []);

  const isMaintenanceRef = React.useRef(false);

  const checkMaintenanceStatus = useCallback(async () => {
    try {
      const response = await axiosClient.get("/settings/maintenance_mode");

      if (response?.data?.data) {
        const maintenanceValue = response.data.data.value;

        const isTrueMaintenance =
          maintenanceValue === true ||
          maintenanceValue === 1 ||
          maintenanceValue === "1" ||
          maintenanceValue === "true";

        setIsMaintenance((prev) => {
          if (prev === isTrueMaintenance) return prev;
          return isTrueMaintenance;
        });
        isMaintenanceRef.current = isTrueMaintenance;

        return isTrueMaintenance;
      }

      return false;
    } catch (error) {
      console.error("Failed to fetch maintenance status:", error);
      return isMaintenanceRef.current;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      try {
        await Promise.race([
          checkMaintenanceStatus(),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      } catch (e) {
        console.error("Maintenance check timed out or failed:", e);
      }

      try {
        await initCsrf();
        await syncUserFromServer();
        await fetchUserProfile();
      } catch (e) {
        if (e?.response?.status !== 401) {
          console.error("Failed to verify session with server:", e);
        }
        setUser(null);
        setUserProfile(null);
        setUserSynced(true);
        sessionStorage.removeItem("user");
      }

      setLoading(false);
    };

    initializeAuth();
  }, [
    checkMaintenanceStatus,
    fetchUserProfile,
    clearLegacyAuthStorage,
    syncUserFromServer,
  ]);

  const login = useCallback(
    async (responseData) => {
      clearLegacyAuthStorage();

      const normalizedUser = normalizeAuthUser(responseData.user);
      if (!normalizedUser?.role) {
        throw new Error("Login response missing user role");
      }

      persistUser(normalizedUser);
      setUser(normalizedUser);
      setUserSynced(true);

      try {
        await syncUserFromServer();
      } catch {
        // Login payload is server-issued; keep normalized user if re-fetch fails transiently.
      }

      await fetchUserProfile();
    },
    [clearLegacyAuthStorage, persistUser, fetchUserProfile, syncUserFromServer],
  );

  const updateUser = useCallback(
    (updatedUser) => {
      if (!updatedUser || typeof updatedUser !== "object") {
        return;
      }

      const normalized = normalizeAuthUser(updatedUser) ?? updatedUser;
      setUser(normalized);
      persistUser(normalized);

      if (updatedUser.student || updatedUser.instructor) {
        setUserProfile((prev) => ({
          ...(prev || {}),
          ...updatedUser,
        }));
      }
    },
    [persistUser],
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await initCsrf();
      await axiosClient.post("/logout");
    } catch (e) {
      console.error("Server-side logout failed:", e);
    } finally {
      setUser(null);
      setUserProfile(null);
      setUserSynced(false);
      clearLegacyAuthStorage();
      clearSensitiveSessionData();
      sessionStorage.removeItem("user");
      setLoading(false);
    }
  }, [clearLegacyAuthStorage, clearSensitiveSessionData]);

  const contextValue = useMemo(
    () => ({
      user,
      userProfile,
      token: null,
      login,
      logout,
      updateUser,
      fetchUserProfile,
      syncUserFromServer,
      loading,
      userSynced,
      isMaintenance,
      checkMaintenanceStatus,
      isLoggedIn: !!user?.role,
    }),
    [
      user,
      userProfile,
      login,
      logout,
      updateUser,
      fetchUserProfile,
      syncUserFromServer,
      loading,
      userSynced,
      isMaintenance,
      checkMaintenanceStatus,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
