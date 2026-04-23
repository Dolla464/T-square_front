import { useState, useEffect } from "react";
import { DASHBOARD_MOCK } from "../data/dashboardMockData";
// import { getStudentCertificates } from "../services/dashboardService"; // فعّل عند توفر الـ API

export const useCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [certStats, setCertStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // ── TODO: استبدل بالكود ده لما الـ API يكون جاهز ──
        // const fetchFromAPI = async () => {
        //     try {
        //         const res = await getStudentCertificates();
        //         setCertificates(res.data.data.certificates);
        //         setCertStats(res.data.data.stats);
        //     } catch (err) { setError(err); }
        //     finally { setLoading(false); }
        // };
        // fetchFromAPI();

        setTimeout(() => {
            setCertificates(DASHBOARD_MOCK.certificates);
            setCertStats(DASHBOARD_MOCK.certStats);
            setLoading(false);
        }, 300);
    }, []);

    return { certificates, certStats, loading, error };
};
