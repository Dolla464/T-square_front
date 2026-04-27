import CourseInfo from "./CourseInfo";
import CourseSidebar from "./CourseSidebar";
import CourseVideos from "./CourseVideos";

const CourseLayout = () => {
  return (
<div className="row">

  <div className="col-lg-8">
    <CourseInfo />
    <CourseVideos />
  </div>

  <div className="col-lg-4">
    <CourseSidebar />
  </div>

</div>
  );
};

export default CourseLayout;