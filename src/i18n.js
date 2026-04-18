import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// English namespaces
import enNavbar from "./locales/en/navbar.json";
import enHome from "./locales/en/home.json";
import enDiscovery from "./locales/en/discovery.json";
import enCourses from "./locales/en/courses.json";
import enCoursesCard from "./locales/en/coursesCard.json";
import enContact from "./locales/en/contact.json";
import enSolutions from "./locales/en/solutions.json";
import enTeam from "./locales/en/team.json";
import enCTA from "./locales/en/cta.json";
import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enUser from "./locales/en/user.json";
import enTestimonials from "./locales/en/testimonials.json";
import enFeatures from "./locales/en/features.json";
import enFaq from "./locales/en/faq.json";
import enFooter from "./locales/en/footer.json";

// Arabic namespaces
import arNavbar from "./locales/ar/navbar.json";
import arHome from "./locales/ar/home.json";
import arDiscovery from "./locales/ar/discovery.json";
import arCourses from "./locales/ar/courses.json";
import arCoursesCard from "./locales/ar/coursesCard.json";
import arContact from "./locales/ar/contact.json";
import arSolutions from "./locales/ar/solutions.json";
import arTeam from "./locales/ar/team.json";
import arCTA from "./locales/ar/cta.json";
import arCommon from "./locales/ar/common.json";
import arAuth from "./locales/ar/auth.json";
import arUser from "./locales/ar/user.json";
import arTestimonials from "./locales/ar/testimonials.json";
import arFeatures from "./locales/ar/features.json";
import arFaq from "./locales/ar/faq.json";
import arFooter from "./locales/ar/footer.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        navbar: enNavbar,
        home: enHome,
        discovery: enDiscovery,
        courses: enCourses,
        coursesCard: enCoursesCard,
        contact: enContact,
        solutions: enSolutions,
        team: enTeam,
        cta: enCTA,
        common: enCommon,
        auth: enAuth,
        user: enUser,
        testimonials: enTestimonials,
        features: enFeatures,
        faq: enFaq,
        footer: enFooter,
      },
      ar: {
        navbar: arNavbar,
        home: arHome,
        discovery: arDiscovery,
        courses: arCourses,
        coursesCard: arCoursesCard,
        contact: arContact,
        solutions: arSolutions,
        team: arTeam,
        cta: arCTA,
        common: arCommon,
        auth: arAuth,
        user: arUser,
        testimonials: arTestimonials,
        features: arFeatures,
        faq: arFaq,
        footer: arFooter,
      },
    },

    lng: localStorage.getItem("i18nextLng") || "en",
    fallbackLng: "en",

    ns: [
      "navbar",
      "home",
      "courses",
      "contact",
      "solutions",
      "team",
      "cta",
      "common",
      "auth",
      "user",
      "testimonials",
      "features",
      "faq",
      "footer",
    ],
    defaultNS: "common",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
