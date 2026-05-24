import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios"; // تأكد من تثبيت axios
import axiosClient from "../api/axios";
import Loading from "../Loading";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // دالة مساعدة لتحديد نوع التخزين
  const getStorage = (rememberMe) => {
    return rememberMe ? localStorage : sessionStorage;
  };

  // دالة مساعدة لمسح البيانات من كلا النوعين
  const clearAllStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  const fetchUserProfile = async (tokenToUse) => {
    try {
      const response = await axiosClient.get("/profile", {
        headers: {
          Authorization: `Bearer ${tokenToUse}`
        }
      });
      if (response.data.status === "success") {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    // الأولوية للـ localStorage (Remember Me)
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // إذا مفيش في localStorage، نجرب sessionStorage
    const sessionToken = !storedToken ? sessionStorage.getItem("token") : null;
    const sessionUser = !storedUser ? sessionStorage.getItem("user") : null;

    const finalToken = storedToken || sessionToken;
    const finalUser = storedUser || sessionUser;

    if (finalToken && finalUser) {
      setToken(finalToken);
      try {
        setUser(JSON.parse(finalUser));
        fetchUserProfile(finalToken);
      } catch (e) {
        console.error("Failed to parse user data from storage", e);
        // تنظيف البيانات التالفة
        clearAllStorage();
      }
    }
    setLoading(false);
  }, []);

  const login = (responseData, rememberMe = true) => {
    const { token, user } = responseData;
    setToken(token);
    setUser(user);
    // مسح أي بيانات قديمة قبل حفظ الجديدة
    clearAllStorage();

    // حفظ البيانات في نوع التخزين المحدد
    const storage = getStorage(rememberMe);
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(user));
    
    // جلب بيانات البروفايل بعد اللوج ان
    fetchUserProfile(token);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    const storage = localStorage.getItem("token")
      ? localStorage
      : sessionStorage.getItem("token")
        ? sessionStorage
        : localStorage;
    storage.setItem("user", JSON.stringify(updatedUser));
  };

  // --- التعديل هنا لربط اللوج اوت بالباك ---
  const logout = async () => {
    try {
      // نبعت طلب للباك إيند لإلغاء التوكن
      // ملاحظة: تأكد إن مسار الـ API صح (مثلاً /api/logout)
      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (e) {
      console.error("Server-side logout failed:", e);
      // بنكمل مسح البيانات من الجهاز حتى لو السيرفر رجع Error
    } finally {
      // تنظيف كل شيء من الجهاز (الفرونت إيند)
      setToken(null);
      setUser(null);
      setUserProfile(null);
      clearAllStorage();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        token,
        login,
        logout,
        updateUser,
        fetchUserProfile,
        loading,
        isLoggedIn: !!token,
      }}
    >
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
