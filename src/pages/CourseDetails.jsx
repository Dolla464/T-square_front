import { useParams } from "react-router-dom";
import { useCourseSlug } from "../hooks/useCousrsesSlug";

import CourseLayout from "../components/courseDetails/CourseLayout";
import "../components/courseDetails/CourseDetails.css";
import ContactSection from "../components/courses/ContactSection";
// import { useTranslation } from "react-i18next";

import LoadingSpiner from "../LoadingSpiner";

const CourseDetails = () => {

  const { slug } = useParams();

  const { courseData, loading } = useCourseSlug(slug);

  if (loading) return <LoadingSpiner />;
  if (!courseData) return <p>No course found</p>;

  return (
    <>
      <div className="course-details-page container my-5 pt-5">
        <div className="row">
          <CourseLayout data={courseData} />
        </div>
      </div>

      <ContactSection />
    </>
  );
};
export default CourseDetails;
