// ============================================================================
// FIREBASE BACKEND VARIABLES
// ============================================================================

// ============================================================================
// 1. FIREBASE AUTHENTICATION VARIABLES
// ============================================================================

export interface FirebaseAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  customClaims?: {
    role: 'Super Admin' | 'Admin' | 'partner' | 'employee';
    partnerId?: string;
    permissions?: string[];
  };
  creationTime: string;
  lastSignInTime: string;
  providerData: any[];
}

export interface AuthState {
  user: FirebaseAuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'Super Admin' | 'Admin';
    status: 'active' | 'invited' | 'suspended';
    avatar: string;
    lastActive: string;
    joinedDate: string;
    permissions: string[];
}

// ============================================================================
// 2. USER MANAGEMENT VARIABLES
// ============================================================================

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: 'admin' | 'partner' | 'employee';
  onboardingCompleted: boolean;
  workspaces?: UserWorkspaceLink[];
  preferences: UserPreferences;
  createdAt: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
  lastActiveAt: FirebaseTimestamp;
  isActive: boolean;
  timezone: string;
}

export interface UserWorkspaceLink {
  userId: string;
  partnerId: string;
  role: 'partner_admin' | 'employee';
  status: 'active' | 'invited' | 'suspended';
  permissions: string[];
  joinedAt: FirebaseTimestamp;
  invitedBy?: string;
  invitedAt?: FirebaseTimestamp;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  emailDigest: 'daily' | 'weekly' | 'never';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  workflowCompleted: boolean;
  workflowFailed: boolean;
  newTeamMember: boolean;
  systemUpdates: boolean;
}

export interface DashboardPreferences {
  defaultView: 'overview' | 'workflows' | 'analytics';
  widgetLayout: any[];
  refreshInterval: number;
}

// ============================================================================
// 3. PARTNER & WORKSPACE VARIABLES
// ============================================================================

export interface Partner {
  id: string;
  tenantId?: string;
  name: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  plan: 'Starter' | 'Professional' | 'Enterprise';
  joinedDate: string;
  industry: Industry | null;
  businessSize: 'small' | 'medium' | 'large';
  employeeCount: number;
  monthlyRevenue: string;
  location: { city: string; state: string };
  aiProfileCompleteness: number;
  stats: {
    activeWorkflows: number;
    totalExecutions: number;
    successRate: number;
    avgROI: number;
    timeSaved: string;
  };
  businessProfile: BusinessProfile | null;
  aiMemory: AIMemory | null;
  createdAt?: any; // Allow for serverTimestamp
  updatedAt?: any; // Allow for serverTimestamp
}


export interface PartnerSettings {
  allowEmployeeCustomization: boolean;
  requireApprovalForTasks: boolean;
  chatEnabled: boolean;
  maxEmployees: number;
  workflowExecutionLimits: {
    daily: number;
    monthly: number;
  };
  apiIntegrationLimits: number;
  customBranding: boolean;
  advancedAnalytics: boolean;
}

