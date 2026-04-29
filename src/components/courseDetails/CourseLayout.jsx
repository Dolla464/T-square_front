import CourseInfo from "./CourseInfo";
import CourseSidebar from "./CourseSidebar";
import CourseVideos from "./CourseVideos";

const CourseLayout = ({ data }) => {
  return (
    <div className="row">
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
