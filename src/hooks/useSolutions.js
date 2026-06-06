import { useEffect, useState } from "react";
import { getSolutions } from "../services/solutions";
import { cache } from "../utils/cache";
import axios from "axios";

export const useSolutions = () => {
    const [solutions, setSolutions] = useState(() => {
        return cache.get("solutions_data") || [];
    });
    const [loading, setLoading] = useState(() => {
        return !cache.get("solutions_data");
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const cached = cache.get("solutions_data");
        const isStale = cache.isStale("solutions_data", 120000);

        if (cached && !isStale) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const fetchSolutions = async () => {
            try {
                if (!cached) setLoading(true);
                const res = await getSolutions({ signal: controller.signal });
                const data = res?.data?.data || [];
                cache.set("solutions_data", data);
                setSolutions(data);
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
