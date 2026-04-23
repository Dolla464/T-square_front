import { useState } from "react";
import { postContactMessage } from "../services/contact";
import { toastContactSent, toastError } from "../components/shared/Toaster/toaster";

export const useContact = () => {
    // حالة التحميل
    const [loading, setLoading] = useState(false);
    // حالة الخطأ
    const [error, setError] = useState(null);
    // حالة النجاح
    const [success, setSuccess] = useState(null);

    const submitContact = async (formData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await postContactMessage(formData);

            if (res.data.status === "success") {
                setSuccess(res.data.message || "Message sent successfully!");
                // عرض إشعار إرسال الرسالة بنجاح
                toastContactSent();
                return res.data;
            } else {
                throw new Error(res.data.message || "Submission failed");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { submitContact, loading, error, success };
};
