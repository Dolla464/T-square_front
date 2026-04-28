import { useEffect, useState } from "react";
import { getTestimonials } from "../services/testimonials";
import { MOCK_DATA } from "../data/mockData";

/**
 * هوك جلب التقييمات — useTestimonials
 * حالياً يرجّع الداتا من الموك، وجاهز يتحول للـ API لما يتسلم
 *
 * لما الـ API يكون جاهز:
 * 1. فك التعليق عن الكود الأصلي (fetchFromAPI)
 * 2. علّق أو امسح الكود الخاص بالموك (fetchFromMock)
 * 3. عدّل الـ keys لو أسماء الحقول اختلفت (name, role, stars, text, image)
 */
export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ───────────────────────────────────────────
    // الكود الأصلي — للاستخدام لما الـ API يكون جاهز
    // ───────────────────────────────────────────
    const fetchFromAPI = async () => {
      try {
        setLoading(true);
        const res = await getTestimonials();

        // TODO: عدّل الـ keys هنا لو الـ API بيرجع أسماء مختلفة
        // مثلاً: res.data.data.map(item => ({
        //   id: item.id,
        //   name: item.user_name,
        //   role: item.user_role,
        //   stars: item.rating,
        //   text: item.comment,
        //   image: item.avatar_url,
        // }))
        const data = res?.data?.data;
        setTestimonials(res?.data?.data || []);
        console.log(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFromAPI();

    // ───────────────────────────────────────────
    // الكود المؤقت — يجلب من الموك داتا
    // امسح الجزء دا لما الـ API يكون جاهز
    // ───────────────────────────────────────────
    // const fetchFromMock = () => {
    //     try {
    //         setLoading(true);
    //         // بنستخدم teamTestimonialsData كمصدر رئيسي
    //         const data = MOCK_DATA.teamTestimonialsData || MOCK_DATA.testimonialsData || [];
    //         setTestimonials(data);
    //     } catch (err) {
    //         setError(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    // fetchFromMock();
  }, []);

  return { testimonials, loading, error };
};
