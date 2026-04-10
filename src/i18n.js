import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "home": "Home",
      "courses": "Courses",
      "solutions": "Software Solutions",
      "team": "Our team",
      "contact": "Contact us",
      "login": "Log in",
      "signup": "Sign up",
      "welcome": "Welcome to T-SQUARE",
      "hero_title_start": "Start Your Tech Journey with",
      "hero_title_highlight": "Confidence",
      "hero_subtitle": "Master programming, design, AI, and more through structured learning paths, hands-on projects, and real mentorship support.",
      "contact_us": "Contact us",
      "explore_courses": "Explore Courses",
      "profile": "My Profile",
      "About_T-Square": "About T-Square",
      "We_Don't_Just_Teach_Code": "We Don't Just Teach Code.",
      "We_Build_Careers": "We Build Careers.",
      "tsquare_info": "T-Square is a software academy and solutions company on a mission to bridge the gap between education and industry. Our programs combine cutting-edge curriculum with real project experience,preparing students for immediate impact in the tech world.",
      "tsquare_info2": "Whether you're 6 or 60, a student or a career shifter — there's a path for you at T-Square.",
      "my_courses": "My Courses",
      "course_details": "Course Details",
      "watch_video": "Watch Video",
      "logout": "Logout"
    }
  },
  ar: {
    translation: {
      "home": "الرئيسية",
      "courses": "الكورسات",
      "solutions": "حلول البرمجيات",
      "team": "فريقنا",
      "contact": "تواصل معنا",
      "login": "تسجيل الدخول",
      "signup": "إنشاء حساب",
      "welcome": "أهلاً بك في تي سكوير",
      "hero_title_start": "ابدأ رحلتك التقنية بـ",
      "hero_title_highlight": "ثقة",
      "hero_subtitle": "احترف البرمجة، التصميم، الذكاء الاصطناعي، والمزيد من خلال مسارات تعليمية منظمة، مشاريع عملية، ودعم إرشادي حقيقي.",
      "contact_us": "تواصل معنا",
      "explore_courses": "اكتشف الكورسات",
      "profile": "ملفي الشخصي",
      "About_T-Square": "نبذه عن T-Square",
      "We_Don't_Just_Teach_Code": "نحن لا نعلم الكود فقط.", 
      "We_Build_Careers": "نحن نبني مسيرة مهنية.",
      "tsquare_info": "T-square هي أكاديمية برمجيات وشركة حلول تهدف إلى سد الفجوة بين التعليم والصناعة. تجمع برامجنا بين منهجية متطورة وتجربة مشاريع حقيقية، مما يجهز الطلاب لتأثير فوري في عالم التكنولوجيا.",
      "tsquare_info2": "سواء كنت في السادسة من عمرك أو الستين، طالبًا أو محولًا مهنيًا - هناك مسار لك في T-Square.",
      "my_courses": "كورساتي",
      "course_details": "تفاصيل الكورس",
      "watch_video": "مشاهدة الفيديو",
      "logout": "تسجيل الخروج"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallBackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;