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
  type: 'ai_agent' | 'manual_input' | 'approval' | 'notification' | 'api_call' | 'conditional'
  title: string
  description: string
  configuration: StepConfiguration
  order: number
  conditions?: StepCondition[]
  isRequired: boolean
}

export interface StepConfiguration {
  // AI Agent Step
  agentType?: 'summarize' | 'classify' | 'extract' | 'generate' | 'analyze'
  aiModel?: string
  prompt?: string
  
  // Manual Input Step
  inputType?: 'text' | 'file' | 'image' | 'form'
  fields?: FormField[]
  
  // Approval Step
  approverRole?: 'partner_admin' | 'specific_user'
  approverId?: string
  
  // Notification Step
  notificationChannel?: 'email' | 'chat' | 'push'
  template?: string
  
  // API Call Step
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  payload?: any
  
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
