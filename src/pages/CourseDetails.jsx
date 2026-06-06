import { useParams } from "react-router-dom";
import { useCourseSlug } from "../hooks/useCousrsesSlug";
import { Helmet } from "react-helmet-async";
import i18n from "../i18n";

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

  const pageTitle = `${courseData.title} - T-Square`;
  const pageDescription = courseData.short_description || courseData.description || "";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`${window.location.origin}/courses/course_details/${slug}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {courseData.cover_image && <meta property="og:image" content={courseData.cover_image} />}
        <meta property="og:url" content={`${window.location.origin}/courses/course_details/${slug}`} />
        <meta property="og:type" content="website" />
      </Helmet>

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
