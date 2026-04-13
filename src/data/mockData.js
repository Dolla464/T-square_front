export const MOCK_DATA = {
  // 1. المستخدمين والبيانات التعريفية (Users, Admins, Instructors, Students)
  users: [
    { id: 1, email: "student@example.com", role: "student" },
    { id: 2, email: "instructor@example.com", role: "instructor" }
  ],
  
  instructors: [
    { id: 1, user_id: 2, full_name: "د. أحمد علي", phone: "0100000000", bio: "خبير برمجة", status: "active" }
  ],

  students: [
    { id: 1, user_id: 1, full_name: "عادل محمد", enrollment_number: "STU-2026-001", group_id: 1, status: "active" }
  ],

  admins: [
    { id: 1, user_id: 3, full_name: "المدير العام", status: "active" }
  ],

  // 2. التصنيفات والوسوم (Categories & Tags)
  categories: [
    { id: 1, name: "Kids Courses", slug: "kids-courses", parent_id: null, status: "active" },
    { id: 2, name: "Adult Courses", slug: "adult-courses", parent_id: null, status: "active" },
    { id: 3, name: "Mobile Development", slug: "mobile-development", parent_id: 2, status: "active" },
    { id: 4, name: "Web Development", slug: "web-development", parent_id: 2, status: "active" },
    { id: 5, name: "Data Science", slug: "data-science", parent_id: 2, status: "active" },
    { id: 6, name: "Frontend", slug: "frontend", parent_id: 1, status: "active" },
    { id: 7, name: "Backend", slug: "backend", parent_id: 1, status: "active" },
  ],

  tags: [
    { id: 1, name: "React", slug: "react" },
    { id: 2, name: "Laravel", slug: "laravel" },
    { id: 3, name: "Python", slug: "python" },
    { id: 4, name: "Machine Learning", slug: "machine-learning" },
    { id: 5, name: "iOS", slug: "ios" }
  ],

  // 3. الكورسات وملحقاتها (Courses, Learnings, Previews, Learning Groups)
  courses: [
    {
      id: 1,
      title: "دورة ريأكت الاحترافية",
      slug: "react-pro-course",
      category_id: 2,
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Online",
      status: "published",
      is_free: false
    },
    {
      id: 2,
      title: "دورة لارافيل الاحترافية",
      slug: "laravel-pro-course",
      category_id: 3,
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Offline",
      status: "published",
      is_free: false
    },
    {
      id: 3,
      title: "دورة ريأكت الاحترافية",
      slug: "react-pro-course",
      category_id: 4,
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Hybrid",
      status: "published",
      is_free: false
    },
    {
      id: 4,
      title: "دورة ريأكت الاحترافية",
      slug: "react-pro-course",
      category_id: 5,
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Online",
      status: "published",
      is_free: false
    },
    {
      id: 5,
      title: "دورة لارافيل الاحترافية",
      slug: "laravel-pro-course",
      category_id: 6,
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Offline",
      status: "published",
      is_free: false
    },
    {
      id: 6,
      title: "دورة ريأكت الاحترافية",
      slug: "react-pro-course",
      category_id: 7,
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Hybrid",
      status: "published",
      is_free: false
    },
    {
      id: 7,
      title: "دورة ريأكت الاحترافية",
      slug: "react-pro-course",
      category_id: 3,
      instructor_id: 1,
      price: 1000,
      discount_price: 800,
      level: "intermediate",
      attendance_type: "Hybrid",
      status: "published",
      is_free: false
    },
  ],

  course_learnings: [
    { id: 1, course_id: 1, title: "بناء واجهات مستخدم متفاعلة" },
    { id: 2, course_id: 1, title: "التعامل مع APIs معقدة" }
  ],

  course_previews: [
    { id: 1, course_id: 1, title: "مقدمة الدورة", video_url: "url_here", video_provider: "youtube" }
  ],

  learning_groups: [
    { id: 1, group_name: "دفعة يناير 2026", course_id: 1, instructor_id: 1 }
  ],

  // 4. التجارة والاشتراكات (Orders & Enrollments)
  orders: [
    { id: 1, student_id: 1, total_amount: 800, status: "completed", billing_email: "student@example.com" }
  ],

  enrollments: [
    { id: 1, student_id: 1, course_id: 1, order_id: 1, price_paid: 800, is_completed: false }
  ],

  // 5. الاختبارات والنتائج (Exams, Questions, Choices, Attempts, Answers)
  exams: [
    { id: 1, course_id: 1, title: "امتحان الوحدة الأولى", duration: 20, total_marks: 50 }
  ],

  questions: [
    { id: 1, exam_id: 1, question_text: "ما هو الـ Virtual DOM؟", marks: 10 }
  ],

  choices: [
    { id: 1, question_id: 1, choice_text: "نسخة خفيفة من الـ DOM الحقيقي", is_correct: true },
    { id: 2, question_id: 1, choice_text: "قاعدة بيانات", is_correct: false }
  ],

  exam_attempts: [
    { id: 1, student_id: 1, exam_id: 1, score: 45, started_at: "2026-04-08 10:00:00" }
  ],

  answers: [
    { id: 1, attempt_id: 1, question_id: 1, choice_id: 1 }
  ],

  // 6. التقييمات والشهادات والرسائل (Reviews, Certificates, Messages, Solutions, Settings)
  course_reviews: [
    { id: 1, course_id: 1, student_id: 1, rating: 5, overall_comment: "ممتاز" },
    { id: 2, course_id: 1, student_id: 1, rating: 4.5, overall_comment: "جيد" },
    { id: 3, course_id: 1, student_id: 1, rating: 4, overall_comment: "جيد جداً" }
  ],

  certificates: [
    { id: 1, student_id: 1, course_id: 1, certificate_num: "CERT-123", issued_at: "2026-04-08" }
  ],

  messages: [
    { id: 1, name: "زائر", email: "visitor@test.com", title: "استفسار", content: "هل يوجد خصم؟" }
  ],

  solutions: [
    { id: 1, title: "حل مشكلة الـ Re-rendering", description: "استخدم UseMemo..." }
  ],

  settings: [
    { id: 1, key: "site_name", value: "منصتي التعليمية", group_name: "general" }
  ]
};