import { useEffect, useState } from "react";
import { getSolutions } from "../services/solutions";

export const useSolutions = () => {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSolutions = async () => {
            try {
                setLoading(true);

                const res = await getSolutions();

                // تحديث حالة الحلول بالبيانات الراجعة
                setSolutions(res.data.data || []);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSolutions();
    }, []); 

    return { solutions, loading, error };
};
