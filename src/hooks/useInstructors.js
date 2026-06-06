import { useEffect, useState } from "react";
import { getInstructors } from "../services/instructors";
import { cache } from "../utils/cache";

export const useInstructors = () => {
    const [instructors, setInstructors] = useState(() => {
        return cache.get("instructors_data") || [];
    });
    const [loading, setLoading] = useState(() => {
        return !cache.get("instructors_data");
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const cached = cache.get("instructors_data");
        const isStale = cache.isStale("instructors_data", 120000);

        if (cached && !isStale) {
            setLoading(false);
            return;
        }

        const fetchInstructors = async () => {
            try {
                if (!cached) setLoading(true);

                const res = await getInstructors();

                // تحديث حالة المدربين بالبيانات الراجعة
                const data = res?.data?.data || [];
                cache.set("instructors_data", data);
                setInstructors(data);

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
