export default function ExportBar({ onExport, loading = false, disabled = false }) {
  const isDisabled = loading || disabled;

  return (
    <div className="d-flex gap-2 flex-wrap">
      <button
        type="button"
        className="btn-download-pdf"
        onClick={() => onExport("pdf")}
        disabled={isDisabled}
      >
        <i className="bi bi-file-earmark-pdf me-1"></i>PDF
      </button>
      <button
        type="button"
        className="btn-download-excel"
        onClick={() => onExport("excel")}
        disabled={isDisabled}
      >
        <i className="bi bi-file-earmark-spreadsheet me-1"></i>Excel
      </button>
    </div>
  );
}