export interface PartnerSubscription {
  plan: 'trial' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: FirebaseTimestamp;
  currentPeriodEnd: FirebaseTimestamp;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface BillingInfo {
  companyName?: string;
  address?: Address;
  taxId?: string;
  billingEmail?: string;
  paymentMethod?: PaymentMethod;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// ============================================================================
// 4. INDUSTRY & BUSINESS PROFILE VARIABLES
// ============================================================================

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category?: string;
  workflowPatterns?: WorkflowPattern[];
  successMetrics?: SuccessMetric[];
  popularIntegrations?: string[];
  averageSetupTime?: number;
  averageROI?: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowPattern {
  name: string;
  description: string;
  frequency: 'common' | 'moderate' | 'rare';
  complexity: 'simple' | 'medium' | 'complex';
  estimatedValue: number;
}

export interface SuccessMetric {
  name: string;
  description: string;
  unit: string;
  benchmarkValue: number;
  formula?: string;
}

export interface BusinessProfile {
  id: string;
  partnerId: string;
  industryId: string;
  businessName: string;
  businessSize: 'small' | 'medium' | 'large';
  employeeCount?: number;
  location?: BusinessLocation;
  painPoints: string[];
  currentTools: CurrentTool[];
  goals: BusinessGoal[];
  monthlyRevenueRange?: string;
  budgetRange?: string;
  timelineExpectation?: string;
  technicalExpertise?: 'low' | 'medium' | 'high';
  createdAt?: any;
  updatedAt?: any;
}

export interface AIMemory {
    businessUnderstanding: string;
    keyInsights: string[];
    successPatterns: string;
    workflowPreferences: string;
    concernsRisks: string;
}

export interface BusinessLocation {
  city?: string;
  state?: string;
  country: string;
  timezone?: string;
}

export interface CurrentTool {
  name: string;
  category: string;
  satisfaction: 1 | 2 | 3 | 4 | 5;
  monthlySpend?: number;
  integrationRequired?: boolean;
}

export interface BusinessGoal {
  category?: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeline: string;
  measurable?: boolean;
}

// ============================================================================
// 5. WORKFLOW TEMPLATE VARIABLES
// ============================================================================

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  industryId?: string;
  industry?: Industry;
  templateType: 'ready' | 'ai_generated' | 'custom';
  complexity: 'simple' | 'medium' | 'complex';
  steps: WorkflowStep[];
  isFeatured: boolean;
  isPublic?: boolean;
  successRate: number;
  avgSetupTimeHours: number;
  roiPercentage: number;
  usageCount: number;
  userRating?: number;
  estimatedTime: string;
  tags: string[];
  icon: string;
  thumbnail?: string;
  apiIntegrations: string[];
  requiredPermissions?: string[];
  createdBy?: string;
  createdByRole?: 'admin' | 'partner';
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  aiAgents?: number;
}

export interface WorkflowStep {
  id: string;
  type: 'ai_agent' | 'human_input' | 'approval' | 'notification' | 'api_call' | 'conditional' | 'data_processing' | 'file_handling' | 'delay' | 'webhook';
  title: string;
  description: string;
  configuration: StepConfiguration;
  order: number;
  isRequired: boolean;
  conditions?: StepCondition[];
  errorHandling?: ErrorHandling;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  aiGenerated?: boolean;
}

export interface StepConfiguration {
  // AI Agent Step
  agentType?: 'summarize' | 'classify' | 'extract' | 'generate' | 'analyze' | 'translate' | 'sentiment';
  aiModel?: string;
  prompt?: string;
  systemPrompt?: string;
  provider?: 'openai' | 'anthropic' | 'google';
  temperature?: number;
  maxTokens?: number;
  
  // Manual Input Step
  inputType?: 'text' | 'file' | 'image' | 'form' | 'signature' | 'recording';
  fields?: FormField[];
  required?: boolean;
  placeholder?: string;
  validation?: ValidationRule[];
  fileTypes?: string[];
  maxFileSize?: number;
  
  // Approval Step
  approverRole?: 'partner_admin' | 'specific_user' | 'any_admin';
  approverId?: string;
  autoApprove?: boolean;
  timeoutHours?: number;
  escalationRules?: EscalationRule[];
  
  // Notification Step
  channel?: 'email' | 'sms' | 'chat' | 'push' | 'webhook';
  template?: string;
  recipients?: string[];
  urgent?: boolean;
  customMessage?: string;
  attachments?: string[];
  
  // API Call Step
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  authentication?: APIAuthentication;
  responseMapping?: ResponseMapping;
  
  // Conditional Step
  conditions?: LogicalCondition[];
  trueSteps?: string[];
  falseSteps?: string[];
  
  // Data Processing Step
  transformations?: DataTransformation[];
  validations?: DataValidation[];
  mappings?: DataMapping[];
  
