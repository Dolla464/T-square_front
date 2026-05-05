import { useState, useEffect } from "react";
import { getStudentCertificates } from "../services/dashboardService";

export const useCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getStudentCertificates();
                const data = res?.data?.data;
                setCertificates(Array.isArray(data) ? data : []);


            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    return { certificates, loading, error };
};