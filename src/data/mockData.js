export const MOCK_DATA = {
  // 1. المستخدمين والبيانات التعريفية (Users, Admins, Instructors, Students)
  users: [
    { id: 1, email: "student@example.com", role: "student" },
    { id: 2, email: "instructor@example.com", role: "instructor" },
  ],

  instructors: [
    {
      id: 1,
      user_id: 2,
      full_name: "د. أحمد علي",
      phone: "0100000000",
      bio: "خبير برمجة",
      status: "active",
    },
  ],

  students: [
    {
      id: 1,
      user_id: 1,
      full_name: "عادل محمد",
      enrollment_number: "STU-2026-001",
      group_id: 1,
      status: "active",
    },
  ],

  admins: [{ id: 1, user_id: 3, full_name: "المدير العام", status: "active" }],

  // 2. التصنيفات والوسوم (Categories & Tags)
  categories: [
    // TRACKS (ROOT)
    { id: 1, name: "Frontend", slug: "frontend", parent_id: null },
    { id: 2, name: "Backend", slug: "backend", parent_id: null },
    { id: 3, name: "Full Stack", slug: "full-stack", parent_id: null },
    { id: 4, name: "Data Science", slug: "data-science", parent_id: null },
    {
      id: 5,
      name: "Machine Learning",
      slug: "machine-learning",
      parent_id: null,
    },

    { id: 7, name: "Children", slug: "children", parent_id: null },

    // FRONTEND CHILDREN
    { id: 8, name: "React", slug: "react", parent_id: 1 },
    { id: 9, name: "JavaScript", slug: "javascript", parent_id: 1 },
    { id: 10, name: "HTML & CSS", slug: "html-css", parent_id: 1 },

    // BACKEND CHILDREN
    { id: 11, name: "Node.js", slug: "nodejs", parent_id: 2 },
    { id: 12, name: "Laravel", slug: "laravel", parent_id: 2 },

    // FULL STACK CHILDREN
    { id: 13, name: "MERN Stack", slug: "mern", parent_id: 3 },

    // DATA SCIENCE CHILDREN
    { id: 14, name: "Python for Data", slug: "python-data", parent_id: 4 },
    { id: 15, name: "Statistics", slug: "statistics", parent_id: 4 },

    // ML CHILDREN
    { id: 16, name: "Deep Learning", slug: "deep-learning", parent_id: 5 },
    { id: 17, name: "NLP", slug: "nlp", parent_id: 5 },

    // CHILDREN CHILDREN
    { id: 20, name: "Kids Coding", slug: "kids-coding", parent_id: 7 },
    { id: 21, name: "Creative Drawing", slug: "drawing", parent_id: 7 },
  ],

  tags: [
    { id: 1, name: "React", slug: "react" },
    { id: 2, name: "Laravel", slug: "laravel" },
    { id: 3, name: "Python", slug: "python" },
    { id: 4, name: "Machine Learning", slug: "machine-learning" },
    { id: 5, name: "iOS", slug: "ios" },
  ],

  // دي داتا صفحة السوليوشن
  solutionsData: [
    {
      id: 1,
      title: "Web Development",
      description:
        "Custom websites and landing pages built with modern frameworks for speed, SEO, and scalability.",
      tags: ["CRM systems", "Admin panels", "Booking platforms"],
    },
    {
      id: 2,
      title: "Web Applications",
      description:
        "Full-featured SaaS platforms, dashboards, and internal tools tailored to your business needs.",
      tags: ["CRM systems", "Admin panels", "Booking platforms"],
    },
    {
      id: 3,
      title: "Mobile Applications",
      description:
        "Cross-platform iOS and Android apps with native-like performance using Flutter.",
      tags: ["Firebase", "React Native", "Flutter"],
    },
    {
      id: 4,
      title: "UI/UX Design",
      description:
        "User-centered design that converts. From wireframes to polished, pixel-perfect interfaces.",
      tags: ["CRM systems", "Admin panels", "Booking platforms"],
    },
    {
      id: 5,
      title: "AI Solutions",
      description:
        "Intelligent automation, chatbots, recommendation engines, and data-driven decision tools.",
      tags: ["CRM systems", "Admin panels", "Booking platforms"],
    },
    {
      id: 6,
      title: "E-commerce Solutions",
      description:
        "End-to-end online stores with payment integration, inventory management, and analytics.",
      tags: ["Shopify custom", "Custom stores", "Marketplace"],
    },
  ],

  testimonialsData: [
    {
      id: 1,
      name: "Salwa Alaa",
      role: "Full Stack Developer @ TechCorp",
      image:
        "https://ui-avatars.com/api/?name=Salwa+Alaa&background=eee&color=333",
      stars: 4,
      text: "T-Square transformed my career. I went from zero coding experience to a full-time developer role in just 6 months. The hands-on projects and mentorship were invaluable.",
    },
    {
      id: 2,
      name: "Salwa Alaa",
      role: "Full Stack Developer @ TechCorp",
      image:
        "https://ui-avatars.com/api/?name=Salwa+Alaa&background=eee&color=333",
      stars: 4,
      text: "T-Square transformed my career. I went from zero coding experience to a full-time developer role in just 6 months. The hands-on projects and mentorship were invaluable.",
    },
    {
      id: 3,
      name: "Salwa Alaa",
      role: "Full Stack Developer @ TechCorp",
      image:
        "https://ui-avatars.com/api/?name=Salwa+Alaa&background=eee&color=333",
      stars: 4,
      text: "T-Square transformed my career. I went from zero coding experience to a full-time developer role in just 6 months. The hands-on projects and mentorship were invaluable.",
    },
  ],

  // 3. الكورسات وملحقاتها (Courses, Learnings, Previews, Learning Groups)
  courses: [
    {
      id: 1,
      title: "React Professional Course",
      slug: "react-pro-course",
      category_id: 8, // React
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Online",
      status: "published",
      is_free: false,
    },
    {
      id: 2,
      title: "Laravel Backend Development",
      slug: "laravel-backend-course",
      category_id: 10, // Laravel
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Offline",
      status: "published",
      is_free: false,
    },
    {
      id: 3,
      title: "JavaScript Fundamentals",
      slug: "javascript-fundamentals",
      category_id: 7, // JavaScript
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "beginner",
      attendance_type: "Hybrid",
      status: "published",
      is_free: false,
    },
    {
      id: 4,
      title: "Node.js API Development",
      slug: "nodejs-api-development",
      category_id: 9, // Node.js
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Online",
      status: "published",
      is_free: false,
    },
    {
      id: 5,
      title: "MERN Stack Masterclass",
      slug: "mern-stack-masterclass",
      category_id: 11, // MERN
      instructor_id: 1,
      price: 1200,
      discount_price: 900,
      level: "advanced",
      attendance_type: "Online",
      status: "published",
      is_free: false,
    },
    {
      id: 6,
      title: "Python for Data Science",
      slug: "python-data-science",
      category_id: 13, // Python for Data
      instructor_id: 1,
      price: 1100,
      discount_price: 850,
      level: "intermediate",
      attendance_type: "Hybrid",
      status: "published",
      is_free: false,
    },
    {
      id: 7,
      title: "Deep Learning Essentials",
      slug: "deep-learning-essentials",
      category_id: 15, // Deep Learning
      instructor_id: 1,
      price: 1300,
      discount_price: 1000,
      level: "advanced",
      attendance_type: "Online",
      status: "published",
      is_free: false,
    },
    {
      id: 8,
      title: "Machine Learning Fundamentals",
      slug: "machine-learning-fundamentals",
      category_id: 5, // Machine Learning (root)
      instructor_id: 1,
      price: 1200,
      discount_price: 950,
      level: "intermediate",
      attendance_type: "Online",
      status: "published",
      is_free: false,
    },
    {
      id: 9,
      title: "Deep Learning with Neural Networks",
      slug: "deep-learning-neural-networks",
      category_id: 16, // Deep Learning
      instructor_id: 1,
      price: 1400,
      discount_price: 1100,
      level: "advanced",
      attendance_type: "Online",
      status: "published",
      is_free: false,
    },
    {
      id: 10,
      title: "Natural Language Processing (NLP)",
      slug: "nlp-course",
      category_id: 17, // NLP
      instructor_id: 1,
      price: 1300,
      discount_price: 1000,
      level: "advanced",
      attendance_type: "Hybrid",
      status: "published",
      is_free: false,
    },
  ],
  teamData: [
    {
      id: 1,
      name: "Salwa Alaa",
      role: "Team Lead",

      socials: { email: "#", instagram: "#", linkedin: "#", facebook: "#" },
    },
    {
      id: 2,
      name: "Salwa Alaa",
      role: "Team Lead",

      socials: { email: "#", instagram: "#", linkedin: "#", facebook: "#" },
    },
    {
      id: 3,
      name: "Salwa Alaa",
      role: "Team Lead",

      socials: { email: "#", instagram: "#", linkedin: "#", facebook: "#" },
    },
    {
      id: 4,
      name: "Salwa Alaa",
      role: "Team Lead",

      socials: { email: "#", instagram: "#", linkedin: "#", facebook: "#" },
    },
    {
      id: 5,
      name: "Salwa Alaa",
      role: "Team Lead",

      socials: { email: "#", instagram: "#", linkedin: "#", facebook: "#" },
    },
    {
      id: 6,
      name: "Salwa Alaa",
      role: "Team Lead",

      socials: { email: "#", instagram: "#", linkedin: "#", facebook: "#" },
    },
    {
      id: 7,
      name: "Salwa Alaa",
      role: "Team Lead",

      socials: { email: "#", instagram: "#", linkedin: "#", facebook: "#" },
    },
    {
      id: 8,
      name: "Salwa Alaa",
      role: "Team Lead",

      socials: { email: "#", instagram: "#", linkedin: "#", facebook: "#" },
    },
  ],
  teamTestimonialsData: [
    {
      id: 1,
      name: "Salwa Alaa",
      role: "Full Stack Developer @ TechCorp",
      stars: 4,
      text: "T-Square transformed my career. I went from zero coding experience to a full-time developer role in just 6 months. The hands-on projects and mentorship were invaluable.",
    },
    {
      id: 2,
      name: "Salwa Alaa",
      role: "Full Stack Developer @ TechCorp",
      stars: 4,
      text: "T-Square transformed my career. I went from zero coding experience to a full-time developer role in just 6 months. The hands-on projects and mentorship were invaluable.",
    },
    {
      id: 3,
      name: "Salwa Alaa",
      role: "Full Stack Developer @ TechCorp",
      stars: 4,
      text: "T-Square transformed my career. I went from zero coding experience to a full-time developer role in just 6 months. The hands-on projects and mentorship were invaluable.",
    },
  ],

  course_learnings: [
    { id: 1, course_id: 1, title: "بناء واجهات مستخدم متفاعلة" },
    { id: 2, course_id: 1, title: "التعامل مع APIs معقدة" },
  ],

  course_previews: [
    {
      id: 1,
      course_id: 1,
      title: "مقدمة الدورة",
      video_url: "url_here",
      video_provider: "youtube",
    },
  ],

  learning_groups: [
    { id: 1, group_name: "دفعة يناير 2026", course_id: 1, instructor_id: 1 },
  ],

  // 4. التجارة والاشتراكات (Orders & Enrollments)
  orders: [
    {
      id: 1,
      student_id: 1,
      total_amount: 800,
      status: "completed",
      billing_email: "student@example.com",
    },
  ],

  enrollments: [
    {
      id: 1,
      student_id: 1,
      course_id: 1,
      order_id: 1,
      price_paid: 800,
      is_completed: false,
    },
  ],

  // 5. الاختبارات والنتائج (Exams, Questions, Choices, Attempts, Answers)
  exams: [
    {
      id: 1,
      course_id: 1,
      title: "امتحان الوحدة الأولى",
      duration: 20,
      total_marks: 50,
    },
  ],

  questions: [
    { id: 1, exam_id: 1, question_text: "ما هو الـ Virtual DOM؟", marks: 10 },
  ],

  choices: [
    {
      id: 1,
      question_id: 1,
      choice_text: "نسخة خفيفة من الـ DOM الحقيقي",
      is_correct: true,
    },
    { id: 2, question_id: 1, choice_text: "قاعدة بيانات", is_correct: false },
  ],

  exam_attempts: [
    {
      id: 1,
      student_id: 1,
      exam_id: 1,
      score: 45,
      started_at: "2026-04-08 10:00:00",
    },
  ],

  answers: [{ id: 1, attempt_id: 1, question_id: 1, choice_id: 1 }],

  // 6. التقييمات والشهادات والرسائل (Reviews, Certificates, Messages, Solutions, Settings)
  course_reviews: [
    { id: 1, course_id: 1, student_id: 1, rating: 5, overall_comment: "ممتاز" },
    { id: 2, course_id: 1, student_id: 1, rating: 4.5, overall_comment: "جيد" },
    {
      id: 3,
      course_id: 1,
      student_id: 1,
      rating: 4,
      overall_comment: "جيد جداً",
    },
  ],

  certificates: [
    {
      id: 1,
      student_id: 1,
      course_id: 1,
      certificate_num: "CERT-123",
      issued_at: "2026-04-08",
    },
  ],

  messages: [
    {
      id: 1,
      name: "زائر",
      email: "visitor@test.com",
      title: "استفسار",
      content: "هل يوجد خصم؟",
    },
  ],

  solutions: [
    {
      id: 1,
      title: "حل مشكلة الـ Re-rendering",
      description: "استخدم UseMemo...",
    },
  ],

  settings: [
    {
      id: 1,
      key: "site_name",
      value: "منصتي التعليمية",
      group_name: "general",
    },
  ],
};
