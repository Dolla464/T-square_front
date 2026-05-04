import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import "./review.css";
function AdminReviews() {
  const { t, i18n } = useTranslation("AdminReviews");
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;
const toggleLanguage = () => {
    const newLang = i18n.language.startsWith("en") ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);
  };
 const reviews = [
  {
    student: "Ahmed Awad",
     course: "Graphic Design",
    rating: 4.5,
    review: "The course helped me understand design principles clearly with real examples.",
    date: "Jan 5, 2024",
  },
  {
    student: "Sara Mohamed",
    course: "Web Development",
    rating: 4,
    review: "I learned how to build full responsive websites from scratch.",
    date: "Jan 12, 2024",
  },
  {
    student: "Omar Ali",
    course: "UI/UX Design",
    rating: 3.5,
    review: "Very practical course with modern UI tools and techniques.",
    date: "Feb 2, 2024",
  },
  {
    student: "Mona Hassan",
    course: "React JS",
    rating: 4,
    review: "State management and components were explained in a simple way.",
    date: "Feb 10, 2024",
  },
  {
    student: "Khaled Tarek",
    course: "Python Programming",
    rating: 4.5,
    review: "Great introduction to programming logic and problem solving.",
    date: "Feb 18, 2024",
  },
  {
    student: "Nour Ahmed",
    course: "Digital Marketing",
    rating: 4,
    review: "SEO and social media strategies were very useful and updated.",
    date: "Mar 1, 2024",
  },
  {
    student: "Youssef Samir",
    course: "Data Analysis",
    rating: 3,
    review: "I understood how to analyze data using real datasets.",
    date: "Mar 8, 2024",
  },
  {
    student: "Laila Mostafa",
    course: "Mobile App Development",
    rating: 3,
    review: "Building apps for Android was explained step by step clearly.",
    date: "Mar 15, 2024",
  },
];


const [search, setSearch] = useState("");
const [ratingFilter, setRatingFilter] = useState("all"); 

const filteredReviews = reviews.filter((item) => {
  const value = search.toLowerCase();

  const matchSearch =
    item.student.toLowerCase().includes(value) ||
    item.course.toLowerCase().includes(value) ||
    item.review.toLowerCase().includes(value);

  const matchRating =
    ratingFilter === "all" ||
Math.floor(item.rating) === Number(ratingFilter)
  return matchSearch && matchRating;
});
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;

const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));

  useEffect(() => {
  setCurrentPage(1);
}, [search, ratingFilter]);
  return (
    <div className="container-fluid">
      
      <div className="row">
        <div className="col-10">
          <h4>{t("title")}</h4>
          <p className="text-muted">{t("subtitle")}</p>
          </div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="state p-2">
            <div className="stat-label">{t("stats.totalReviews")}</div>
            <div className="stat-value my-2">1400</div>
            <div style={{ color: "#28a745" }} className="stat-sub">
              +64 this month
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
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

        <div className="col-md-3 col-6">
          <div className="state p-2">
            <div className="stat-label">{t("stats.pendingReview")}</div>
            <div className="stat-value my-2 text-warning">23</div>
            <div className="stat-sub text-muted">{t("stats.awaiting")}</div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="state p-2">
            <div className="stat-label">{t("stats.rejected")}</div>
            <div className="state-value my-2">48</div>
            <div className="stat-sub text-muted">{t("stats.allTime")}</div>
          </div>
        </div>
      </div>


        {/* Table */}
        <div className="table-responsive ac-rounded-table">
        <div className="review-table-container ">

  {/* Search Controls */}
   <div className="ac-search-box p-3 bg-white rounded border shadow-sm w-100">

      <div className="row align-items-center g-3">

        <div className="col-md-6">
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
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="form-control ac-search-input bg-light"
  placeholder="Search reviews..."
/>
          </div>
        </div>

        <div className="col-md-3">
          <select className="form-select ac-search-input bg-light border-0">
            <option>All Status</option>
          </select>
        </div>

        <div className="col-md-3">
  <select
    className="form-select ac-search-input bg-light border-0"
    value={ratingFilter}
    onChange={(e) => setRatingFilter(e.target.value)}
  >
    <option value="all">All Ratings</option>
    <option value="5">5 Stars</option>
    <option value="4">4 Stars</option>
    <option value="3">3 Stars</option>
    <option value="2">2 Stars</option>
    <option value="1">1 Star</option>
  </select>
</div>

      </div>


            </div>
          <table  className="table table-hover ac-table">
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
  {currentReviews.length > 0 ? (
    currentReviews.map((item, index) => (
      <tr key={index} className="ac-table">
        <td className="align-content-center">{item.student}</td>

        <td className="text-muted align-content-center">
          {item.course}
        </td>

        <td className="align-content-center">
          <span className="text-warning" style={{ fontSize: "12px" }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const rating = item.rating;

              if (rating >= star) {
                return <i key={star} className="bi bi-star-fill"></i>;
              } else if (rating >= star - 0.5) {
                return <i key={star} className="bi bi-star-half"></i>;
              } else {
                return <i key={star} className="bi bi-star"></i>;
              }
            })}
          </span>
        </td>

        <td className="ac-truncate-text" style={{ maxWidth: "200px" }}>
          {item.review}
        </td>

        <td className="text-muted">{item.date}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="text-center py-4 text-muted fw-bold">
        No data found
      </td>
    </tr>
  )}

            </tbody>
          </table>
</div>
        </div>
  {filteredReviews.length > 0 && (
  <div className="d-flex justify-content-center mt-4">
    <nav>
      <ul className="pagination custom-pagination">

        {/* Previous */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Prev
          </button>
        </li>

        {/* Numbers */}
        {[...Array(totalPages)].map((_, index) => (
          <li
            key={index}
            className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          </li>
        ))}

        {/* Next */}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </li>

      </ul>
    </nav>
  </div>
)}
    
    </div>
  );
}

export default AdminReviews;