  // Delay Step
  delayType?: 'fixed' | 'until_date' | 'until_condition';
  duration?: number;
  unit?: 'seconds' | 'minutes' | 'hours' | 'days';
  targetDate?: Date;
  condition?: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'file' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  defaultValue?: any;
  helpText?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface StepCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ErrorHandling {
  onError: 'stop' | 'continue' | 'retry' | 'skip' | 'escalate';
  maxRetries?: number;
  retryDelay?: number;
  fallbackSteps?: string[];
  notifyOnError?: boolean;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay?: number;
  multiplier?: number;
}

// ============================================================================
// 6. WORKFLOW INSTANCE & EXECUTION VARIABLES
// ============================================================================

export interface WorkflowInstance {
  id: string;
  templateId: string;
  template?: WorkflowTemplate;
  partnerId: string;
  businessProfileId?: string;
  name: string;
  description?: string;
  customizations: WorkflowCustomization[];
  deploymentStatus: 'draft' | 'testing' | 'live' | 'paused' | 'archived';
  triggerConfig: TriggerConfiguration;
  performanceMetrics: PerformanceMetrics;
  schedule?: ScheduleConfig;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastExecutedAt?: Date;
  nextExecutionAt?: Date;
}

export interface WorkflowCustomization {
  stepId: string;
  field: string;
  originalValue: any;
  customValue: any;
  reason?: string;
  modifiedBy: string;
  modifiedAt: Date;
}

export interface TriggerConfiguration {
  type: 'manual' | 'schedule' | 'webhook' | 'email' | 'form_submission' | 'api_event' | 'file_upload';
  settings: TriggerSettings;
  isActive: boolean;
}

export interface TriggerSettings {
  // Schedule Trigger
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string;
  timezone?: string;
  
  // Webhook Trigger
  webhookUrl?: string;
  secret?: string;
  headers?: Record<string, string>;
  
  // Form Trigger
  formId?: string;
  formFields?: string[];
  
