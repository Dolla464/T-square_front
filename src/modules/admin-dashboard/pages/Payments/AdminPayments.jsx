import AdminPlaceholder from "../../components/AdminPlaceholder/AdminPlaceholder";

function AdminPayments() {
  return (
    <div>
      <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Payments</h4>
      <AdminPlaceholder
        icon="bi-credit-card"
        title="Payments & Orders"
        subtitle="Track payments, invoices and financial reports."
      />
    </div>
  );
}
export default AdminPayments;
