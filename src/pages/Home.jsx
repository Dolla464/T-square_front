// src/pages/Home.jsx
import Hero from "../components/home/Hero";
import CourseTicker from "../components/home/CourseTicker";
import About from "../components/home/About";
import Discovery from "../components/home/Discovery";
import Features from "../components/home/Features";
import Courses from "../components/home/Courses";
import Testimonials from "../components/home/Testimonials";
import FAQ from "../components/home/FAQ";
import { useHeroAndAboutData } from "../hooks/useDiscovery";
import LoadingSpiner from "../LoadingSpiner";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { heroImage, aboutImages, heroSettings, loading } = useHeroAndAboutData();
  const { i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";

  if (loading) {
    return <LoadingSpiner />;
  }

  return (
    <>
      <Helmet>
        <title>{isArabic ? "الرئيسية - T-Square | كورسات تقنية وحلول رقمية" : "Home - T-Square | Tech Courses & Digital Solutions"}</title>
        <meta name="description" content={isArabic 
          ? "منصة T-Square تقدم كورسات تدريبية وحلول برمجية وتقنية متكاملة في مصر والسعودية. تعلم البرمجة، تصميم المواقع، وتطوير التطبيقات."
          : "T-Square platform provides professional programming training, software development, and digital solutions in Egypt and Saudi Arabia."
        } />
        <link rel="canonical" href={window.location.origin} />
        <meta property="og:title" content={isArabic ? "منصة T-Square للتدريب والحلول الرقمية" : "T-Square Platform for Tech Training & Digital Solutions"} />
        <meta property="og:description" content={isArabic 
          ? "تعلم المهارات التقنية الحديثة ونفذ مشاريع حقيقية مع خبراء البرمجيات."
          : "Learn modern tech skills and build real-world projects with software experts."
        } />
        <meta property="og:url" content={window.location.origin} />
        <meta property="og:type" content="website" />
      </Helmet>
      <Hero heroImage={heroImage} heroSettings={heroSettings} />
      <CourseTicker />
      <About aboutImages={aboutImages} />
      <Features />
      <Courses />
      <Discovery />
      <Testimonials />
      <FAQ />
    </>
  );
};

export default Home;

