// src/components/admin/step-icons.tsx
import {
  Bot,
  CheckCircle,
  Zap,
  MessageSquare,
  Users,
  AlertCircle,
  User,
  Calendar,
  Settings,
  FileText,
  Bell,
  GitBranch,
  Phone,
  Mail,
  FormInput
} from 'lucide-react';

export const stepIcons: { [key: string]: React.ElementType } = {
  // Triggers
  trigger_chat_message: MessageSquare,
  trigger_keyword_mention: AlertCircle,
  trigger_user_joins: User,
  trigger_incoming_email: Mail,
  trigger_incoming_sms: Phone,
  trigger_form_submission: FormInput,
  
  // Actions
  action_create_todo: CheckCircle,
  action_assign_task: User,
  action_request_approval: CheckCircle,
  action_send_email: Mail,
  action_create_calendar_event: Calendar,
  action_update_status: Settings,
  action_ai_analysis: Bot,
  action_log_information: FileText,
  action_send_notification: Bell,

  // New Types for Conditional Logic
  ai_agent: Bot,
  human_input: Users,
  api_call: Zap,
  notification: Bell,
  conditional_branch: GitBranch,
  
  // Default
  default: Zap,
};
