import CourseInfo from "../components/courseDetails/CourseInfo";
import CourseSidebar from "../components/courseDetails/CourseSidebar";
import CourseVideos from "../components/courseDetails/CourseVideos";
import CourseLayout from "../components/courseDetails/CourseLayout";
import "../components/courseDetails/CourseDetails.css";
import ContactSection from "../components/courses/ContactSection";



const CourseDetails = () => {
  return (
    <div className="course-details-page container my-5 pt-5">

      <div className="row">
        <CourseLayout/>
      </div>
      <ContactSection />

    </div>
  );
};
export default CourseDetails;
