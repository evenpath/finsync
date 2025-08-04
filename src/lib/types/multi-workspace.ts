// src/lib/types/multi-workspace.ts

export interface MultiWorkspaceCustomClaims {
    role: 'Super Admin' | 'Admin' | 'partner_admin' | 'employee';
    
    // Legacy single workspace support (backward compatibility)
    partnerId?: string;
    tenantId?: string;
    
    // NEW: Multi-workspace support
    partnerIds?: string[]; // Array of partner IDs user has access to
    workspaces?: WorkspaceAccess[]; // Detailed workspace access info
    
    // Current active workspace (for UI context)
    activePartnerId?: string;
    activeTenantId?: string;
  }
  
  export interface WorkspaceAccess {
    partnerId: string;
    tenantId: string;
    role: 'partner_admin' | 'employee';
    permissions: string[];
    status: 'active' | 'invited' | 'suspended';
  }
  
  // Enhanced FirebaseAuthUser with multi-workspace support
  export interface MultiWorkspaceFirebaseAuthUser extends Omit<FirebaseAuthUser, 'customClaims'> {
    customClaims?: MultiWorkspaceCustomClaims;
  }
  
  // User Workspace Link document structure
  export interface UserWorkspaceLink {
    id?: string; // Document ID
    userId: string;
    partnerId: string;
    tenantId: string;
    role: 'partner_admin' | 'employee';
    status: 'active' | 'invited' | 'suspended';
    permissions: string[];
    joinedAt: FirebaseTimestamp;
    invitedBy?: string;
    invitedAt?: FirebaseTimestamp;
    lastAccessedAt?: FirebaseTimestamp;
    
    // Partner/workspace details (denormalized for quick access)
    partnerName: string;
    partnerAvatar?: string;
  }
  
  // Current workspace context (stored per user)
  export interface UserWorkspaceContext {
    userId: string;
    activePartnerId: string;
    activeTenantId: string;
    lastSwitchedAt: FirebaseTimestamp;
    availableWorkspaces: string[]; // Partner IDs
  }
  
  // Workspace invitation
  export interface WorkspaceInvitation {
    id?: string;
    email: string;
    partnerId: string;
    tenantId: string;
    role: 'partner_admin' | 'employee';
    invitedBy: string; // User ID
    invitedAt: FirebaseTimestamp;
    expiresAt: FirebaseTimestamp;
    status: 'pending' | 'accepted' | 'expired' | 'cancelled';
    inviteCode?: string; // Optional invite code for self-service joining
    
    // Partner details for the invitation
    partnerName: string;
    inviterName: string;
    inviterEmail: string;
  }
  
  // Multi-workspace authentication state
  export interface MultiWorkspaceAuthState extends Omit<AuthState, 'user'> {
    user: MultiWorkspaceFirebaseAuthUser | null;
    currentWorkspace: WorkspaceAccess | null;
    availableWorkspaces: WorkspaceAccess[];
    
    // Workspace switching
    switchWorkspace: (partnerId: string) => Promise<boolean>;
    refreshWorkspaces: () => Promise<void>;
    
    // Multi-workspace permissions
    hasAccessToPartner: (partnerId: string) => boolean;
    isPartnerAdminFor: (partnerId: string) => boolean;
    canModifyPartner: (partnerId: string) => boolean;
  }