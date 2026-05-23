import { useTranslation } from "react-i18next";
import placeholderVideo from "../../assets/video/1625-148614367.mp4";
import { FaPlay } from "react-icons/fa";

const CourseVideos = () => {
  const { t, i18n } = useTranslation("coursesDetails");
  const isArabic = i18n?.language === "ar";

  return (
    <div className="mt-5" dir={isArabic ? "rtl" : "ltr"}>
      <h3 className="fw-bold mb-3">{t("course_preview")}</h3>

      <p className="text-muted mb-4 fs-5">{t("preview_description")}</p>

      <div className="row g-4">
        {/* Card 1 */}
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow rounded-4 overflow-hidden h-100">
            {/* Title */}
            <div className="card-body pb-2">
              <h5 className="fw-bold mb-0 fs-6">Video Title </h5>
            </div>

            {/* Thumbnail */}
            <div
              className="position-relative px-3"
              data-bs-toggle="modal"
              data-bs-target="#videoModal1"
              style={{ cursor: "pointer" }}
            >
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                alt="video"
                className="w-100 rounded-4"
                style={{
                  height: "220px",
                  objectFit: "cover",
                }}
              />

              {/* Play Button */}

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "70px",
                  height: "70px",
                  background: "rgba(0,0,0,0.6)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaPlay className="text-white" size={24} />
              </div>
            </div>

            {/* Description */}
            <div className="card-body pt-3">
              <p className="text-muted small mb-0">
                Small description for this video content.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow rounded-4 overflow-hidden h-100">
            <div className="card-body pb-2">
              <h5 className="fw-bold mb-0 fs-6">Video Title </h5>
            </div>

            <div
              className="position-relative px-3"
              data-bs-toggle="modal"
              data-bs-target="#videoModal2"
              style={{ cursor: "pointer" }}
            >
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                alt="video"
                className="w-100 rounded-4"
                style={{
                  height: "220px",
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "70px",
                  height: "70px",
                  background: "rgba(0,0,0,0.6)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaPlay className="text-white" size={24} />
              </div>
            </div>

            <div className="card-body pt-3">
              <p className="text-muted small mb-0">
                Small description for this video content.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="col-lg-4 col-md-6">
          <div className="card border-0 shadow rounded-4 overflow-hidden h-100">
            <div className="card-body pb-2">
              <h5 className="fw-bold mb-0 fs-6">Video Title </h5>
            </div>

            <div
              className="position-relative px-3"
              data-bs-toggle="modal"
              data-bs-target="#videoModal3"
              style={{ cursor: "pointer" }}
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                alt="video"
                className="w-100 rounded-4"
                style={{
                  height: "220px",
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "70px",
                  height: "70px",
                  background: "rgba(0,0,0,0.6)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaPlay className="text-white" size={24} />
              </div>
            </div>

            <div className="card-body pt-3">
              <p className="text-muted small mb-0">
                Small description for this video content.
              </p>
            </div>
          </div>
        </div>

        {/* Modal 1 */}
        <div className="modal fade" id="videoModal1" tabIndex="-1">
          <div
            className="modal-dialog modal-dialog-centered"
            style={{
              maxWidth: window.innerWidth < 768 ? "95%" : "50%",
            }}
            onClick={() => {
              const modal = document.getElementById("videoModal1");
              const bsModal = window.bootstrap.Modal.getInstance(modal);
              bsModal.hide();
            }}
          >
            <div
              className="modal-content bg-transparent border-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-body p-0">
                <video
                  src={placeholderVideo}
                  controls
                  autoPlay
                  className="w-100 rounded-4"
                  style={{
                    maxHeight: "85vh",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal 2 */}
        <div className="modal fade" id="videoModal2" tabIndex="-1">
          <div
            className="modal-dialog modal-dialog-centered"
            style={{
              maxWidth: window.innerWidth < 768 ? "95%" : "50%",
            }}
            onClick={() => {
              const modal = document.getElementById("videoModal2");
              const bsModal = window.bootstrap.Modal.getInstance(modal);
              bsModal.hide();
            }}
          >
            <div
              className="modal-content bg-transparent border-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-body p-0">
                <video
                  src={placeholderVideo}
                  controls
                  autoPlay
                  className="w-100 rounded-4"
                  style={{
                    maxHeight: "85vh",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal 3 */}
        <div className="modal fade" id="videoModal3" tabIndex="-1">
          <div
            className="modal-dialog modal-dialog-centered"
            style={{
              maxWidth: window.innerWidth < 768 ? "95%" : "50%",
            }}
            onClick={() => {
              const modal = document.getElementById("videoModal3");
              const bsModal = window.bootstrap.Modal.getInstance(modal);
              bsModal.hide();
            }}
          >
            <div
              className="modal-content bg-transparent border-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-body p-0">
                <video
                  src={placeholderVideo}
                  controls
                  autoPlay
                  className="w-100 rounded-4"
                  style={{
                    maxHeight: "85vh",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseVideos;
