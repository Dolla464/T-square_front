export const REVIEW_GROUPS = [
  {
    key: "course",
    icon: "bi-journal-bookmark-fill",
    titleEn: "Group 1: Course & Content",
    titleAr: "المجموعة 1: الكورس والمحتوى",
    questions: [
      {
        id: "course_organization",
        en: "The course content was well-organized and easy to follow.",
        ar: "كان محتوى الكورس منظمًا وسهل المتابعة.",
      },
      {
        id: "course_materials",
        en: "The learning materials (videos, slides, resources) were clear and helpful.",
        ar: "كانت المواد التعليمية (فيديوهات، شرائح، مصادر) واضحة ومفيدة.",
      },
      {
        id: "course_difficulty",
        en: "The course difficulty level matched my expectations and prior knowledge.",
        ar: "مستوى صعوبة الكورس كان متوافقًا مع توقعاتي ومعرفتي السابقة.",
      },
      {
        id: "course_assessments",
        en: "The assignments and assessments accurately measured my understanding.",
        ar: "الواجبات والاختبارات قاست فهمي بدقة.",
      },
      {
        id: "course_practical_skills",
        en: "I gained practical skills and knowledge I can apply in real scenarios.",
        ar: "اكتسبت مهارات ومعرفة عملية يمكنني تطبيقها في مواقف حقيقية.",
      },
    ],
  },
  {
    key: "center",
    icon: "bi-building",
    titleEn: "Group 2: Center",
    titleAr: "المجموعة 2: السنتر",
    questions: [
      {
        id: "center_facilities",
        en: "The physical facilities (classrooms, seating, lighting, AC) were comfortable and well-maintained.",
        ar: "كانت المرافق الفعلية (قاعات، مقاعد، إضاءة، تكييف) مريحة ومحافظ عليها جيدًا.",
      },
      {
        id: "center_location",
        en: "The center's location and accessibility (parking, transport) were convenient for me.",
        ar: "موقع السنتر وسهولة الوصول إليه (مواقف، مواصلات) كان مناسبًا لي.",
      },
      {
        id: "center_staff",
        en: "The administrative staff at the center were helpful, professional, and responsive.",
        ar: "كان الموظفون الإداريون في السنتر متعاونين ومحترفين وسريعي الاستجابة.",
      },
      {
        id: "center_environment",
        en: "The overall center environment (cleanliness, safety, atmosphere) was satisfactory.",
        ar: "كان البيئة العامة للسنتر (نظافة، أمان، أجواء) مرضية.",
      },
      {
        id: "center_platform",
        en: "The online learning platform was user-friendly and easy to navigate.",
        ar: "كانت منصة التعلم الإلكتروني سهلة الاستخدام والتنقل.",
      },
    ],
  },
  {
    key: "instructor",
    icon: "bi-person-badge-fill",
    titleEn: "Group 3: Instructor",
    titleAr: "المجموعة 3: المحاضر",
    questions: [
      {
        id: "instructor_knowledge",
        en: "The instructor demonstrated deep knowledge of the subject matter.",
        ar: "أظهر المحاضر معرفة عميقة بموضوع الكورس.",
      },
      {
        id: "instructor_clarity",
        en: "The instructor explained complex concepts in a clear and understandable way.",
        ar: "شرح المحاضر للمفاهيم المعقدة كان واضحًا ومفهومًا.",
      },
      {
        id: "instructor_responsive",
        en: "The instructor was responsive to questions and provided helpful feedback.",
        ar: "كان المحاضر متجاوبًا مع الأسئلة وقدم ملاحظات مفيدة.",
      },
      {
        id: "instructor_engaging",
        en: "The instructor kept the sessions engaging and maintained my interest.",
        ar: "حافظ المحاضر على تفاعل الجلسات واهتمامي.",
      },
      {
        id: "instructor_fair",
        en: "The instructor was fair in grading and assessment.",
        ar: "كان المحاضر عادلاً في التقييم والاختبارات.",
      },
    ],
  },
];

export const ALL_QUESTION_IDS = REVIEW_GROUPS.flatMap((group) =>
  group.questions.map((q) => q.id)
);
