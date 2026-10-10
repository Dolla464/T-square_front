import { useTranslation } from "react-i18next";
import CourseInfo from "./CourseInfo";
import CourseSidebar from "./CourseSidebar";
import CourseVideos from "./CourseVideos";
import { isArabicLocale } from "../../utils/isArabicLocale";


const CourseLayout = ({ data }) => {
  const { i18n } = useTranslation();
  const isArabic = isArabicLocale(i18n?.language);
  return (
    <div className="row" dir={isArabic ? "rtl" : "ltr"}>
      <div className="col-lg-8">
        <CourseInfo course={data} />
        <CourseVideos course={data} />
      </div>

      <div className="col-lg-4">
        <CourseSidebar course={data} />
      </div>
    </div>
  );
};

export default CourseLayout;
