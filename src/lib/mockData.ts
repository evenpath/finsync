// Mock Data for Admin
export const mockPartners = [
  {
    id: 1,
    name: "TechCorp Industries",
    email: "admin@techcorp.com",
    status: "active",
    members: 45,
    workflows: 12,
    tasksCompleted: 1250,
    joinedDate: "2024-01-15",
    plan: "Enterprise",
    lastActive: "2 hours ago"
  },
  {
    id: 2,
    name: "Marketing Solutions Ltd",
    email: "admin@marketingsolutions.com",
    status: "active",
    members: 28,
    workflows: 8,
    tasksCompleted: 892,
    joinedDate: "2024-02-20",
    plan: "Professional",
    lastActive: "1 day ago"
  },
  {
    id: 3,
    name: "StartupHub",
    email: "admin@startuphub.com",
    status: "pending",
    members: 12,
    workflows: 3,
    tasksCompleted: 156,
    joinedDate: "2024-07-25",
    plan: "Starter",
    lastActive: "3 days ago"
  }
];

export const mockWorkflowTemplates = [
  {
    id: 1,
    title: "Document Review & Approval",
    description: "Complete document review process with AI analysis and multi-level approval",
    category: "Document Management",
    steps: 6,
    aiAgents: 2,
    assignedPartners: 8,
    totalUses: 245,
    status: "active",
    lastUpdated: "2024-07-28",
    tags: ["AI Analysis", "Approval", "Document"],
    estimatedTime: "2-4 hours"
  },
  {
    id: 2,
    title: "Customer Onboarding Flow",
    description: "Automated customer onboarding with data collection and verification",
    category: "Customer Management",
    steps: 8,
    aiAgents: 3,
    assignedPartners: 12,
    totalUses: 189,
    status: "active",
    lastUpdated: "2024-07-26",
    tags: ["Onboarding", "Verification", "CRM"],
    estimatedTime: "1-2 days"
  },
  {
    id: 3,
    title: "Invoice Processing Pipeline",
    description: "AI-powered invoice processing with automated data extraction",
    category: "Finance",
    steps: 5,
    aiAgents: 4,
    assignedPartners: 6,
    totalUses: 456,
    status: "active",
    lastUpdated: "2024-07-29",
    tags: ["Finance", "AI Extraction", "Automation"],
    estimatedTime: "30 minutes"
  },
  {
    id: 4,
    title: "Content Creation Workflow",
    description: "AI-assisted content creation and review process",
    category: "Content",
    steps: 4,
    aiAgents: 2,
    assignedPartners: 0,
    totalUses: 0,
    status: "draft",
    lastUpdated: "2024-07-30",
    tags: ["Content", "AI Generation", "Review"],
    estimatedTime: "1-3 hours"
  }
];

export const mockSystemStats = {
  totalPartners: 15,
  activeWorkflows: 42,
  totalTasks: 12456,
  systemUptime: "99.9%",
  avgResponseTime: "245ms",
  dailyActiveUsers: 342,
  monthlyGrowth: "+23%",
  storageUsed: "2.4TB"
};

export const mockSystemLogs = [
  {
    id: 1,
    timestamp: "2024-07-30 14:30:22",
    level: "info",
    action: "Partner Created",
    user: "admin@suupe.com",
    details: "New partner 'StartupHub' created successfully",
    ip: "192.168.1.100"
  },
  {
    id: 2,
    timestamp: "2024-07-30 14:25:15",
    level: "warning",
    action: "Workflow Assignment",
    user: "admin@suupe.com",
    details: "Workflow 'Document Review' assigned to TechCorp Industries",
    ip: "192.168.1.100"
  },
  {
    id: 3,
    timestamp: "2024-07-30 14:20:08",
    level: "error",
    action: "API Limit Exceeded",
    user: "system",
    details: "Partner 'Marketing Solutions Ltd' exceeded API rate limit",
    ip: "10.0.0.15"
  }
];

