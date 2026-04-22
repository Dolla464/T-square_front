import { useEffect, useState } from "react";
import { getCourses } from "../services/courses";

export const useCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);

                const res = await getCourses();

                setCourses(res.data.data || []);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return { courses, loading, error };
};