import React from "react";
import { Modal } from "react-bootstrap";

const VideoPreviewModal = ({
  show,
  onHide,
  videoUrl,
  videoTitle,
  isArabic,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      contentClassName="bg-dark border-0"
      className="ac-video-modal"
    >
      <Modal.Header className="bg-dark border-0 d-flex align-items-center justify-content-between p-3">
        <div className="d-flex align-items-center">
          <i className="bi bi-play-circle-fill text-danger me-2 fs-5"></i>
          <Modal.Title
            className="fs-6 fw-bold text-white text-truncate"
            style={{ maxWidth: "400px" }}
          >
            {videoTitle || (isArabic ? "معاينة الفيديو" : "Video Preview")}
          </Modal.Title>
        </div>

        <button
          type="button"
          className="btn-close btn-close-white shadow-none m-0"
          onClick={onHide}
          aria-label="Close"
        ></button>
      </Modal.Header>

      <Modal.Body className="p-0 bg-black rounded-bottom overflow-hidden">
        <div className="ratio ratio-16x9">
          {videoUrl && (
            <video src={videoUrl} controls autoPlay className="w-100">
              {isArabic
                ? "متصفحك لا يدعم تشغيل الفيديو."
                : "Your browser does not support the video tag."}
            </video>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default VideoPreviewModal;
