# Messages Page Implementation Plan (Admin Dashboard)

This document outlines the systematic plan for implementing the **Messages** page in the Admin Dashboard, following existing project patterns and architectural standards.

---

## 1. Directory Structure & Files

Following the established project structure in `src/modules/admin-dashboard`, the following files will be created/updated:

- **Service:** `src/modules/admin-dashboard/services/messagesService.js`
- **Hook:** `src/modules/admin-dashboard/hooks/useMessages.js`
- **Page Component:** `src/modules/admin-dashboard/pages/Messages/AdminMessages.jsx`
- **Sub-Component:** `src/modules/admin-dashboard/pages/Messages/MessageCard.jsx` (New file for card UI)

---

## 2. Service Layer (`messagesService.js`)

**Responsibility:** Simulate API calls for contact form submissions.

- **Mock Data:** Create 3 realistic messages.
- **Methods:**
    - `getMessages()`: Returns a promise resolving to the list of messages.
    - `getMessageById(id)`: Returns a promise resolving to a specific message.

**Data Structure:**
```js
{
  id: 1,
  name: "Ahmed Mohamed",
  email: "ahmed@example.com",
  phone: "+201234567890",
  subject: "Course Inquiry",
  message: "I need more information about the course content and schedule.",
  created_at: "2026-05-30 10:15 AM"
}
```

---

## 3. Hook Layer (`useMessages.js`)

**Responsibility:** Manage business logic, state, and API interaction.

- **State Management:**
    - `messages` (Array)
    - `loading` (Boolean)
    - `error` (String|null)
    - `selectedMessage` (Object|null)
    - `showModal` (Boolean)
- **Actions:**
    - `fetchMessages()`: Calls service and updates state.
    - `openMessageDetails(id)`: Fetches specific message and shows modal.
    - `closeModal()`: Resets selected message and hides modal.

---

## 4. UI Layer

### 4.1 AdminMessages Page
- **Pattern:** Inherit from `AdminContentPage.css` patterns.
- **Components:**
    - **Header:** Title (الرسائل / Messages) and Subtitle.
    - **List Container:** A div with `notifications-list` logic (stacked cards).
    - **Empty State:** Handle "No messages found" scenario.
    - **Loading State:** Standard dashboard spinner.
    - **Details Modal:** Reuse `react-bootstrap` Modal with `cert-detail-modal` style.

### 4.2 MessageCard Component
- **Layout:** Stacked card layout (similar to `NotificationCard`).
- **Displays:** Name, Email, Phone, Subject, and Date.
- **Actions:** "View" button using `.ac-btn-view` class.

### 4.3 Details Modal
- **Structure:**
    - **Header:** "Message Details" with close button.
    - **Body:** Use `info-item d-flex justify-content-between` pattern for metadata.
    - **Message Content:** A scrollable/wrapped text area for the long message.
    - **Footer Action:** WhatsApp button using `.ac-btn-whatsapp` and `window.open`.

---

## 5. Styling & Responsiveness

- **Shared CSS:** Import `../../components/shared/AdminContentPage/AdminContentPage.css`.
- **Classes to use:**
    - `.admin-content-page`, `.ac-header`, `.ac-title`, `.ac-subtitle`
    - `.ac-btn-view`, `.ac-btn-whatsapp`
    - Bootstrap utility classes for spacing (`mb-4`, `p-3`, `gap-2`).
- **Responsive:**
    - Mobile: Cards take full width, typography scales down.
    - Tablet/Desktop: Grid or optimized stack.

---

## 6. QA Checklist

- [ ] **Architecture:** Hook/Service/Component separation followed.
- [ ] **Consistency:** Modal matches Reviews/Orders pages exactly.
- [ ] **i18n:** Supports both Arabic and English using `i18n` instance.
- [ ] **Logic:** WhatsApp link correctly formats the phone number.
- [ ] **Edge Cases:** Service error handled, empty state looks clean.

---

# خطة تنفيذ صفحة الرسائل (لوحة تحكم المسؤول)

سيتم تنفيذ صفحة **الرسائل** باتباع الأنماط المعمارية الحالية في المشروع:

1.  **الخدمة (Service):** إنشاء `messagesService.js` لمحاكاة جلب البيانات مع بيانات تجريبية (Mock Data).
2.  **الخطاف (Hook):** إنشاء `useMessages.js` لإدارة حالة الرسائل، التحميل، والتحكم في "المودال".
3.  **واجهة المستخدم (UI):**
    *   تحديث `AdminMessages.jsx` لاستخدام الخطاف الجديد.
    *   اعتماد تصميم "البطاقات المتراكمة" (Stacked Cards) كما هو الحال في صفحة الإشعارات.
    *   استخدام "المودال" الخاص بتفاصيل الرسالة بنفس نمط صفحة المراجعات والشهادات.
4.  **الإجراءات:** إضافة زر "واتساب" في تفاصيل الرسالة لفتح محادثة مباشرة مع العميل.
5.  **التنسيق:** الالتزام بملف التنسيق المشترك `AdminContentPage.css` لضمان اتساق المظهر.
