import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import "./review.css";
function AdminReviews() {
  const { t, i18n } = useTranslation("AdminReviews");
const toggleLanguage = () => {
    const newLang = i18n.language.startsWith("en") ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);
  };
 const reviews = [
  {
    student: "Ahmed Awad",
    course: "Graphic Design",
    review: "The course helped me understand design principles clearly with real examples.",
    date: "Jan 5, 2024",
  },
  {
    student: "Sara Mohamed",
    course: "Web Development",
    review: "I learned how to build full responsive websites from scratch.",
    date: "Jan 12, 2024",
  },
  {
    student: "Omar Ali",
    course: "UI/UX Design",
    review: "Very practical course with modern UI tools and techniques.",
    date: "Feb 2, 2024",
  },
  {
    student: "Mona Hassan",
    course: "React JS",
    review: "State management and components were explained in a simple way.",
    date: "Feb 10, 2024",
  },
  {
    student: "Khaled Tarek",
    course: "Python Programming",
    review: "Great introduction to programming logic and problem solving.",
    date: "Feb 18, 2024",
  },
  {
    student: "Nour Ahmed",
    course: "Digital Marketing",
    review: "SEO and social media strategies were very useful and updated.",
    date: "Mar 1, 2024",
  },
  {
    student: "Youssef Samir",
    course: "Data Analysis",
    review: "I understood how to analyze data using real datasets.",
    date: "Mar 8, 2024",
  },
  {
    student: "Laila Mostafa",
    course: "Mobile App Development",
    review: "Building apps for Android was explained step by step clearly.",
    date: "Mar 15, 2024",
  },
];

  return (
    <div className="container-fluid">
      
      <div className="row">
        <div className="col-10">
          <h4>{t("title")}</h4>
          <p className="text-muted">{t("subtitle")}</p>
          </div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="state p-2">
            <div className="stat-label">{t("stats.totalReviews")}</div>
            <div className="stat-value my-2">1400</div>
            <div style={{ color: "#28a745" }} className="stat-sub">
              +64 this month
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="state p-2">
            <div  className="stat-label">{t("stats.averageRating")}</div>
            <div className="state-value my-2">
              4.6
              <span  className="text-warning fs-5 ms-2">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-half"></i>
              </span>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="state p-2">
            <div className="stat-label">{t("stats.pendingReview")}</div>
            <div className="stat-value my-2 text-warning">23</div>
            <div className="stat-sub text-muted">{t("stats.awaiting")}</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="state p-2">
            <div className="stat-label">{t("stats.rejected")}</div>
            <div className="state-value my-2">48</div>
            <div className="stat-sub text-muted">{t("stats.allTime")}</div>
          </div>
        </div>
      </div>

      <div className="review-table-container">
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="position-relative">
            <div className="position-relative">
  <i
    className="bi bi-search position-absolute"
    style={{
      top: "50%",
      left: "12px",
      transform: "translateY(-50%)",
      color: "#6c757d",
      pointerEvents: "none",
    }}
  ></i>

  <input
    type="text"
    className="form-control ac-search-input ps-5 bg-light border-0"
    placeholder="Search reviews..."
  />
</div>
            </div>
          </div>

          <div className="col-md-3">
            <select className="form-select ac-search-input bg-light border-0">
              <option>All Status</option>
            </select>
          </div>

          <div className="col-md-3">
            <select className="form-select ac-search-input bg-light border-0">
              <option>All Ratings</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive  ac-rounded-table">
          <table className="table table-hover ac-table">
            <thead className="ac-table">
              <tr className="text-muted">
                <th>{t("table.student")}</th>
                <th>{t("table.course")}</th>
                <th>{t("table.rating")}</th>
                <th>{t("table.review")}</th>
                <th>{t("table.date")}</th>
              </tr>
            </thead>

            <tbody>
              {reviews.map((item, index) => (
                <tr key={index} className="ac-table">
                  <td className="align-content-center">{item.student}</td>

                  <td className="text-muted align-content-center">{item.course}</td>

                  <td className="align-content-center">
                    <span style={{ fontSize:"12px", }} className="text-warning">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-half"></i>
                    </span>
                  </td>

                  <td className="ac-truncate-text" style={{ maxWidth: "300px" }} >
                    {item.review}{" "}
                    <span  style={{ cursor: "pointer" }}>
                     
                    </span>
                  </td>
                  <td className="text-muted">{item.date}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminReviews;