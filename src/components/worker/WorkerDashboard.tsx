import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/shared/Badge";
import { CheckCircle, Clock, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkspacesList from "../employee/WorkspacesList";

const tasks = [
    { id: 1, title: "Review Q4 Marketing Proposal", workflow: "Document Review", priority: "high", status: "todo", dueDate: "2 days" },
    { id: 2, title: "Verify Client Data: Acme Corp", workflow: "Customer Onboarding", priority: "medium", status: "in_progress", dueDate: "4 days" },
    { id: 3, title: "Process Invoice #INV-2024-812", workflow: "Invoice Processing", priority: "low", status: "todo", dueDate: "1 week" },
    { id: 4, title: "Generate Content Brief for Blog", workflow: "Content Creation", priority: "medium", status: "in_progress", dueDate: "3 days" },
    { id: 5, title: "Submit Final Expense Report", workflow: "Financial Reporting", priority: "high", status: "done", dueDate: "Yesterday" },
    { id: 6, title: "Onboard New Client: Peak Industries", workflow: "Customer Onboarding", priority: "high", status: "todo", dueDate: "Tomorrow" },
];

const TaskCard = ({ task }: { task: typeof tasks[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-foreground">{task.title}</p>
                <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}>
                    {task.priority}
                </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{task.workflow}</p>
            <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Due in {task.dueDate}</span>
                </div>
                <Button variant="ghost" size="sm">
                    Start <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
            </div>
        </CardContent>
    </Card>
);

export default function WorkerDashboard() {
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold font-headline flex items-center gap-2"><Circle className="w-5 h-5 text-yellow-500" /> To Do ({todoTasks.length})</h2>
                        {todoTasks.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold font-headline flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> In Progress ({inProgressTasks.length})</h2>
                        {inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold font-headline flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Done ({doneTasks.length})</h2>
                        {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <WorkspacesList />
            </div>
        </div>
    );
}
