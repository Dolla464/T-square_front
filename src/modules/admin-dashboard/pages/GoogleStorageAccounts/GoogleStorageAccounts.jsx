import { Spinner } from "react-bootstrap";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGoogleStorageAccounts } from "../../hooks/useGoogleStorageAccounts";
import { showConfirmCustom, showDeleteConfirm, showInputDialog } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import "./GoogleStorageAccounts.css";

function statusBadge(status, isArabic) {
  const map = {
    connected: { className: "bg-success-subtle text-success", label: isArabic ? "متصل" : "Connected" },
    disconnected: { className: "bg-danger-subtle text-danger", label: isArabic ? "غير متصل" : "Disconnected" },
    pending: { className: "bg-warning-subtle text-warning", label: isArabic ? "قيد الانتظار" : "Pending" },
  };

  const item = map[status] || map.pending;
  return <span className={`badge rounded-pill ${item.className}`}>{item.label}</span>;
}

function GoogleStorageAccounts() {
  const [searchParams] = useSearchParams();
  const isArabic = document.documentElement.lang === "ar" || document.documentElement.dir === "rtl";
  const {
    accounts,
    loading,
    fetchAccounts,
    createAccount,
    removeAccount,
    connectAccount,
    disconnectAccount,
    testConnection,
  } = useGoogleStorageAccounts();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "1") {
      fetchAccounts();
    }

    if (error) {
      fetchAccounts();
    }
  }, [searchParams, fetchAccounts]);

  const handleCreate = async () => {
    const name = await showInputDialog({
      title: isArabic ? "إضافة حساب Google" : "Add Google Account",
      message: isArabic
        ? "أدخل اسمًا يُميّز هذا الحساب داخل المنصة."
        : "Enter a name to identify this account on the platform.",
      inputPlaceholder: isArabic ? "اسم الحساب" : "Account name",
      confirmText: isArabic ? "إضافة" : "Add",
      icon: "info",
      variant: "primary",
      requiredMessage: isArabic ? "يرجى إدخال اسم الحساب." : "Please enter an account name.",
    });

    if (!name) return;
    await createAccount(name);
  };

  const handleDelete = async (account) => {
    const confirmed = await showDeleteConfirm(
      isArabic ? "حذف حساب Google؟" : "Delete Google account?",
      isArabic
        ? "سيتم حذف الحساب إذا لم يكن مرتبطًا بأي كورس."
        : "The account will be deleted if no courses are assigned.",
    );
    if (confirmed) {
      await removeAccount(account.id);
    }
  };

  const handleDisconnect = async (account) => {
    const confirmed = await showConfirmCustom({
      title: isArabic ? "فصل الحساب؟" : "Disconnect account?",
      text: isArabic
        ? "سيتم إزالة صلاحيات الوصول من المنصة."
        : "Platform access will be revoked for this account.",
      confirmText: isArabic ? "فصل" : "Disconnect",
    });
    if (confirmed) {
      await disconnectAccount(account.id);
    }
  };

  const connectLabel =
    (account) =>
      account.status === "connected"
        ? isArabic
          ? "إعادة الربط"
          : "Reconnect"
        : isArabic
          ? "ربط"
          : "Connect";

  return (
    <div className="admin-content-page">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">
            {isArabic ? "حسابات Google Storage" : "Google Storage Accounts"}
          </h2>
          <p className="ac-subtitle text-muted mb-0">
            {isArabic
              ? "اربط حسابات Google Drive متعددة وعيّنها للكورسات."
              : "Connect multiple Google Drive accounts and assign them to courses."}
          </p>
        </div>
        <button type="button" className="btn btn-danger ac-add-btn" onClick={handleCreate}>
          <i className="bi bi-plus-lg me-0 me-md-1"></i>
          <span className="d-none d-md-inline">
            {isArabic ? "إضافة حساب" : "Add Account"}
          </span>
        </button>
      </div>

      <div className="ac-table-card">
        <div className="ac-table-container">
          <div className="ac-rounded-table p-3 p-md-0">
            {searchParams.get("connected") === "1" && (
              <div className="alert alert-success mx-3 mt-3 mb-0">
                {isArabic ? "تم ربط الحساب بنجاح." : "Account connected successfully."}
              </div>
            )}

            {searchParams.get("error") && (
              <div className="alert alert-danger mx-3 mt-3 mb-0">
                {isArabic
                  ? "تعذر إكمال ربط Google. حاول مرة أخرى."
                  : "Google connection could not be completed. Please try again."}
              </div>
            )}

            <div className="ac-google-storage-table-wrap">
              <table className="table ac-table ac-google-storage-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="text-center col-name">
                      {isArabic ? "الاسم" : "Name"}
                    </th>
                    <th className="text-center col-email">
                      {isArabic ? "البريد" : "Email"}
                    </th>
                    <th className="text-center col-status">
                      {isArabic ? "الحالة" : "Status"}
                    </th>
                    <th className="text-center col-courses">
                      {isArabic ? "الكورسات" : "Courses"}
                    </th>
                    <th className="text-center col-last-check">
                      {isArabic ? "آخر فحص" : "Last Check"}
                    </th>
                    <th className="text-center col-actions">
                      {isArabic ? "إجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        <Spinner animation="border" variant="danger" />
                      </td>
                    </tr>
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-5">
                        {isArabic ? "لا توجد حسابات بعد." : "No accounts yet."}
                      </td>
                    </tr>
                  ) : (
                    accounts.map((account) => (
                      <tr key={account.id}>
                        <td className="text-center fw-semibold col-name">
                          {account.name}
                        </td>
                        <td className="text-center text-secondary col-email">
                          <span className="ac-truncate-text" title={account.email || "—"}>
                            {account.email || "—"}
                          </span>
                        </td>
                        <td className="text-center col-status">
                          {statusBadge(account.status, isArabic)}
                        </td>
                        <td className="text-center col-courses">
                          {account.courses_count ?? 0}
                        </td>
                        <td className="text-center text-secondary col-last-check">
                          {account.last_checked_at
                            ? new Date(account.last_checked_at).toLocaleString()
                            : "—"}
                        </td>
                        <td className="text-center col-actions">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              type="button"
                              className="btn btn-sm ac-btn-view border-0"
                              title={connectLabel(account)}
                              onClick={() => connectAccount(account.id)}
                            >
                              <i className="bi bi-link-45deg fs-6"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm ac-btn-edit border-0"
                              title={isArabic ? "اختبار" : "Test"}
                              onClick={() => testConnection(account.id)}
                            >
                              <i className="bi bi-lightning-charge fs-6"></i>
                            </button>
                            {account.status === "connected" && (
                              <button
                                type="button"
                                className="btn btn-sm border-0 text-warning"
                                style={{ backgroundColor: "#fff8e1" }}
                                title={isArabic ? "فصل" : "Disconnect"}
                                onClick={() => handleDisconnect(account)}
                              >
                                <i className="bi bi-plug fs-6"></i>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm ac-btn-deleteTable border-0"
                              title={isArabic ? "حذف" : "Delete"}
                              onClick={() => handleDelete(account)}
                            >
                              <i className="bi bi-trash fs-6"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleStorageAccounts;
