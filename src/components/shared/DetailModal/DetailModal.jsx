import { Modal } from "react-bootstrap";
import "./DetailModal.css";

function DetailModal({
  show,
  onHide,
  title,
  size = "md",
  scrollable = false,
  dir,
  bodyClassName = "pt-0",
  bodyDir,
  children,
  footer,
  footerClassName = "border-0 pt-0",
  className = "",
}) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size={size}
      scrollable={scrollable}
      className={`cert-detail-modal ${className}`.trim()}
      dir={dir}
    >
      <div
        className="d-flex align-items-center justify-content-between pt-3 px-3"
        dir={dir}
      >
        <Modal.Title className="fs-5 fw-bold">{title}</Modal.Title>
        <Modal.Header closeButton className="border-0" />
      </div>

      <Modal.Body className={bodyClassName} dir={bodyDir ?? dir}>
        {children}
      </Modal.Body>

      {footer != null && (
        <Modal.Footer className={footerClassName}>{footer}</Modal.Footer>
      )}
    </Modal>
  );
}

export default DetailModal;
