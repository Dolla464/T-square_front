import { useState } from "react";
import { postContactMessage } from "../services/contact";
import { toastContactSent, toastError } from "../components/shared/Toaster/toaster";

export const useContact = () => {
    // حالة التحميل
    const [loading, setLoading] = useState(false);
    const submitContact = async (formData) => {
        setLoading(true);

        try {
            const res = await postContactMessage(formData);

            if (res.data.status === "success") {
                toastContactSent();
                return res.data;
            } else {
                throw new Error(res.data.message || "Submission failed");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong. Please try again.";
            toastError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { submitContact, loading };
};
