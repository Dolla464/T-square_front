import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios"; // تأكد من تثبيت axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    }
    setLoading(false);
  }, []);

  const login = (data, rememberMe = true) => {
    setToken(data.token);
    setUser(data.user);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", data.token);
    storage.setItem("user", JSON.stringify(data.user));
  };

  // --- التعديل هنا لربط اللوج اوت بالباك ---
  const logout = async () => {
    try {
      // نبعت طلب للباك إيند لإلغاء التوكن
      // ملاحظة: تأكد إن مسار الـ API صح (مثلاً /api/logout)
      await axios.post(
        "http://127.0.0.1:8000/api/logout",
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, isLoggedIn: !!token }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
