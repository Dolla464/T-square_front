import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import { Pagination } from "react-bootstrap";
// import "./review.css";
function AdminReviews() {
  const { t, i18n } = useTranslation("AdminReviews");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
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

  const pagination = {
    currentPage,
    lastPage: totalPages,
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, ratingFilter]);
  return (
    <div className="admin-content-page">



      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{t("title")}  </h2>
          <p className="ac-subtitle text-muted mb-0">
            {t("subtitle")}      </p>
        </div>

      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="state">
            <div className="stat-label">{t("stats.totalReviews")}</div>
            <div className="stat-value my-2">1400</div>
            <div style={{ color: "#28a745" }} className="stat-sub">
              +64 this month
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="state ">
            <div className="stat-label">{t("stats.averageRating")}</div>
            <div className="d-flex  align-items-center">

              <div className="stat-value my-2">4.6</div>


              <span className="text-warning fs-5 ms-2">
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
          <div className="state ">
            <div className="stat-label">{t("stats.pendingReview")}</div>
            <div className="stat-value my-2 text-warning">23</div>
            <div className="stat-sub text-muted">{t("stats.awaiting")}</div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="state ">
            <div className="stat-label">{t("stats.rejected")}</div>
            <div className="stat-value my-2">48</div>
            <div className="stat-sub text-muted">{t("stats.allTime")}</div>
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="table-responsive ac-rounded-table">
        <div className="review-table-container ">

          {/* Search Controls */}



          <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
            <div className="ac-search-input-wrapper">
              <i className="bi bi-search ac-search-icon"></i>
              <input
                type="text"
                className="form-control ac-search-input"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="d-flex w-25 gap-md-3">
              <select
                className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
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
          <table className="table ac-table mb-0 align-middle" dir="ltr">
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
                  <tr key={index} >
                    <td className="fw-medium text-dark">
                      {item.student}</td>

                    <td className="fw-medium text-dark">
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

                    <td className="ac-truncate-text text-secondary">
                      {item.review}
                    </td>

                    <td className="text-muted">{item.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-secondary fw-bold">
                    No data found
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      {pagination && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination className="custom-pagination">
            <Pagination.Prev
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            />
              <Pagination.Item
                key={pagination.currentPage}
                active
              >
                {pagination.currentPage}
              </Pagination.Item>
            <Pagination.Next
              disabled={pagination.currentPage === pagination.lastPage}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            />
          </Pagination>
        </div>
      )}

    </div>
  );
}

export default AdminReviews;