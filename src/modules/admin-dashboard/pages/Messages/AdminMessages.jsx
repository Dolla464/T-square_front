import AdminPlaceholder from "../../components/AdminPlaceholder/AdminPlaceholder";

function AdminMessages() {
  return (
    <div>
      <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Messages</h4>
      <AdminPlaceholder
        icon="bi-chat-dots"
        title="Contact Messages"
        subtitle="Read and respond to messages received from the contact form."
      />
    </div>
  );
}
export default AdminMessages;
