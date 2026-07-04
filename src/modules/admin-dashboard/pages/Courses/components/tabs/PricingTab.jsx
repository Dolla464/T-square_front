function PricingTab({ formData, handleChange, isReadOnly, isArabic, t }) {
  const isFree = formData.is_free;

  return (
    <>
      {isFree && (
        <p className="text-danger small mb-3">
          {isArabic
            ? "الكورس مجاني — حقول السعر غير مطلوبة."
            : "This course is free — pricing fields are not required."}
        </p>
      )}

      {/* Original price */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark">
          {isArabic ? "سعر الكورس" : "Course price"}
        </label>
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 text-muted">$</span>
          <input
            type="text"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-end-3"
            placeholder="0.00"
            value={formData.price_before}
            onChange={handleChange}
            name="price_before"
            disabled={isReadOnly || isFree}
          />
        </div>
      </div>

      {/* Discount price */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark">
          {t("content.form.fields.discount_price")}
        </label>
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 text-muted">$</span>
          <input
            type="text"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-end-3"
            placeholder="0.00"
            value={formData.discount_price}
            onChange={handleChange}
            name="discount_price"
            disabled={isReadOnly || isFree}
          />
        </div>
      </div>
    </>
  );
}

export default PricingTab;
