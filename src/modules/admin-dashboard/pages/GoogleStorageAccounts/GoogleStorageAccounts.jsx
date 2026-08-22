import { Spinner } from "react-bootstrap";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGoogleStorageAccounts } from "../../hooks/useGoogleStorageAccounts";
import { showConfirmCustom, showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

function statusBadge(status, isArabic) {
  const map = {
    connected: { className: "bg-success", label: isArabic ? "متصل" : "Connected" },
    disconnected: { className: "bg-danger", label: isArabic ? "غير متصل" : "Disconnected" },
    pending: { className: "bg-warning text-dark", label: isArabic ? "قيد الانتظار" : "Pending" },
  };

  const item = map[status] || map.pending;
  return <span className={`badge ${item.className}`}>{item.label}</span>;
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
      // handled visually by stale account list refresh
      fetchAccounts();
    }
  }, [searchParams, fetchAccounts]);

  const handleCreate = async () => {
    const name = window.prompt(isArabic ? "اسم الحساب" : "Account name");
    if (!name?.trim()) return;
    await createAccount(name.trim());
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

  return (
    <div className="admin-content-page p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {isArabic ? "حسابات Google Storage" : "Google Storage Accounts"}
          </h4>
          <p className="text-muted mb-0">
            {isArabic
              ? "اربط حسابات Google Drive متعددة وعيّنها للكورسات."
              : "Connect multiple Google Drive accounts and assign them to courses."}
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={handleCreate}>
          {isArabic ? "إضافة حساب" : "Add Account"}
        </button>
      </div>

      {searchParams.get("connected") === "1" && (
        <div className="alert alert-success">
          {isArabic ? "تم ربط الحساب بنجاح." : "Account connected successfully."}
        </div>
      )}

      {searchParams.get("error") && (
        <div className="alert alert-danger">
          {isArabic
            ? "تعذر إكمال ربط Google. حاول مرة أخرى."
            : "Google connection could not be completed. Please try again."}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
        </div>
      ) : (
        <div className="table-responsive bg-white border rounded-4 shadow-sm">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>{isArabic ? "الاسم" : "Name"}</th>
                <th>{isArabic ? "البريد" : "Email"}</th>
                <th>{isArabic ? "الحالة" : "Status"}</th>
                <th>{isArabic ? "الكورسات" : "Courses"}</th>
                <th>{isArabic ? "آخر فحص" : "Last Check"}</th>
                <th>{isArabic ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    {isArabic ? "لا توجد حسابات بعد." : "No accounts yet."}
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="fw-semibold">{account.name}</td>
                    <td>{account.email || "—"}</td>
                    <td>{statusBadge(account.status, isArabic)}</td>
                    <td>{account.courses_count ?? 0}</td>
                    <td>{account.last_checked_at ? new Date(account.last_checked_at).toLocaleString() : "—"}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => connectAccount(account.id)}
                        >
                          {account.status === "connected"
                            ? isArabic
                              ? "إعادة الربط"
                              : "Reconnect"
                            : isArabic
                              ? "ربط"
                              : "Connect"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => testConnection(account.id)}
                        >
                          {isArabic ? "اختبار" : "Test"}
                        </button>
                        {account.status === "connected" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleDisconnect(account)}
                          >
                            {isArabic ? "فصل" : "Disconnect"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => handleDelete(account)}
                        >
                          {isArabic ? "حذف" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GoogleStorageAccounts;
