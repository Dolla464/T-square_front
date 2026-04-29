import { useParams } from "react-router-dom";
import { useCourseSlug } from "../hooks/useCousrsesSlug";
import CourseInfo from "../components/courseDetails/CourseInfo";
import CourseSidebar from "../components/courseDetails/CourseSidebar";
import CourseVideos from "../components/courseDetails/CourseVideos";
import CourseLayout from "../components/courseDetails/CourseLayout";
import "../components/courseDetails/CourseDetails.css";
import ContactSection from "../components/courses/ContactSection";
import { useTranslation } from "react-i18next";

const CourseDetails = () => {

  const { slug } = useParams();

  const { courseData, loading, error } = useCourseSlug(slug);

  if (loading) return <p>Loading...</p>;
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
