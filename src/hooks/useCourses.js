import { useEffect, useState } from "react";
import { getCourses } from "../services/courses";

export const useCourses = (params = {}) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);

                const res = await getCourses(params);

                setCourses(res.data.data || []);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [JSON.stringify(params)]);

    return { courses, loading, error };
};