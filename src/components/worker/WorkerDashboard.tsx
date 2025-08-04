import WorkspacesList from "../employee/WorkspacesList";

export default function WorkerDashboard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2">
                {/* Future content can be added here */}
            </div>
            <div className="space-y-4">
                <WorkspacesList />
            </div>
        </div>
    );
}
