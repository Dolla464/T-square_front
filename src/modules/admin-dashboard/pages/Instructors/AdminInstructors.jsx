import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";
import { FaSearch, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./Instructors.css";
import { Link } from "react-router-dom";

function AdminInstructors() {
  const { t, i18n } = useTranslation("Instructors");
  const isArabic = i18n?.language === "ar";

  return (
    <div className="instructors-container" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="header">
        <div>
          <h2 className="fw-bold">{t("instructors")}</h2>
          <p>{t("manageInstructors")}</p>
        </div>

        <Link to="add" className="add-btn">
          + {t("addInstructor")}
        </Link>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input type="text" placeholder={t("searchInstructor")} />
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("email")}</th>
              <th>{t("phone")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Ahmed Awaden</td>
              <td>ahmed@gmail.com</td>
              <td dir="ltr" className="phone">
                +20 100 123 4567
              </td>{" "}
              <td className="actions">
                <Link to="show">
                  <FaEye />
                </Link>{" "}
                <Link to="edit">
                  <FaEdit />
                </Link>{" "}
                <FaTrash className="delete" />
              </td>
            </tr>

            <tr>
              <td>Mohamed Salama</td>
              <td>salama@gmail.com</td>
              <td dir="ltr" className="phone">
                +20 100 123 4567
              </td>{" "}
              <td className="actions">
                <Link to="show">
                  <FaEye />
                </Link>{" "}
                <Link to="edit">
                  <FaEdit />
                </Link>{" "}
                <FaTrash className="delete" />
              </td>
            </tr>

            <tr>
              <td>Omar Hassan</td>
              <td>omar@gmail.com</td>
              <td dir="ltr" className="phone">
                +20 100 123 4567
              </td>{" "}
              <td className="actions">
                <Link to="show">
                  <FaEye />
                </Link>
                <Link to="edit">
                  <FaEdit />
                </Link>{" "}
                <FaTrash className="delete" />
              </td>
            </tr>

            <tr>
              <td>Mona Ali</td>
              <td>mona@gmail.com</td>
              <td dir="ltr" className="phone">
                +20 100 123 4567
              </td>{" "}
              <td className="actions">
                <Link to="show">
                  <FaEye />
                </Link>{" "}
                <Link to="edit">
                  <FaEdit />
                </Link>{" "}
                <FaTrash className="delete" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AdminInstructors;
