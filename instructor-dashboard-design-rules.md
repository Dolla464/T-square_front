# Instructor Dashboard — Design Rules & Reference Guide
> **Source of Truth**: Admin Dashboard Design System  
> **Target**: Instructor Dashboard (`src/modules/instructor-dashboard`)

This document defines the visual design reference and standardized UI rules for the Instructor Dashboard. All instructor pages must strictly adhere to these rules to maintain complete visual consistency with the Admin Dashboard.

---

## 1. Design Tokens Reference

### Color Palette
- **Primary Red**: `#be1522` / `#d32f2f` (used for active states, borders, primary brand accents)
- **Hover Red**: `#b71c1c` / `#9a111b`
- **Text Primary**: `#1a1a1a`
- **Text Secondary**: `#4b5563`
- **Text Muted**: `#8a8d93` / `#a0a4ab`
- **Border**: `#eaeaea`
- **Background**: `#f9f9fb`
- **Card White**: `#ffffff`
- **Success Tint**: `#e6f4ea` (text: `#137333`)
- **Danger Tint**: `#fff1f2` (text: `#d32f2f`)
- **Active Session Tint**: `#fff5f5`

### Spacing & Padding
- **Stat Cards (`.state`)**: `13px` top/bottom, `20px` left/right
- **Filter Bars (`.ac-filters-bar`)**: `16px` padding
- **Table Cells (`.ac-table td/th`)**: `16px` padding
- **Form Bodies (`.ac-form-body`)**: `1.5rem` (`p-4`)
- **Page Header Bottom Gap**: `mb-4` (`1.5rem`)
- **Section Gap**: `mb-4` between major content blocks

### Border Radius
- **Cards & Tables**: `12px` (`border-radius: 12px`)
- **Buttons**: `8px` (`rounded-3`)
- **Form Inputs & Selects**: `8px` (`rounded-3`)
- **Status Badges**: `20px` (`rounded-pill`)
- **Stat Icon Wrappers**: `8px` (`rounded-3`)

### Elevation & Box Shadows
- **Standard Cards & Table Wrappers**: `0 2px 4px rgba(0, 0, 0, 0.02)`
- **Red Primary Buttons**: `0 4px 6px rgba(211, 47, 47, 0.2)`
- **Hover Transitions**: Subtle elevation (`0 4px 16px rgba(0, 0, 0, 0.1)`) on clickable cards (e.g., schedule session cards).

---

## 2. Layout Rules

### Page Wrapper & Container Usage
- Every dashboard page must be wrapped in the standard `.admin-content-page` class:
  ```jsx
  <div className="admin-content-page instructor-[page-name]">
    ...
  </div>
  ```
- **Page Header**: Must use `.ac-header` flex wrapper with `.ac-title` and `.ac-subtitle`:
  ```jsx
  <div className="ac-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
    <div>
      <h2 className="ac-title mb-0">Page Title</h2>
      <p className="ac-subtitle mb-0 mt-1">Subtitle text or meta info</p>
    </div>
    <div className="d-flex gap-2">
      {/* Primary / Secondary action buttons */}
    </div>
  </div>
  ```
- **Section Spacing**: Maintain consistent vertical rhythm by separating distinct functional sections (e.g., stat cards, filters, tables) with `mb-4`.

---

## 3. Typography Rules

- **Page Titles (`.ac-title`)**: `1.5rem`, font-weight `700`, color `#1a1a1a`.
- **Subtitles (`.ac-subtitle`)**: `0.9rem`, color `#8a8d93`.
- **Table Headers (`.ac-table th`)**: `0.85rem`, font-weight `600`, color `#4b5563`, text-transform uppercase or title case.
- **Table Body (`.ac-table td`)**: `0.9rem`, font-weight `400` or `500`, vertical alignment middle (`align-middle`).
- **Stat Values (`.state-value`)**: `18px`, font-weight `700` (`fw-bold`), color `#1a1a1a`.
- **Labels & Meta Text**: `small` or `0.82rem`, color `#8a8d93` (`text-muted`).

---

## 4. Card Rules

