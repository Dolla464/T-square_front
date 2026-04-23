import { useEffect, useState } from "react";
import { getInstructors } from "../services/instructors";

export const useInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                setLoading(true);

                const res = await getInstructors();

                // تحديث حالة المدربين بالبيانات الراجعة
                setInstructors(res.data.data || []);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructors();
    }, []);

    return { instructors, loading, error };
};
