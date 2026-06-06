import { useEffect, useState } from "react";
import { getSolutions } from "../services/solutions";
import axios from "axios";

export const useSolutions = () => {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const fetchSolutions = async () => {
            try {
                setLoading(true);
                const res = await getSolutions({ signal: controller.signal });
                setSolutions(res.data.data || []);
            } catch (err) {
                if (axios.isCancel(err)) return;
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSolutions();
        return () => {
            controller.abort();
        };
    }, []); 

    return { solutions, loading, error };
};
