import { AdminSettingsProvider } from "../hooks/useAdminSettings";
import AdminLayout from "./AdminLayout";

export default function AdminRouteShell() {
  return (
    <AdminSettingsProvider>
      <AdminLayout />
    </AdminSettingsProvider>
  );
}
