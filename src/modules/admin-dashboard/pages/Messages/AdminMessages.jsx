import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import DetailModal from "../../../../components/shared/DetailModal/DetailModal";
import AdminPagination from "../../components/shared/AdminPagination";
import { useMessages } from "../../hooks/useMessages";
import MessageCard from "./MessageCard";
// import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import { openExternalUrl } from "../../../../utils/openExternalUrl";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

function AdminMessages() {
  const { i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const {
    messages,
    selectedMessage,
    pagination: apiPagination,
    loading,
    getMessages,
    getMessageById,
  } = useMessages();

  // Debounce the search term to avoid hitting the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // جلب البيانات عند تحميل الصفحة وتغير الترقيم أو البحث
  useEffect(() => {
    getMessages({
      page: currentPage,
      search: debouncedSearchTerm,
      date_filter: selectedPeriod === "all" ? "" : selectedPeriod,
    });
  }, [currentPage, debouncedSearchTerm, selectedPeriod, getMessages]);

  // تصفير الصفحة عند تغيير الفلتر أو البحث المفلتر لتجنب أخطاء ترقيم الصفحات
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedPeriod]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = async (id) => {
    const data = await getMessageById(id);
    if (data) {
      setShowViewModal(true);
    }
  };

  // معالجة التواصل عبر واتساب للرسائل
  const handleWhatsapp = (phone, name, messageBody = "") => {
    if (!phone) return;

    let cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.startsWith("0")) {
      cleanPhone = "20" + cleanPhone.slice(1);
    }

    if (!cleanPhone.startsWith("20")) {
      cleanPhone = "20" + cleanPhone;
    }

    const formattedMessageText = isArabic
      ? `مرحباً ${name}، معك فريق الدعم الخاص بمنصة T-Square.

وردتنا رسالتك، 

مع تحيات فريق T-Square.
`
      : `Hello ${name}, this is the T-Square Support Team.

We have received your message. .............

Best regards,
T-Square Team.
`;

    const encodedMessage = encodeURIComponent(formattedMessageText);
    openExternalUrl(`https://wa.me/${cleanPhone}?text=${encodedMessage}`);
  };

  // تفعيل زر الواتساب من خلال جلب رقم الهاتف ديناميكياً بالـ ID من الـ API تفصيلياً
  const handleWhatsappClick = async (id, name, content) => {
    const data = await getMessageById(id);
    const phone = data?.phone || data?.data?.phone || data?.message?.phone;

    if (phone) {
      handleWhatsapp(phone, name, content);
    } else {
      toastError(
        isArabic
          ? "عذراً، لا يوجد رقم هاتف مسجل لهذه الرسالة!"
          : "Sorry, no phone number registered for this message!"
      );
    }
  };

  return (
    <div className="admin-content-page" dir={isArabic ? "rtl" : "ltr"}>
      {/* ── رأس الصفحة ── */}
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">
            {isArabic ? "رسائل الاتصال" : "Contact Messages"}
          </h2>
          <p className="ac-subtitle text-muted mb-0">
            {isArabic
              ? "مراجعة وإدارة رسائل العملاء والطلاب الواردة عبر نموذج تواصل معنا"
              : "Review and manage customer and student messages received via the contact form"}
          </p>
        </div>
      </div>

      {/* ── شريط أدوات البحث والفلترة ── */}
      <div className="ac-filters-bar d-flex justify-content-between align-items-center  p-3 mb-4">
        {/* السيرش بار */}
        <div className="ac-search-input-wrapper position-relative w-100 w-md-50">
          <i
            className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${
              searchTerm ? "text-danger fw-bold" : "text-muted"
            }`}
            style={{ zIndex: 3 }}
          ></i>
          <input
            type="text"
            className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${
              searchTerm
                ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium"
                : "border-light bg-light text-muted"
            }`}
            placeholder={isArabic ? "بحث في الرسائل..." : "Search messages..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // تصفير الصفحة عند البحث
            }}
          />
        </div>
        {/* Date-Range Filter (All time, Last week, Last month, Last year) */}
        <select
          className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${
            selectedPeriod !== "all"
              ? "border-danger bg-danger-subtle text-danger-emphasis"
              : "border-light bg-light text-muted"
          }`}
          value={selectedPeriod}
          onChange={(e) => {
            setSelectedPeriod(e.target.value);
            setCurrentPage(1); // تصفير الصفحة عند تغيير الفلتر الزمني
          }}
        >
          <option value="all">{isArabic ? "كل الأوقات" : "All time"}</option>
          <option value="last_week">
            {isArabic ? "الأسبوع الماضي" : "Last week"}
          </option>
          <option value="last_month">
            {isArabic ? "الشهر الماضي" : "Last month"}
          </option>
          <option value="last_3_months">
            {isArabic ? "آخر ٣ أشهر" : "Last 3 months"}
          </option>
        </select>
      </div>

      {/* ── قائمة الرسائل أو اللودينج أو الحالة الفارغة ── */}
      {loading && messages.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 text-muted fw-semibold">
            {isArabic ? "جاري تحميل الرسائل..." : "Loading messages..."}
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded-4 shadow-sm">
          <i className="bi bi-chat-left-text-fill text-muted fs-1 mb-3 d-block"></i>
          <h5 className="fw-bold text-dark">
            {isArabic ? "لا توجد رسائل واردة" : "No Messages Received"}
          </h5>
          <p className="text-muted small px-3">
            {isArabic
              ? "لم يتم استقبال أي رسائل اتصال تطابق بحثك حالياً."
              : "No contact messages match your search criteria at the moment."}
          </p>
        </div>
      ) : (
        <div className="messages-list-wrapper">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onView={handleView}
              onWhatsapp={handleWhatsappClick}
              // onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── الترقيم الصفحي (Pagination) ── */}
      {apiPagination && (
        <AdminPagination
          pagination={apiPagination}
          onPageChange={handlePageChange}
        />
      )}

      {/* ── مودال تفاصيل الرسالة ── */}
      <DetailModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        title={isArabic ? "تفاصيل الرسالة" : "Message Details"}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {selectedMessage && (
          <div className="cert-modal-content" dir={isArabic ? "rtl" : "ltr"}>
            <div className="cert-info-list p-3 bg-light rounded-3 mt-3">
              <div className="info-item d-flex justify-content-between mb-2">
                <span className="text-muted">
                  {isArabic ? "الاسم الكامل:" : "Full Name:"}
                </span>
                <span className="fw-medium text-dark">
                  {selectedMessage.name}
                </span>
              </div>

              <div className="info-item d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted">
                  {isArabic ? "البريد الإلكتروني:" : "Email Address:"}
                </span>
                <span className="fw-medium text-dark text-end ms-2">
                  {selectedMessage.email}
                </span>
              </div>
              
              <div className="info-item d-flex justify-content-between mb-2">
                <span className="text-muted">
                  {isArabic ? "رقم الهاتف:" : "Phone Number:"}
                </span>
                <span className="fw-medium text-dark">
                  {selectedMessage.phone || "-"}
                </span>
              </div>

              <div className="info-item d-flex justify-content-between mt-3">
                <span className="text-muted">
                  {isArabic ? "تاريخ الإرسال:" : "Sent Date:"}
                </span>
                <span className="fw-medium small text-muted">
                  {selectedMessage.created_at}
                </span>
              </div>

              <div className="info-item d-flex justify-content-between mb-2">
                <span className="text-muted">
                  {isArabic ? "الموضوع:" : "Subject:"}
                </span>
                <span className="fw-bold text-danger">
                  {selectedMessage.title || selectedMessage.subject}
                </span>
              </div>

              <div className="info-item d-flex flex-column  mt-1 mb-3">
                <span className="text-center fw-bold mb-3">
                  {isArabic ? "نص الرسالة" : "Message Body"}
                </span>
                <p
                  className="mb-0 bg-white p-3 rounded-3 border small text-secondary"
                  style={{
                    lineHeight: "1.6",
                    whiteSpace: "pre-line",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                  dir="ltr"
                >
                  {selectedMessage.content || selectedMessage.message}
                </p>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              {selectedMessage.phone && (
                <Button
                  variant="success"
                  className="w-100 rounded-3 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 border-0"
                  onClick={() =>
                    handleWhatsapp(
                      selectedMessage.phone,
                      selectedMessage.name,
                      selectedMessage.content || selectedMessage.message,
                    )
                  }
                  style={{ backgroundColor: "#25D366", color: "#ffffff" }}
                >
                  <i className="bi bi-whatsapp"></i>
                  {isArabic ? "تواصل واتساب" : "Contact WhatsApp"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}

export default AdminMessages;
