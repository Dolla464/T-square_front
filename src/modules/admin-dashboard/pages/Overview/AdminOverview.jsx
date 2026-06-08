import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminOverview() {
  const { t, i18n } = useTranslation("adminDashboard", { keyPrefix: "overview" });
  const isArabic = i18n.language?.startsWith("ar");
  const navigate = useNavigate();

  const [revenueTimeframe, setRevenueTimeframe] = React.useState("month");
  const [salesTimeframe, setSalesTimeframe] = React.useState("month");

  // Mock data for Latest Enrollments
  const latestEnrollments = [
    {
      id: 1,
      name: "Sarah Johnson",
      course: "Complete Web Development Bootcamp",
      time: isArabic ? "منذ ساعتين" : "2h ago",
      initials: "SJ",
      bg: "#fee2e2",
      color: "#ef4444"
    },
    {
      id: 2,
      name: "Michael Chen",
      course: "Data Science with Python",
      time: isArabic ? "منذ 4 ساعات" : "4h ago",
      initials: "MC",
      bg: "#e0f2fe",
      color: "#0ea5e9"
    },
    {
      id: 3,
      name: "Emma Wilson",
      course: "UI/UX Design Masterclass",
      time: isArabic ? "منذ 5 ساعات" : "5h ago",
      initials: "EW",
      bg: "#f3e8ff",
      color: "#a855f7"
    },
    {
      id: 4,
      name: "David Brown",
      course: "Digital Marketing Strategy",
      time: isArabic ? "منذ 6 ساعات" : "6h ago",
      initials: "DB",
      bg: "#e2f9eb",
      color: "#22c55e"
    }
  ];

  // Mock data for Recent Orders
  const recentOrders = [
    {
      id: 1,
      name: "Alex Martinez",
      course: "React Advanced Course",
      status: isArabic ? "مكتمل" : "completed",
      price: "$89.99"
    },
    {
      id: 2,
      name: "Sophia Rodriguez",
      course: "Machine Learning Foundations",
      status: isArabic ? "مكتمل" : "completed",
      price: "$99.99"
    },
    {
      id: 3,
      name: "William Taylor",
      course: "DevOps & CI/CD Masterclass",
      status: isArabic ? "مكتمل" : "completed",
      price: "$79.99"
    },
    {
      id: 4,
      name: "James Anderson",
      course: "Cloud Architecture with AWS",
      status: isArabic ? "مكتمل" : "completed",
      price: "$119.99"
    }
  ];

  // Mock data for Top Performing Courses
  const topCourses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      students: isArabic ? "1,245 طالب" : "1,245 students",
      rating: "4.8",
      revenue: "$54,380"
    },
    {
      id: 2,
      title: "Data Science with Python",
      students: isArabic ? "892 طالب" : "892 students",
      rating: "4.9",
      revenue: "$42,150"
    },
    {
      id: 3,
      title: "UI/UX Design Masterclass",
      students: isArabic ? "756 طالب" : "756 students",
      rating: "4.7",
      revenue: "$38,920"
    }
  ];

  // Data for Revenue Over Time Line Chart
  const revenueConfigs = {
    week: {
      labels: isArabic
        ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
        : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
      data: [1200, 2100, 1800, 3000, 2500, 4200, 3800],
      max: 5000,
      stepSize: 1000
    },
    month: {
      labels: isArabic
        ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      data: [12000, 15000, 13500, 18000, 21500, 20000, 24500],
      max: 30000,
      stepSize: 6000
    },
    year: {
      labels: ["2021", "2022", "2023", "2024", "2025", "2026"],
      data: [85000, 110000, 135000, 120000, 145000, 160000],
      max: 200000,
      stepSize: 40000
    }
  };

  const currentRevenueConfig = revenueConfigs[revenueTimeframe];

  const revenueData = {
    labels: currentRevenueConfig.labels,
    datasets: [
      {
        label: isArabic ? "الإيرادات" : "Revenue",
        data: currentRevenueConfig.data,
        borderColor: "#be1522",
        backgroundColor: "rgba(190, 21, 34, 0.05)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#be1522",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        min: 0,
        max: currentRevenueConfig.max,
        ticks: {
          stepSize: currentRevenueConfig.stepSize,
          color: "#888",
          font: {
            size: 10
          }
        },
        grid: {
          color: "#f1f3f5",
          tickBorderDash: [3, 3],
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: "#888",
          font: {
            size: 10
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Data for Course Sales Bar Chart
  const salesConfigs = {
    week: {
      data: [45, 30, 25, 20, 15],
      max: 50,
      stepSize: 10
    },
    month: {
      data: [250, 190, 170, 140, 95],
      max: 300,
      stepSize: 60
    },
    year: {
      data: [1420, 1150, 980, 810, 520],
      max: 1600,
      stepSize: 320
    }
  };

  const currentSalesConfig = salesConfigs[salesTimeframe];

  const salesData = {
    labels: [
      isArabic ? "تطوير الويب" : "Dev",
      isArabic ? "علم البيانات" : "Data Sci",
      isArabic ? "التصميم" : "Design",
      isArabic ? "التسويق" : "Marketing",
      isArabic ? "تطوير الموبايل" : "Mobile"
    ],
    datasets: [
      {
        label: isArabic ? "المبيعات" : "Sales",
        data: currentSalesConfig.data,
        backgroundColor: "#be1522",
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 30
      }
    ]
  };

  const salesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        min: 0,
        max: currentSalesConfig.max,
        ticks: {
          stepSize: currentSalesConfig.stepSize,
          color: "#888",
          font: {
            size: 10
          }
        },
        grid: {
          color: "#f1f3f5",
          tickBorderDash: [3, 3],
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: "#888",
          font: {
            size: 10
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="admin-content-page py-1" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{t("overview")}</h2>
          <p className="ac-subtitle text-muted mb-0">{t("subtitle")}</p>
        </div>
      </div>

      {/* Row 1: 4 Stats Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Revenue */}
        <div className="col-lg-3 col-md-6 col-12">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#e2f9eb", color: "#22c55e" }}
              >
                <i className="bi bi-currency-dollar fs-5"></i>
              </div>
              <span className="fw-semibold" style={{ color: "#22c55e", fontSize: "0.85rem" }}>
                <i className="bi bi-arrow-up-right me-1"></i>+12.5%
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>$125,430</h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>{t("totalRevenue")}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Students */}
        <div className="col-lg-3 col-md-6 col-12">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#e0f2fe", color: "#0ea5e9" }}
              >
                <i className="bi bi-people fs-5"></i>
              </div>
              <span className="fw-semibold" style={{ color: "#22c55e", fontSize: "0.85rem" }}>
                <i className="bi bi-arrow-up-right me-1"></i>+8.2%
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>3,842</h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>{t("totalStudents")}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Courses */}
        <div className="col-lg-3 col-md-6 col-12">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#f3e8ff", color: "#a855f7" }}
              >
                <i className="bi bi-journal-bookmark fs-5"></i>
              </div>
              <span className="fw-semibold" style={{ color: "#22c55e", fontSize: "0.85rem" }}>
                <i className="bi bi-arrow-up-right me-1"></i>+3
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>124</h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>{t("totalCourses")}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Courses */}
        <div className="col-lg-3 col-md-6 col-12">
          <div className="state p-3 d-flex flex-column justify-content-between" style={{ height: "auto", minHeight: "140px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center" 
                style={{ width: "40px", height: "40px", backgroundColor: "#fee2e2", color: "#ef4444" }}
              >
                <i className="bi bi-graph-up-arrow fs-5"></i>
              </div>
              <span className="fw-semibold" style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                <i className="bi bi-arrow-down-right me-1"></i>-2
              </span>
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ fontSize: "1.75rem", color: "#111827", letterSpacing: "-0.025em" }}>98</h3>
              <span className="text-muted" style={{ fontSize: "0.82rem" }}>{t("activeCourses")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: 2 Charts */}
      <div className="row g-4 mb-4">
        {/* Revenue Over Time */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("revenueOverTime")}</h4>
              <div className="btn-group bg-light p-1 rounded-3" style={{ height: "32px" }}>
                <button 
                  className={`btn btn-sm border-0 rounded-2 px-3 py-0 ${revenueTimeframe === "week" ? "bg-white shadow-sm fw-semibold text-dark" : "text-muted"}`} 
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => setRevenueTimeframe("week")}
                >
                  {t("week")}
                </button>
                <button 
                  className={`btn btn-sm border-0 rounded-2 px-3 py-0 ${revenueTimeframe === "month" ? "bg-white shadow-sm fw-semibold text-dark" : "text-muted"}`} 
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => setRevenueTimeframe("month")}
                >
                  {t("month")}
                </button>
                <button 
                  className={`btn btn-sm border-0 rounded-2 px-3 py-0 ${revenueTimeframe === "year" ? "bg-white shadow-sm fw-semibold text-dark" : "text-muted"}`} 
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => setRevenueTimeframe("year")}
                >
                  {t("year")}
                </button>
              </div>
            </div>
            <div style={{ height: "240px", position: "relative" }}>
              <Line data={revenueData} options={revenueOptions} />
            </div>
          </div>
        </div>

        {/* Course Sales */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("courseSales")}</h4>
              <div className="btn-group bg-light p-1 rounded-3" style={{ height: "32px" }}>
                <button 
                  className={`btn btn-sm border-0 rounded-2 px-3 py-0 ${salesTimeframe === "week" ? "bg-white shadow-sm fw-semibold text-dark" : "text-muted"}`} 
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => setSalesTimeframe("week")}
                >
                  {t("week")}
                </button>
                <button 
                  className={`btn btn-sm border-0 rounded-2 px-3 py-0 ${salesTimeframe === "month" ? "bg-white shadow-sm fw-semibold text-dark" : "text-muted"}`} 
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => setSalesTimeframe("month")}
                >
                  {t("month")}
                </button>
                <button 
                  className={`btn btn-sm border-0 rounded-2 px-3 py-0 ${salesTimeframe === "year" ? "bg-white shadow-sm fw-semibold text-dark" : "text-muted"}`} 
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => setSalesTimeframe("year")}
                >
                  {t("year")}
                </button>
              </div>
            </div>
            <div style={{ height: "240px", position: "relative" }}>
              <Bar data={salesData} options={salesOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Lists */}
      <div className="row g-4 mb-4">
        {/* Latest Enrollments */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("latestEnrollments")}</h4>
              <button 
                className="btn btn-link text-decoration-none text-muted fw-semibold p-0" 
                style={{ fontSize: "0.85rem" }}
                onClick={() => navigate("/admin/students")}
              >
                {t("viewAll")}
              </button>
            </div>
            <div className="d-flex flex-column gap-3">
              {latestEnrollments.map((student) => (
                <div key={student.id} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 ms-3" 
                      style={{ 
                        width: "40px", 
                        height: "40px", 
                        backgroundColor: student.bg, 
                        color: student.color, 
                        flexShrink: 0,
                        fontSize: "0.9rem" 
                      }}
                    >
                      {student.initials}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "0.92rem" }}>{student.name}</h6>
                      <span className="text-muted" style={{ fontSize: "0.78rem" }}>{student.course}</span>
                    </div>
                  </div>
                  <span className="text-muted small" style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>{student.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="col-lg-6 col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("recentOrders")}</h4>
              <button 
                className="btn btn-link text-decoration-none text-muted fw-semibold p-0" 
                style={{ fontSize: "0.85rem" }}
                onClick={() => navigate("/admin/orders")}
              >
                {t("viewAll")}
              </button>
            </div>
            <div className="d-flex flex-column gap-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "0.92rem" }}>{order.name}</h6>
                      <span className="badge bg-success-subtle text-success rounded-pill px-2 py-0.5" style={{ fontSize: "0.68rem", fontWeight: "600" }}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-muted" style={{ fontSize: "0.78rem" }}>{order.course}</span>
                  </div>
                  <span className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>{order.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Top Performing Courses */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.1rem" }}>{t("topPerformingCourses")}</h4>
              <button 
                className="btn btn-link text-decoration-none text-muted fw-semibold p-0" 
                style={{ fontSize: "0.85rem" }}
                onClick={() => navigate("/admin/courses")}
              >
                {t("viewAll")}
              </button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                <thead>
                  <tr className="text-muted" style={{ fontSize: "0.78rem", fontWeight: "600" }}>
                    <th className="border-bottom-0 pb-3 ps-0">{t("course")}</th>
                    <th className="border-bottom-0 pb-3">{t("students")}</th>
                    <th className="border-bottom-0 pb-3">{t("rating")}</th>
                    <th className="border-bottom-0 pb-3 text-end pe-0">{t("revenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((course) => (
                    <tr key={course.id}>
                      <td className="fw-bold text-dark ps-0 py-3" style={{ fontSize: "0.92rem" }}>
                        {course.title}
                      </td>
                      <td className="text-muted py-3" style={{ fontSize: "0.88rem" }}>
                        {course.students}
                      </td>
                      <td className="py-3" style={{ fontSize: "0.88rem" }}>
                        <span style={{ color: "#ffc107" }} className="me-1">★</span>
                        <span className="fw-semibold">{course.rating}</span>
                      </td>
                      <td className="fw-bold text-dark text-end pe-0 py-3" style={{ fontSize: "0.92rem" }}>
                        {course.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
