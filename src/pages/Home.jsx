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

const Home = () => {
  const { heroImage, aboutImages, heroSettings, loading } = useHeroAndAboutData();

  if (loading) {
    return <LoadingSpiner />;
  }

  return (
    <>
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

