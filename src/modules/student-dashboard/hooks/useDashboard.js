import { useState, useEffect } from "react";
import { DASHBOARD_MOCK } from "../data/dashboardMockData";
// import { getStudentDashboard } from "../services/dashboardService"; // فعّل عند توفر الـ API

/**
 * هوك بيانات الداشبورد الرئيسية
 * حالياً يجلب من الموك — جاهز للتحول للـ API
 *
 * لما الـ API يكون جاهز:
 * 1. فك التعليق عن fetchFromAPI
 * 2. احذف fetchFromMock
 * 3. عدّل الـ keys لو أسماء الحقول اختلفت
 */
export const useDashboard = () => {
    const [stats, setStats] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [continueLearning, setContinueLearning] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // ── TODO: استبدل بالكود ده لما الـ API يكون جاهز ──
        // const fetchFromAPI = async () => {
        //     try {
        //         const res = await getStudentDashboard();
        //         setStats(res.data.data.stats);
        //         setEnrolledCourses(res.data.data.courses);
        //         setContinueLearning(res.data.data.continue_learning);
        //     } catch (err) { setError(err); }
        //     finally { setLoading(false); }
        // };
        // fetchFromAPI();

        // ── بيانات وهمية مؤقتة ──
        setTimeout(() => {
            setStats(DASHBOARD_MOCK.stats);
            setEnrolledCourses(DASHBOARD_MOCK.enrolledCourses);
            setContinueLearning(DASHBOARD_MOCK.continueLearning);
            setLoading(false);
        }, 300);
    }, []);

    return { stats, enrolledCourses, continueLearning, loading, error };
};
