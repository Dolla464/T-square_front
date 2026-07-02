export const selectClass = (active) =>
  `form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${
    active
      ? "border-danger bg-danger-subtle text-danger-emphasis"
      : "border-light bg-light text-muted"
  }`;

export const dateInputClass = (value) =>
  `form-control py-2 border-2 rounded-3 shadow-sm fw-medium transition-all ${
    value
      ? "border-danger bg-danger-subtle text-danger-emphasis"
      : "border-light bg-light text-muted"
  }`;

export const viewModeBtnClass = (active) =>
  `btn border-2 rounded-3 shadow-sm fw-medium transition-all px-3 py-2 ${
    active
      ? "border-danger bg-danger-subtle text-danger-emphasis"
      : "border-light bg-light text-muted"
  }`;

export const filterInputClass = dateInputClass;
