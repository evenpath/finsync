import AdminHeader from "@/components/admin/AdminHeader";
import SystemLogs from "@/components/admin/SystemLogs";

export default function AdminLogsPage() {
  return (
    <>
      <AdminHeader
        title="System Logs"
        subtitle="Monitor system activities and troubleshoot issues."
      />
      <main className="flex-1 overflow-auto p-6">
        <SystemLogs />
      </main>
    </>
  );
}
