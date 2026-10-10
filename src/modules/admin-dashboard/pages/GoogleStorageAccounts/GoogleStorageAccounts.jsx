import { Spinner } from "react-bootstrap";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGoogleStorageAccounts } from "../../hooks/useGoogleStorageAccounts";
import { showConfirmCustom, showDeleteConfirm, showInputDialog } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastError, toastSuccess } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import "./GoogleStorageAccounts.css";
import { isArabicLocale } from "../../../../utils/isArabicLocale";

function statusBadge(status, t) {
  const map = {
    connected: { className: "bg-success-subtle text-success", label: t("google_storage_page.status_connected") },
    disconnected: { className: "bg-danger-subtle text-danger", label: t("google_storage_page.status_disconnected") },
    pending: { className: "bg-warning-subtle text-warning", label: t("google_storage_page.status_pending") },
  };

  const item = map[status] || map.pending;
  return <span className={`badge rounded-pill ${item.className}`}>{item.label}</span>;
}

function GoogleStorageAccounts() {
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = isArabicLocale(i18n.language);
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
      toastSuccess(t("google_storage_page.connected_success"));
    }

    if (error) {
      fetchAccounts();
      toastError(t("google_storage_page.connect_failed"));
    }
  }, [searchParams, fetchAccounts, t]);

  const handleCreate = async () => {
    const name = await showInputDialog({
      title: t("google_storage_page.add_dialog_title"),
      message: t("google_storage_page.add_dialog_message"),
      inputPlaceholder: t("google_storage_page.account_name_placeholder"),
      confirmText: t("google_storage_page.add"),
      icon: "info",
      variant: "primary",
      requiredMessage: t("google_storage_page.name_required"),
    });

    if (!name) return;
    await createAccount(name);
  };

  const handleDelete = async (account) => {
    const coursesCount = account.courses_count ?? 0;

    if (coursesCount > 0) {
      toastError(t("google_storage_page.delete_blocked", { count: coursesCount }));
      return;
    }

    const confirmed = await showDeleteConfirm(
      t("google_storage_page.delete_title"),
      t("google_storage_page.delete_message"),
    );
    if (confirmed) {
      await removeAccount(account.id);
    }
  };

  const handleDisconnect = async (account) => {
    const confirmed = await showConfirmCustom({
      title: t("google_storage_page.disconnect_title"),
      text: t("google_storage_page.disconnect_message"),
      confirmText: t("google_storage_page.disconnect"),
    });
    if (confirmed) {
      await disconnectAccount(account.id);
    }
  };

  const connectLabel = (account) =>
    account.status === "connected"
      ? t("google_storage_page.reconnect")
      : t("google_storage_page.connect");

  return (
    <div className="admin-content-page">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{t("google_storage_page.title")}</h2>
          <p className="ac-subtitle text-muted mb-0">
            {t("google_storage_page.subtitle")}
          </p>
        </div>
        <button type="button" className="btn btn-danger ac-add-btn" onClick={handleCreate}>
          <i className="bi bi-plus-lg me-0 me-md-1"></i>
          <span className="d-none d-md-inline">
            {t("google_storage_page.add_account")}
          </span>
        </button>
      </div>

      <div className="ac-table-card">
        <div className="ac-table-container">
          <div className="ac-rounded-table p-3 p-md-0" dir={isArabic ? "rtl" : "ltr"}>
            <div className="ac-google-storage-table-wrap">
              <table className="table ac-table ac-google-storage-table mb-0 align-middle" dir={isArabic ? "rtl" : "ltr"}>
                <thead>
                  <tr>
                    <th className="text-center col-name">
                      {t("google_storage_page.col_name")}
                    </th>
                    <th className="text-center col-email">
                      {t("google_storage_page.col_email")}
                    </th>
                    <th className="text-center col-status">
                      {t("google_storage_page.col_status")}
                    </th>
                    <th className="text-center col-courses">
                      {t("google_storage_page.col_courses")}
                    </th>
                    <th className="text-center col-last-check">
                      {t("google_storage_page.col_last_check")}
                    </th>
                    <th className="text-center col-actions">
                      {t("google_storage_page.col_actions")}
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
                        {t("google_storage_page.no_accounts")}
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
                          {statusBadge(account.status, t)}
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
                              title={t("google_storage_page.test")}
                              onClick={() => testConnection(account.id)}
                            >
                              <i className="bi bi-lightning-charge fs-6"></i>
                            </button>
                            {account.status === "connected" && (
                              <button
                                type="button"
                                className="btn btn-sm border-0 text-warning"
                                style={{ backgroundColor: "#fff8e1" }}
                                title={t("google_storage_page.disconnect")}
                                onClick={() => handleDisconnect(account)}
                              >
                                <i className="bi bi-plug fs-6"></i>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm ac-btn-deleteTable border-0"
                              title={
                                (account.courses_count ?? 0) > 0
                                  ? t("google_storage_page.cannot_delete_assigned", {
                                      count: account.courses_count,
                                    })
                                  : t("google_storage_page.delete")
                              }
                              disabled={(account.courses_count ?? 0) > 0}
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
