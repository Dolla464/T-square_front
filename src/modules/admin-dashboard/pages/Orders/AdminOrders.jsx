import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";
import { FaDownload } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import "./AdminOrders.css"; // css

function AdminOrders() {
  const { t, i18n } = useTranslation("orderPayments");
  const isArabic = i18n?.language === "ar";

  return (
    <div className="orders-container" dir={isArabic ? "rtl" : "ltr"}>
      <div className="header">
        <div>
          <h2 className="fw-bold">{t("orders")}</h2>
          <p className="fs-5 mt-2">{t("track")}</p>
        </div>
        <button className="export-btn">
          <FaDownload className="icon" />
          <span className="ms-3">{t("export")}</span>
        </button>
      </div>

      {/* Cards */}
      <div className="cards">
        <div className="card">
          <h4 className="opacity-75">{t("totalRevenue")}</h4>
          <h2 className="fw-bold">$125,430</h2>
          <span className="green">+12.5% {t("fromLastMonth")}</span>
        </div>

        <div className="card">
          <h4 className="opacity-75">{t("totalOrders")}</h4>
          <h2 className="fw-bold">1,284</h2>
          <span className="green">+8.2% {t("fromLastMonth")}</span>
        </div>

        <div className="card">
          <h4 className="opacity-75">{t("pending")}</h4>
          <h2 className="orange">24</h2>
          <span>{t("awaitingPayment")}</span>
        </div>

        <div className="card">
          <h4 className="opacity-75">{t("refunded")}</h4>
          <h2 className="fw-bold">8</h2>
          <span>{t("thisMonth")}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-header">
          <input type="text" placeholder="Search students..." />

          <select>
            <option>{t("allStudents")}</option>
            <option>{t("completed")}</option>
            <option>{t("pending")}</option>
            <option>{t("failed")}</option>
            <option>{t("refunded")}</option>
          </select>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>{t("orderId")}</th>
                <th>{t("student")}</th>
                <th>{t("course")}</th>
                <th>{t("amount")}</th>
                <th>{t("paymentMethod")}</th>
                <th>{t("status")}</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>ORD-1256</td>
                <td>
                  <strong>Sarah Johnson</strong>
                  <p>sarah@email.com</p>
                </td>
                <td>Complete Web Development Bootcamp</td>
                <td>89.99 EGY</td>
                <td>Credit Card</td>
                <td>
                  <span className="status completed">{t("completed")}</span>
                </td>
              </tr>

              <tr>
                <td>ORD-1257</td>
                <td>
                  <strong>Ahmed Ali</strong>
                  <p>ahmed@email.com</p>
                </td>
                <td>Data Science with Python</td>
                <td>120 EGY</td>
                <td>Vodafone Cash</td>
                <td>
                  <span className="status pending">{t("pending")}</span>
                </td>
              </tr>

              <tr>
                <td>ORD-1258</td>
                <td>
                  <strong>Mohamed Samy</strong>
                  <p>mohamed@email.com</p>
                </td>
                <td>UI/UX Design Masterclass</td>
                <td>75 EGY</td>
                <td>Credit Card</td>
                <td>
                  <span className="status cancelled">{t("cancelled")}</span>
                </td>
              </tr>

              <tr>
                <td>ORD-1259</td>
                <td>
                  <strong>Omar Hassan</strong>
                  <p>omar@email.com</p>
                </td>
                <td>React Advanced Course</td>
                <td>95 EGY</td>
                <td>Credit Card</td>
                <td>
                  <span className="status completed">{t("completed")}</span>
                </td>
              </tr>

              <tr>
                <td>ORD-1260</td>
                <td>
                  <strong>Mona Ali</strong>
                  <p>mona@email.com</p>
                </td>
                <td>Laravel Masterclass</td>
                <td>110 EGY</td>
                <td>Fawry</td>
                <td>
                  <span className="status pending">{t("pending")}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default AdminOrders;
