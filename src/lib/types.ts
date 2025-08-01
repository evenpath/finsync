
export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  phoneNumber: string | null
  role: 'admin' | 'partner' | 'worker'
  onboardingCompleted: boolean
  workspaces?: UserWorkspaceLink[]
  createdAt: Date
  updatedAt: Date
}

export interface UserWorkspaceLink {
  userId: string
  partnerId: string
  role: 'partner_admin' | 'worker'
  status: 'active' | 'invited' | 'suspended'
  permissions: string[]
  joinedAt: Date
}

export interface Partner {
  id: string
  name: string
  description?: string
  adminIds: string[]
  workerIds: string[]
  workflowIds: string[]
  settings: PartnerSettings
  createdAt: Date
  updatedAt: Date
}

export interface PartnerSettings {
  allowWorkerCustomization: boolean
  requireApprovalForTasks: boolean
  chatEnabled: boolean
  maxWorkers: number
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  workflowPatterns: Record<string, any>;
  successMetrics: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessProfile {
  id: string;
  partnerId: string;
  industryId: string;
  industry?: Industry;
  businessName: string;
  businessSize: 'small' | 'medium' | 'large';
  employeeCount?: number;
  locationCity?: string;
  locationState?: string;
  locationCountry: string;
  painPoints: string[];
  currentTools: Record<string, any>;
  goals: string[];
  monthlyRevenueRange?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced WorkflowTemplate
export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  industryId?: string;
  industry?: Industry;
  templateType: 'ready' | 'ai_generated' | 'custom';
  complexity: 'simple' | 'medium' | 'complex';
  steps: number | WorkflowStep[];
  isFeatured: boolean;
  successRate: number;
  avgSetupTimeHours: number;
  roiPercentage: number;
  usageCount: number;
  estimatedTime: string;
  tags: string[];
  icon: string;
  apiIntegrations: string[]; // IDs of required integrations
  createdAt: Date;
  updatedAt: Date;
  aiAgents?: number;
}

export interface ProblemDescription {
  id: string;
  partnerId: string;
  businessProfileId: string;
  rawDescription: string;
  parsedAnalysis?: ProblemAnalysis;
  generatedWorkflowId?: string;
  userRating?: number;
  isSuccessful?: boolean;
  feedback?: string;
  createdAt: Date;
}

export interface ProblemAnalysis {
  category: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  stakeholders: string[];
  triggerEvents: string[];
  desiredOutcomes: string[];
  estimatedComplexity: number;
  suggestedIntegrations: string[];
  confidenceScore: number;
}

export interface APIIntegration {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl: string;
  documentationUrl: string;
  pricingModel: string;
  setupDifficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  createdAt: Date;
}

export interface PartnerAPIConfiguration {
  id: string;
  partnerId: string;
  apiIntegrationId: string;
  apiIntegration?: APIIntegration;
  configuration: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  lastTestAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited';
  avatar: string;
  tasksCompleted: number;
  avgCompletionTime: string;
  lastActive: string;
  skills: string[];
  joinedDate: string;
}

export interface Workflow {
  id: string
  title: string
  description: string
  createdBy: string // Admin ID
  createdByRole: 'admin' | 'partner'
  baseTemplateId?: string // If customized from admin template
  partnerId?: string // If partner-specific
  steps: WorkflowStep[]
  status: 'draft' | 'published' | 'archived'
  assignedTo: string[] // User IDs
  tags: string[]
  isTemplate?: boolean // If it's a global template
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowStep {
  id: string
  type: 'ai_agent' | 'human_input' | 'approval' | 'notification' | 'api_call' | 'conditional' | 'data_processing' | 'file_handling';
  title: string
  description: string
  configuration: StepConfiguration
  order: number
  isRequired: boolean
  conditions?: StepCondition[]
}

export interface StepConfiguration {
  // AI Agent Step
  agentType?: 'summarize' | 'classify' | 'extract' | 'generate' | 'analyze'
  aiModel?: string
  prompt?: string
  provider?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  
  // Manual Input Step
  inputType?: 'text' | 'file' | 'image' | 'form'
  fields?: FormField[]
  required?: boolean;
  placeholder?: string;
  validation?: string;
  
  // Approval Step
  approverRole?: 'partner_admin' | 'specific_user'
  approverId?: string
  autoApprove?: boolean;
  timeoutHours?: number;
  
  // Notification Step
  notificationChannel?: 'email' | 'chat' | 'push'
  channel?: 'email' | 'sms' | 'chat';
  template?: string
  recipients?: string[];
  urgent?: boolean;
  
  // API Call Step
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any;
  
  // Conditional Step
  condition?: string
  trueStepId?: string
  falseStepId?: string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'select'
  options?: string[]
}

export interface StepCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'lt'
  value: any
}

export interface Task {
  id: string
  workflowId: string
  currentStepId: string
  assignedTo: string // Worker ID
  partnerId: string
  status: 'assigned' | 'in_progress' | 'awaiting_approval' | 'completed' | 'failed'
  data: Record<string, any> // Task execution data
  stepResults: StepResult[]
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface StepResult {
  stepId: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  result?: any
  error?: string
  startedAt?: Date
  completedAt?: Date
  executedBy?: string
}

export interface ChatMessage {
  id: string
  workspaceId: string
  channelId?: string
  senderId: string
  content: string
  type: 'text' | 'file' | 'system' | 'workflow_notification'
  attachments?: string[]
  mentions?: string[]
  threadId?: string
  createdAt: Date
  updatedAt?: Date
}

export interface Workspace {
  id: string
  partnerId: string
  name: string
  description?: string
  members: WorkspaceMember[]
  channels: ChatChannel[]
  settings: WorkspaceSettings
  createdAt: Date
  updatedAt: Date
}

export interface WorkspaceMember {
  userId: string
  role: 'admin' | 'member'
  joinedAt: Date
  status: 'active' | 'inactive'
}

export interface ChatChannel {
  id: string
  name: string
  type: 'general' | 'task_specific' | 'private'
  members: string[]
  createdBy: string
  createdAt: Date
}

export interface WorkspaceSettings {
  allowGuestUsers: boolean
  requireApprovalToJoin: boolean
  allowFileSharing: boolean
  retentionPeriod: number // days
}
