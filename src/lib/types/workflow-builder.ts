// src/lib/types/workflow-builder.ts
// This extends existing types without modifying the original types.ts

import type { 
    MultiWorkspaceCustomClaims, 
    WorkspaceAccess 
  } from './multi-workspace';
  
  // Workflow Builder specific types
  export interface WorkflowBuilderNode {
    id: string;
    type: 'trigger' | 'ai_processing' | 'data_integration' | 'human_action' | 'communication' | 'condition';
    subType: string;
    name: string;
    description: string;
    position: { x: number; y: number };
    config: Record<string, any>;
    locked?: boolean;
    required?: boolean;
    icon: string;
    color: string;
    category: string;
    // Multi-workspace support
    workspaceId?: string;
    permissions?: string[];
  }
  
  export interface NodeConnection {
    id: string;
    source: string;
    target: string;
    condition?: string;
    label?: string;
    path?: string;
  }
  
  export interface WorkflowBuilderTemplate {
    id?: string;
    name: string;
    description: string;
    category: 'general' | 'hr' | 'sales' | 'support' | 'custom';
    builderNodes: WorkflowBuilderNode[];
    connections: NodeConnection[];
    canvasSettings: CanvasSettings;
    permissions: TemplatePermissions;
    
    // Multi-workspace fields
    createdBy: string;
    partnerId?: string; // If created by partner admin
    isGlobal: boolean; // Global templates by Super Admin
    assignedPartners: string[]; // Partner IDs who can use this
    
    // Standard fields
    createdAt: any; // FirebaseTimestamp
    updatedAt: any; // FirebaseTimestamp
    version: number;
    status: 'draft' | 'active' | 'archived';
    
    customizationRules: CustomizationRule[];
  }
  
  export interface CanvasSettings {
    gridSize: number;
    snapToGrid: boolean;
    showGrid: boolean;
    zoomLevel: number;
    panPosition: { x: number; y: number };
  }
  
  export interface TemplatePermissions {
    canModifyNodes: boolean;
    canAddNodes: boolean;
    canRemoveNodes: boolean;
    canModifyConnections: boolean;
    lockedNodes: string[];
    allowedNodeTypes: string[];
  }
  
  export interface CustomizationRule {
    nodeId: string;
    field: string;
    allowedValues?: any[];
    required: boolean;
    validationRule?: string;
  }
  
  // Workflow Instance (deployed template)
  export interface WorkflowInstance {
    id?: string;
    templateId: string;
    templateName: string;
    partnerId: string;
    tenantId: string;
    workspaceId: string;
    
    // Customized version of the template
    customizedNodes: WorkflowBuilderNode[];
    customizedConnections: NodeConnection[];
    
    // Instance metadata
    createdBy: string;
    createdAt: any;
    status: 'active' | 'paused' | 'archived';
    
    // Execution tracking
    executionCount: number;
    lastExecutedAt?: any;
    successRate: number;
  }
  
  // Task execution types extending existing patterns
  export interface WorkflowTask {
    id?: string;
    instanceId: string;
    nodeId: string;
    stepNumber: number;
    
    // Multi-workspace context
    partnerId: string;
    tenantId: string;
    workspaceId: string;
    
    // Assignment
    assignedTo?: string;
    assignedBy?: string;
    assignedAt?: any;
    
    // Execution data
    title: string;
    description: string;
    status: 'assigned' | 'in_progress' | 'completed' | 'awaiting_approval' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    
    executionData: {
      inputs: Record<string, any>;
      outputs?: Record<string, any>;
      files?: string[];
      aiResults?: any;
    };
    
    // Approval workflow
    approvalWorkflow?: {
      required: boolean;
      approvers: string[];
      status: 'pending' | 'approved' | 'rejected';
      approvedBy?: string;
      approvedAt?: any;
      rejectionReason?: string;
    };
    
    // Timing
    dueDate?: any;
    startedAt?: any;
    completedAt?: any;
    estimatedDuration?: number; // minutes
    actualDuration?: number; // minutes
  }
  
  // Node type definitions
  export interface NodeTypeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    category: 'trigger' | 'ai_processing' | 'data_integration' | 'human_action' | 'communication' | 'condition';
    configSchema: Record<string, any>;
    defaultConfig: Record<string, any>;
    requiredPermissions?: string[];
  }
  
  // Workflow Builder Authentication State Extension
  export interface WorkflowBuilderAuthState {
    // Core permissions
    canCreateGlobalTemplates: boolean;
    canCustomizeTemplates: boolean;
    canExecuteTasks: boolean;
    canAssignTasks: boolean;
    canApproveTaskAllocation: boolean;
    canManageWorkflows: boolean;
    
    // Current context
    currentPartnerId?: string;
    currentTenantId?: string;
    currentWorkspaceId?: string;
    
    // Template access
    accessibleTemplates: string[];
    ownedTemplates: string[];
  }