### Stat Cards (`.state`)
Stat cards must avoid generic Bootstrap `<Card>` defaults and instead follow the Admin `.state` layout pattern:
```jsx
<div className="state d-flex flex-column justify-content-between" style={{ minHeight: "130px" }}>
  <div className="d-flex justify-content-between align-items-center mb-2">
    <div
      className="rounded-3 d-flex align-items-center justify-content-center"
      style={{ width: "40px", height: "40px", backgroundColor: tintBg, color: tintColor }}
    >
      <i className={`bi ${icon} fs-5`}></i>
    </div>
  </div>
  <div>
    <div className="fw-bold mb-1 state-value">{value}</div>
    <span className="text-muted" style={{ fontSize: "0.82rem" }}>{label}</span>
  </div>
</div>
```

### Content & Information Cards
- Must have white background (`#ffffff`), `border: 1px solid #eaeaea`, and `border-radius: 12px`.
- Box shadow: `0 2px 4px rgba(0, 0, 0, 0.02)`.
- Active or highlighted session cards (e.g., in Attendance) use `border: 2px solid #be1522` and background `#fff5f5`.

---

## 5. Table Rules

### Table Wrappers
All data tables must be encapsulated within the Admin standardized table card container:
```jsx
<div className="ac-table-card mb-4">
  <div className="ac-table-container">
    <div className="ac-rounded-table">
      <div className="table-responsive">
        <table className="table ac-table mb-0 align-middle">
          <thead>
            <tr>
              <th>Column 1</th>
              <th>Column 2</th>
              ...
            </tr>
          </thead>
          <tbody>
            ...
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
```

### Header & Row Styling
- **No Bootstrap Light Backgrounds**: Do not use `thead.table-light` or `#fff1f2` backgrounds for table headers. Standard `.ac-table th` uses white background with a bottom border `border-bottom: 2px solid #eaeaea`.
- **Cell Padding**: Ensure `16px` padding across table cells (`td` and `th`).
- **Row Hover**: Handled automatically by `.ac-table tbody tr:hover`.

### Actions Placement
- Action buttons (View, Edit, Delete) must reside in the right-most column (or left-most in RTL when appropriate) using standard Admin classes: `.ac-btn-view`, `.ac-btn-edit`, `.ac-btn-deleteTable`.

---

## 6. Filter & Search Rules

- **Filter Bar Container**:
  ```jsx
  <div className="ac-filters-bar mb-4 p-3 bg-white border rounded-3 shadow-sm">
    ...
  </div>
  ```
  *(Or using Bootstrap `<Card className="border-0 shadow-sm mb-4 ac-filters-bar">`)*
- **Search Inputs**: Must use `.ac-search-input` with appropriate padding and subtle focus transitions.
- **Select Dropdowns**: Must use `.ac-form-select` or helper styling from `adminUiStyles.js`.

---

## 7. Form Rules

- **Form Container**: Wrap forms in `.ac-form-body p-4 bg-white border rounded-4 shadow-sm`.
- **Form Inputs**: Apply `form-control ac-form-input p-3 bg-light border-0 rounded-3`.
- **Buttons**:
  - Save/Submit: `btn btn-danger px-4 py-2 rounded-3`
  - Cancel/Back: `.ac-back-btn` or outline neutral buttons.

---

## 8. Empty States & Loading States

### Empty States
Avoid non-standard gray backgrounds (`#f8f9fa`). Standardize empty states as clean centered blocks within white card containers or table wrappers:
```jsx
<div className="text-center py-5">
  <i className="bi bi-folder2-open text-muted" style={{ fontSize: "2.5rem" }}></i>
  <p className="text-muted mt-3 mb-0 fw-medium">No records found at the moment.</p>
</div>
```

### Loading States
When loading data within tables or sections, use standard red spinners without altering underlying fetching logic:
```jsx
<div className="text-center py-5">
  <Spinner animation="border" variant="danger" size="sm" />
</div>
```

---

## 9. Responsive Rules

- **Desktop (>= 1200px)**: 4 stat cards per row (`col-xl-3`), tables full width with visible horizontal padding.
- **Tablet (768px - 1199px)**: 2 stat cards per row (`col-md-6`), filters wrap gracefully using Bootstrap flex/grid classes.
- **Mobile (< 768px)**: 1 stat card per row (`col-12`), tables scroll horizontally via `.table-responsive`, filter bars stack vertically (`flex-column`).