// Mock Data for Partner Admin
export const mockTeamMembers = [
  {
    id: 1,
    name: "Sarah Wilson",
    email: "sarah@techcorp.com",
    role: "Senior Analyst",
    status: "active",
    avatar: "https://placehold.co/40x40.png",
    tasksCompleted: 42,
    avgCompletionTime: "2.3h",
    lastActive: "2 hours ago",
    workspaces: ["Main", "Marketing"],
    skills: ["Document Review", "Data Analysis"],
    joinedDate: "2024-01-15"
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@techcorp.com",
    role: "Process Specialist",
    status: "active",
    avatar: "https://placehold.co/40x40.png",
    tasksCompleted: 38,
    avgCompletionTime: "3.1h",
    lastActive: "1 day ago",
    workspaces: ["Main", "Operations"],
    skills: ["Workflow Design", "Quality Control"],
    joinedDate: "2024-02-20"
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma@techcorp.com",
    role: "Junior Analyst",
    status: "invited",
    avatar: "https://placehold.co/40x40.png",
    tasksCompleted: 0,
    avgCompletionTime: "-",
    lastActive: "Never",
    workspaces: ["Main"],
    skills: [],
    joinedDate: "2024-07-28"
  }
];

export const mockAssignedWorkflows = [
  {
    id: 1,
    title: "Document Review & Approval",
    description: "Complete document review process with AI analysis",
    originalTemplate: "Admin Template - Document Review",
    status: "active",
    isCustomized: true,
    steps: 6,
    assignedWorkers: 3,
    completedTasks: 24,
    pendingTasks: 5,
    avgCompletionTime: "2.4h",
    lastModified: "2024-07-28",
    tags: ["AI Analysis", "Approval", "Document"],
    category: "Document Management"
  },
  {
    id: 2,
    title: "Invoice Processing Pipeline",
    description: "Automated invoice processing with custom approval steps",
    originalTemplate: "Admin Template - Invoice Processing",
    status: "active",
    isCustomized: true,
    steps: 7,
    assignedWorkers: 2,
    completedTasks: 18,
    pendingTasks: 3,
    avgCompletionTime: "45min",
    lastModified: "2024-07-26",
    tags: ["Finance", "Automation", "Approval"],
    category: "Finance"
  },
  {
    id: 3,
    title: "Customer Onboarding Flow",
    description: "Standard customer onboarding workflow",
    originalTemplate: "Admin Template - Customer Onboarding",
    status: "draft",
    isCustomized: false,
    steps: 8,
    assignedWorkers: 0,
    completedTasks: 0,
    pendingTasks: 0,
    avgCompletionTime: "-",
    lastModified: "2024-07-30",
    tags: ["Onboarding", "CRM"],
    category: "Customer Management"
  }
];

export const mockPendingApprovals = [
  {
    id: 1,
    taskTitle: "Review Marketing Proposal",
    workflow: "Document Review & Approval",
    assignee: "Sarah Wilson",
    submittedAt: "2024-07-30 14:30",
    priority: "high",
    type: "document_review",
    currentStep: "Manager Approval",
    details: "Marketing proposal for Q4 campaign needs final approval"
  },
  {
    id: 2,
    taskTitle: "Process Invoice #INV-2024-789",
    workflow: "Invoice Processing Pipeline",
    assignee: "Mike Chen",
    submittedAt: "2024-07-30 13:15",
    priority: "medium",
    type: "financial_approval",
    currentStep: "Financial Approval",
    details: "Office supplies invoice for $2,450.00"
  },
  {
    id: 3,
    taskTitle: "Client Data Verification",
    workflow: "Customer Onboarding Flow",
    assignee: "Sarah Wilson",
    submittedAt: "2024-07-30 11:45",
    priority: "low",
    type: "data_verification",
    currentStep: "Data Review",
    details: "New client information needs verification"
  }
];

export const mockWorkspaceStats = {
  totalTasks: 156,
  completedTasks: 89,
  pendingApprovals: 12,
  activeWorkers: 8,
  avgCompletionTime: "2.1h",
  successRate: "94%",
  monthlyTasks: "+18%",
  teamEfficiency: "87%"
};
