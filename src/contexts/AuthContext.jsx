import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import axiosClient from "../api/axios";
import { fetchCurrentUser } from "../services/auth";
import { normalizeAuthUser } from "../utils/normalizeAuthUser";
import Loading from "../Loading";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSynced, setUserSynced] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);

  const getStorage = useCallback((rememberMe) => {
    return rememberMe ? localStorage : sessionStorage;
  }, []);

  const getActiveStorage = useCallback(() => {
    if (localStorage.getItem("token")) {
      return localStorage;
    }
    if (sessionStorage.getItem("token")) {
      return sessionStorage;
    }
    return localStorage;
  }, []);

  const clearAllStorage = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }, []);

  const persistUser = useCallback(
    (nextUser) => {
      if (!nextUser) {
        return;
      }

      const storage = getActiveStorage();
      storage.setItem("user", JSON.stringify(nextUser));
    },
    [getActiveStorage],
  );

  const syncUserFromServer = useCallback(async (tokenOverride = null) => {
    const tokenToUse =
      tokenOverride || localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!tokenToUse) {
      throw new Error("Missing auth token");
    }

    const serverUser = await fetchCurrentUser();
    if (!serverUser?.role) {
      throw new Error("Invalid user payload from server");
    }

    setUser(serverUser);
    persistUser(serverUser);
    setUserSynced(true);

    return serverUser;
  }, [persistUser]);

  const fetchUserProfile = useCallback(async (tokenToUse) => {
    try {
      const response = await axiosClient.get("/profile", {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });
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
      const storedToken = localStorage.getItem("token");
      const sessionToken = !storedToken ? sessionStorage.getItem("token") : null;
      const finalToken = storedToken || sessionToken;

      try {
        await Promise.race([
          checkMaintenanceStatus(),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      } catch (e) {
        console.error("Maintenance check timed out or failed:", e);
      }

      if (finalToken) {
        setToken(finalToken);

        try {
          // Never trust role from session/local storage — always verify with backend.
          await syncUserFromServer(finalToken);
          await fetchUserProfile(finalToken);
        } catch (e) {
          console.error("Failed to verify session with server:", e);
          clearAllStorage();
          setToken(null);
          setUser(null);
          setUserSynced(false);
        }
      } else {
        setUserSynced(true);
      }

      setLoading(false);
    };

    initializeAuth();
  }, [checkMaintenanceStatus, fetchUserProfile, clearAllStorage, syncUserFromServer]);

  const login = useCallback(
    async (responseData, rememberMe = true) => {
      const { token: authToken, user: loginUser } = responseData;

      clearAllStorage();

      const storage = getStorage(rememberMe);
      storage.setItem("token", authToken);

      const normalizedUser = normalizeAuthUser(loginUser);
      if (!normalizedUser?.role) {
        throw new Error("Login response missing user role");
      }

      storage.setItem("user", JSON.stringify(normalizedUser));

      setToken(authToken);
      setUser(normalizedUser);
      setUserSynced(true);

      try {
        await syncUserFromServer(authToken);
      } catch {
        // Login payload is server-issued; keep normalized user if re-fetch fails transiently.
      }

      await fetchUserProfile(authToken);
    },
    [clearAllStorage, getStorage, fetchUserProfile, syncUserFromServer],
  );

  const updateUser = useCallback(
    (updatedUser) => {
      const normalized = normalizeAuthUser(updatedUser) ?? updatedUser;
      setUser(normalized);
      persistUser(normalized);
    },
    [persistUser],
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (e) {
      console.error("Server-side logout failed:", e);
    } finally {
      setToken(null);
      setUser(null);
      setUserProfile(null);
      setUserSynced(false);
      clearAllStorage();
      setLoading(false);
    }
  }, [token, clearAllStorage]);

  const contextValue = useMemo(
    () => ({
      user,
      userProfile,
      token,
      login,
      logout,
      updateUser,
      fetchUserProfile,
      syncUserFromServer,
      loading,
      userSynced,
      isMaintenance,
      checkMaintenanceStatus,
      isLoggedIn: !!token && !!user?.role,
    }),
    [
      user,
      userProfile,
      token,
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