  // Email Trigger
  emailAddress?: string;
  emailFilters?: EmailFilter[];
}

export interface EmailFilter {
  field: 'subject' | 'from' | 'body';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with';
  value: string;
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  timeOfDay?: string;
  timezone: string;
  nextRun?: Date;
}

export interface PerformanceMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  uptimePercentage: number;
  costPerExecution?: number;
  roiGenerated?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowInstanceId: string;
  workflowInstance?: WorkflowInstance;
  triggerData: any;
  executionPath: ExecutionStep[];
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  currentStepId?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  errorDetails?: ExecutionError;
  results: ExecutionResults;
  context: ExecutionContext;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdBy?: string;
}

export interface ExecutionStep {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  input?: any;
  output?: any;
  errorMessage?: string;
  retryCount?: number;
  assignedTo?: string;
}

export interface ExecutionError {
  code: string;
  message: string;
  stepId?: string;
  timestamp: Date;
  stackTrace?: string;
  recoverable: boolean;
}

export interface ExecutionResults {
  success: boolean;
  data: any;
  files?: ExecutionFile[];
  notifications?: NotificationResult[];
  apiCalls?: APICallResult[];
  metrics?: any;
}

export interface ExecutionFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface NotificationResult {
  channel: string;
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
  messageId?: string;
  timestamp: Date;
}

export interface APICallResult {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  timestamp: Date;
}

export interface ExecutionContext {
  partnerId: string;
  userId?: string;
  businessProfileId?: string;
  environment: 'production' | 'testing' | 'development';
  variables: Record<string, any>;
  metadata: Record<string, any>;
}

// ============================================================================
// 7. AI GENERATION VARIABLES
// ============================================================================

export interface ProblemDescription {
  id: string;
  partnerId: string;
  businessProfileId?: string;
  rawDescription: string;
  parsedAnalysis?: ProblemAnalysis;
  generatedWorkflowId?: string;
  generationStatus: 'pending' | 'analyzing' | 'generating' | 'completed' | 'failed';
  userRating?: number;
  isSuccessful?: boolean;
  feedback?: string;
  improvementSuggestions?: string[];
  createdBy: string;
  createdAt: Date;
  processedAt?: Date;
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
  similarProblems?: string[];
  industryContext?: string;
  businessImpact: BusinessImpact;
}

export interface BusinessImpact {
  timeSpent: string;
  costEstimate: number;
  frequencyPerMonth: number;
  peopleInvolved: number;
  riskLevel: 'low' | 'medium' | 'high';
  automationPotential: number;
}

export interface AIGenerationLog {
  id: string;
  problemDescriptionId: string;
  model: string;
  provider: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  cost: number;
  processingTime: number;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export interface AITrainingData {
  id: string;
  problemDescription: string;
  generatedWorkflow: any;
  userFeedback: AIFeedback;
  industryContext: string;
  businessSize: string;
  successMetrics: any;
  createdAt: Date;
}

export interface AIFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  usefulSteps: string[];
  unnecessarySteps: string[];
  missingSteps: string[];
  comments: string;
  wouldRecommend: boolean;
}

// ============================================================================
// 8. API INTEGRATION VARIABLES
// ============================================================================

export interface APIIntegration {
  id: string;
  name: string;
  displayName: string;
  category: 'communication' | 'business_ops' | 'industry_specific' | 'storage' | 'analytics' | 'payment';
  description: string;
  logoUrl: string;
  documentationUrl: string;
  websiteUrl: string;
  pricingModel: 'free' | 'freemium' | 'paid' | 'enterprise';
  setupDifficulty: 'easy' | 'medium' | 'hard';
  popularityScore: number;
  isActive: boolean;
  supportedActions: APIAction[];
  authenticationMethods: AuthMethod[];
  requiredFields: APIField[];
  optionalFields: APIField[];
  webhookSupport: boolean;
  rateLimits: RateLimit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface APIAction {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  parameters: APIParameter[];
  responseFormat: any;
  examples: APIExample[];
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: ValidationRule;
}

export interface APIExample {
  name: string;
  description: string;
  request: any;
  response: any;
}

export interface AuthMethod {
  type: 'api_key' | 'oauth2' | 'basic_auth' | 'bearer_token' | 'custom';
  fields: string[];
  instructions: string;
  testEndpoint?: string;
}

export interface APIField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select' | 'textarea';
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: ValidationRule[];
}

export interface RateLimit {
  type: 'requests_per_minute' | 'requests_per_hour' | 'requests_per_day';
  limit: number;
  tier?: string;
}

export interface PartnerAPIConfiguration {
  id: string;
  partnerId: string;
  apiIntegrationId: string;
  apiIntegration?: APIIntegration;
  displayName?: string;
  configuration: APICredentials;
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastTestAt?: Date;
  lastErrorAt?: Date;
  errorMessage?: string;
  usageStats: APIUsageStats;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface APICredentials {
  authType: string;
  credentials: Record<string, any>; // Encrypted
  endpoints?: Record<string, string>;
  settings?: Record<string, any>;
}

export interface APIUsageStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastCallAt?: Date;
  averageResponseTime: number;
  monthlyUsage: number;
  quotaUsed?: number;
  quotaLimit?: number;
}

// ============================================================================
// 9. TEAM MANAGEMENT VARIABLES
// ============================================================================

export interface TeamMember {
  id: number;
  userId?: string;
  user?: UserProfile;
  partnerId?: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'suspended' | 'left';
  permissions?: TeamPermission[];
  skills: string[];
  workloadCapacity?: number;
  currentWorkload?: number;
  performanceMetrics?: TeamMemberMetrics;
  assignedWorkflows?: string[];
  availability?: Availability;
  invitedBy?: string;
  invitedAt?: Date;
  joinedDate?: string;
  lastActive?: string;
  avatar: string;
  tasksCompleted: number;
  avgCompletionTime: string;
}

export interface TeamPermission {
  resource: string;
  actions: string[];
  conditions?: any[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface TeamMemberMetrics {
  tasksCompleted: number;
  averageCompletionTime: number;
  qualityScore: number;
  customerSatisfaction: number;
  punctualityScore: number;
  communicationScore: number;
  lastReview?: TeamReview;
}

export interface TeamReview {
  reviewerId: string;
  rating: number;
  comments: string;
  areas_for_improvement: string[];
  strengths: string[];
  reviewedAt: Date;
}

export interface Availability {
  timezone: string;
  workingHours: WorkingHours[];
  holidays: Holiday[];
  timeOff: TimeOff[];
  isAvailable: boolean;
  lastUpdated: Date;
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isActive: boolean;
}

export interface Holiday {
  name: string;
  date: Date;
  isRecurring: boolean;
}

export interface TimeOff {
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
}

// ============================================================================
// 10. ANALYTICS & REPORTING VARIABLES
// ============================================================================

export interface AnalyticsData {
  id: string;
  partnerId: string;
  type: 'workflow_performance' | 'team_metrics' | 'business_impact' | 'cost_analysis' | 'usage_stats';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  data: AnalyticsMetrics;
  createdAt: Date;
}

export interface AnalyticsMetrics {
  // Workflow Performance
  totalExecutions?: number;
  successRate?: number;
  averageExecutionTime?: number;
  errorRate?: number;
  topPerformingWorkflows?: WorkflowStat[];
  bottleneckSteps?: StepStat[];
  
  // Team Metrics
  teamProductivity?: number;
  averageTaskCompletionTime?: number;
  teamUtilization?: number;
  topPerformers?: TeamMemberStat[];
  
  // Business Impact
  timesSaved?: number;
  costReduction?: number;
  revenueGenerated?: number;
  customerSatisfactionImpact?: number;
  
  // Usage Stats
  activeUsers?: number;
  workflowsCreated?: number;
  apiCallsCount?: number;
  storageUsed?: number;
}

export interface WorkflowStat {
  workflowId: string;
  name: string;
  executions: number;
  successRate: number;
  averageTime: number;
  roi: number;
}

export interface StepStat {
  stepId: string;
  stepName: string;
  averageTime: number;
  failureRate: number;
  bottleneckScore: number;
}

export interface TeamMemberStat {
  userId: string;
  name: string;
  tasksCompleted: number;
  averageTime: number;
  qualityScore: number;
}

export interface DashboardWidget {
  id: string;
  partnerId: string;
  userId: string;
  type: 'chart' | 'metric' | 'table' | 'progress' | 'list';
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  configuration: WidgetConfig;
  dataSource: string;
  refreshInterval: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetPosition {
  x: number;
  y: number;
  row: number;
  column: number;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  metrics?: string[];
  timeframe?: string;
  filters?: any[];
  colors?: string[];
  showLegend?: boolean;
  showGridlines?: boolean;
}

// ============================================================================
// 11. NOTIFICATION & COMMUNICATION VARIABLES
// ============================================================================

export interface Notification {
  id: string;
  recipientId: string;
  recipientType: 'user' | 'partner' | 'team';
  type: 'workflow_completed' | 'workflow_failed' | 'task_assigned' | 'team_invitation' | 'system_update' | 'billing_alert';
  title: string;
  message: string;
  data?: any;
  channels: NotificationChannel[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  sentAt?: Date;
}

export interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'in_app';
  address?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  errorMessage?: string;
  deliveredAt?: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'workflow_update';
  attachments?: MessageAttachment[];
  replyTo?: string;
  reactions?: MessageReaction[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'workflow' | 'support';
  name?: string;
  description?: string;
  participants: ConversationParticipant[];
  workflowId?: string;
  partnerId?: string;
  lastMessage?: ChatMessage;
  lastMessageAt?: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ConversationParticipant {
  userId: string;
  role: 'member' | 'admin' | 'observer';
  joinedAt: Date;
  lastReadAt?: Date;
  notificationSettings: {
    muted: boolean;
    muteUntil?: Date;
  };
}

// ============================================================================
// 12. SYSTEM CONFIGURATION VARIABLES
// ============================================================================

export interface SystemConfig {
  id: string;
  category: 'ai' | 'integrations' | 'security' | 'billing' | 'features';
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isEditable: boolean;
  requiresRestart: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetPartners?: string[];
  conditions?: FeatureFlagCondition[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlagCondition {
  type: 'user_role' | 'partner_plan' | 'industry' | 'custom';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: any;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  partnerId?: string;
}

// ============================================================================
// 13. FILE & STORAGE VARIABLES
// ============================================================================

export interface FileUpload {
  id: string;
  name: string;
  originalName: string;
  type: string;
  size: number;
  url: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  ownerId: string;
  ownerType: 'user' | 'partner' | 'workflow';
  partnerId?: string;
  workflowId?: string;
  executionId?: string;
  isPublic: boolean;
  tags: string[];
  metadata: FileMetadata;
  virusScanResult?: 'clean' | 'infected' | 'pending';
  createdAt: Date;
  expiresAt?: Date;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
  language?: string;
  extractedText?: string;
  checksum: string;
}

export interface StorageQuota {
  partnerId: string;
  totalLimit: number; // bytes
  usedSpace: number; // bytes
  fileCount: number;
  lastCalculatedAt: Date;
  alertThreshold: number; // percentage
  alertSent: boolean;
}

// ============================================================================
// 14. BILLING & SUBSCRIPTION VARIABLES
// ============================================================================

export interface Invoice {
  id: string;
  partnerId: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  amount: number;
  tax: number;
  total: number;
  currency: string;
  lineItems: InvoiceLineItem[];
  billingPeriod: BillingPeriod;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  paymentMethod?: string;
  stripeInvoiceId?: string;
  downloadUrl?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'subscription' | 'usage' | 'setup' | 'addon';
}

export interface BillingPeriod {
  start: Date;
  end: Date;
  type: 'monthly' | 'quarterly' | 'yearly';
}

export interface UsageRecord {
  id: string;
  partnerId: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
  billingPeriod: string;
  details?: any;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimit[];
  isActive: boolean;
  isPopular: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: Date;
}

export interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimit {
  resource: string;
  limit: number;
  unit: string;
}

// ============================================================================
// 15. WEBHOOK & EVENT VARIABLES
// ============================================================================

export interface WebhookEndpoint {
  id: string;
  partnerId: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  failureCount: number;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  createdAt: Date;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventType: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed';
  httpStatus?: number;
  responseBody?: string;
  attemptCount: number;
  nextRetryAt?: Date;
  createdAt: Date;
  deliveredAt?: Date;
}

export interface SystemEvent {
  id: string;
  type: string;
  data: any;
  partnerId?: string;
  userId?: string;
  workflowId?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  processed: boolean;
  createdAt: Date;
}

// ============================================================================
// 16. UTILITY & HELPER TYPES
// ============================================================================

export type FirebaseTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export interface LogicalCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
  children?: LogicalCondition[];
}

export interface DataTransformation {
  type: 'map' | 'filter' | 'reduce' | 'sort' | 'group' | 'format' | 'calculate';
  field?: string;
  operation: string;
  parameters?: any;
}

export interface DataValidation {
  field: string;
  rules: ValidationRule[];
  required: boolean;
  onFailure: 'error' | 'warning' | 'skip';
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: any;
}

export interface ResponseMapping {
  successField?: string;
  dataField?: string;
  errorField?: string;
  transformations?: DataTransformation[];
}

export interface APIAuthentication {
  type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2';
  credentials: Record<string, any>;
}

export interface EscalationRule {
  condition: string;
  escalateTo: string;
  delayMinutes: number;
  notificationMessage: string;
}

// ============================================================================
// 17. COLLECTION REFERENCES (FOR FIRESTORE)
// ============================================================================

export interface FirestoreCollections {
  // Core Collections
  users: 'users';
  partners: 'partners';
  industries: 'industries';
  businessProfiles: 'businessProfiles';
  
  // Workflow Collections
  workflowTemplates: 'workflowTemplates';
  workflowInstances: 'workflowInstances';
  workflowExecutions: 'workflowExecutions';
  
  // AI Collections
  problemDescriptions: 'problemDescriptions';
  aiGenerationLogs: 'aiGenerationLogs';
  aiTrainingData: 'aiTrainingData';
  
  // Integration Collections
  apiIntegrations: 'apiIntegrations';
  partnerAPIConfigurations: 'partnerAPIConfigurations';
  
  // Team Collections
  teamMembers: 'teamMembers';
  
  // Analytics Collections
  analyticsData: 'analyticsData';
  dashboardWidgets: 'dashboardWidgets';
  
  // Communication Collections
  notifications: 'notifications';
  conversations: 'conversations';
  chatMessages: 'chatMessages';
  
  // System Collections
  systemConfig: 'systemConfig';
  featureFlags: 'featureFlags';
  auditLogs: 'auditLogs';
  
  // File Collections
  fileUploads: 'fileUploads';
  storageQuotas: 'storageQuotas';
  
  // Billing Collections
  invoices: 'invoices';
  usageRecords: 'usageRecords';
  pricingPlans: 'pricingPlans';
  
  // Event Collections
  webhookEndpoints: 'webhookEndpoints';
  webhookDeliveries: 'webhookDeliveries';
  systemEvents: 'systemEvents';
}

// ============================================================================
// 18. SECURITY RULES VARIABLES
// ============================================================================

export interface SecurityContext {
  userId: string;
  userRole: 'admin' | 'partner' | 'employee';
  permissions: string[];
  customClaims: any;
}

export interface ResourceAccess {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  allowed: boolean;
  conditions?: any[];
}
