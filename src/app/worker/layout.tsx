import WorkspaceHeader from "@/components/worker/WorkspaceHeader";
import WorkspaceSwitcher from "@/components/worker/WorkspaceSwitcher";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex h-screen bg-background">
        <WorkspaceSwitcher />
        <div className="flex flex-1 flex-col">
          <WorkspaceHeader />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
  );
}
