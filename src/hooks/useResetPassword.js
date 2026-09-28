import { useState } from "react";
import { resetPasswordService } from "../services/resetPassword";
import { toastError } from "../components/shared/Toaster/toaster";

/**
 * هوك لإدارة عملية إعادة تعيين كلمة المرور
 */
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);

  const executeResetPassword = async (resetData) => {
    setLoading(true);
    try {
      const data = await resetPasswordService(resetData);
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
      
      toastError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeResetPassword, loading };
};
