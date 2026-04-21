import { useEffect, useState } from "react";
import { getCategories } from "../services/categories";

export const useCategories = (type = "") => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const res = await getCategories(type);
                setCategories(res.data.data || []);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [type]);

    return { categories, loading, error };
};