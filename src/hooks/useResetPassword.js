import { useState } from "react";
import { resetPasswordService } from "../services/resetPassword";

/**
 * هوك لإدارة عملية إعادة تعيين كلمة المرور
 */
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const executeResetPassword = async (resetData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const data = await resetPasswordService(resetData);
      setSuccess(true);
      return data;
    } catch (err) {
      const responseData = err.response?.data;
      
      // استخراج رسالة الخطأ المناسبة لعرضها للمستخدم
      let message = responseData?.message || responseData?.error || "Failed to reset password.";
      
      // لو فيه أخطاء تحقق (Validation) قادمة من لارافيل، نقوم بعرض أول خطأ
      if (responseData?.errors) {
        const firstErrorKey = Object.keys(responseData.errors)[0];
        const firstError = responseData.errors[firstErrorKey];
        message = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeResetPassword, loading, error, success };
};
