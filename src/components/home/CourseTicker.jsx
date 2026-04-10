import "./CourseTicker.css";
// افترضنا إن عندك أيقونة الـ T-Square في Assets
import tIcon from "../../assets/icon.png";

const courses = [
  "Kids Coding",
  "Flutter",
  "AI",
  "Data Analysis",
  "Full Stack",
  "Graphic Design",
  "Web Developing",
  "Mobile Developing",
];

function CourseTicker() {
  return (
    <div className="ticker-wrapper">
      <div className="ticker-content">
        {/* بنكرر القائمة مرتين عشان الحركة تبان لا نهائية */}
        {[...courses, ...courses].map((course, index) => (
          <div className="ticker-item" key={index}>
            <img src={tIcon} alt="icon" className="ticker-icon" />
            <span>{course}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseTicker;
