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
import Loading from "../Loading";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);

  // دالة مساعدة لتحديد نوع التخزين
  const getStorage = useCallback((rememberMe) => {
    return rememberMe ? localStorage : sessionStorage;
  }, []);

  // دالة مساعدة لمسح البيانات من كلا النوعين
  const clearAllStorage = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }, []);

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

  // مرجع لتخزين حالة الصيانة ومنع التكرار اللانهائي في الاعتماديات
  const isMaintenanceRef = React.useRef(false);

  // ── جلب حالة الصيانة من السيرفر بشكل ديناميكي ──
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
      // 🚑 العودة لآخر حالة مسجلة بدلاً من القيمة الافتراضية لمنع الدخول في loop
      return isMaintenanceRef.current;
    }
  }, []);

  // ── تهيئة التطبيق وفحص التوكن والصيانة عند الإقلاع ──
  useEffect(() => {
    const initializeAuth = async () => {
      // الأولوية للـ localStorage (Remember Me)
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      // إذا مفيش في localStorage، نجرب sessionStorage
      const sessionToken = !storedToken
        ? sessionStorage.getItem("token")
        : null;
      const sessionUser = !storedUser ? sessionStorage.getItem("user") : null;

      const finalToken = storedToken || sessionToken;
      const finalUser = storedUser || sessionUser;

      // 💥 فحص الصيانة مع تايم آوت 2 ثانية لضمان عدم تعليق التطبيق نهائياً
      try {
        await Promise.race([
          checkMaintenanceStatus(),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      } catch (e) {
        console.error("Maintenance check timed out or failed:", e);
      }

      if (finalToken && finalUser) {
        setToken(finalToken);
        try {
          setUser(JSON.parse(finalUser));
          await fetchUserProfile(finalToken);
        } catch (e) {
          console.error("Failed to parse user data from storage", e);
          clearAllStorage();
        }
      }

      // نقفل الـ Loading بعد التأكد التام من حالة الصيانة وحالة المستخدم
      setLoading(false);
    };

    initializeAuth();
  }, [checkMaintenanceStatus, fetchUserProfile, clearAllStorage]);

  const login = useCallback(
    async (responseData, rememberMe = true) => {
      const { token, user } = responseData;

      clearAllStorage(); // Clear the storage first

      const storage = getStorage(rememberMe);
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);

      // Fetch the profile after login
      await fetchUserProfile(token);
    },
    [clearAllStorage, getStorage, fetchUserProfile],
  );

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    const storage = localStorage.getItem("token")
      ? localStorage
      : sessionStorage.getItem("token")
        ? sessionStorage
        : localStorage;
    storage.setItem("user", JSON.stringify(updatedUser));
  }, []);

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
      loading,
      isMaintenance,
      checkMaintenanceStatus,
      isLoggedIn: !!token,
    }),
    [
      user,
      userProfile,
      token,
      login,
      logout,
      updateUser,
      fetchUserProfile,
      loading,
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
