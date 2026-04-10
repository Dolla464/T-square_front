// src/pages/Home.jsx
import Hero from "../components/home/Hero";
import CourseTicker from "../components/home/CourseTicker";
import About from "../components/home/About";
import Discovery from "../components/home/Discovery";
import Features from "../components/home/Features";
import Courses from "../components/home/Courses";
import Testimonials from "../components/home/Testimonials";
import FAQ from "../components/home/FAQ";

const Home = () => (
  <>
    <Hero />
    <CourseTicker />
    <About />
    <Features />
    <Courses />
    <Discovery />
    <Testimonials />
    <FAQ />
  </>
);

export default Home;
