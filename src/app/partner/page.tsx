
// src/app/partner/page.tsx
"use client";

import PartnerHeader from "../../components/partner/PartnerHeader";
import { mockWorkflowTemplates, industries } from "../../lib/mockData";
import type { BusinessProfile, WorkflowTemplate } from '../../lib/types';
import HybridWorkflowDashboard from "../../components/partner/HybridWorkflowDashboard";
import PartnerAuthWrapper from "../../components/partner/PartnerAuthWrapper";


// Mocks for demonstration
const mockBusinessProfile: BusinessProfile = {
  id: "bp-1",
  partnerId: "partner-1",
  industryId: "d8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8",
  industry: industries[0],
  businessName: "Sunnyvale Properties",
  businessSize: 'medium',
  employeeCount: 45,
  locationCity: "Sunnyvale",
  locationState: "CA",
  locationCountry: "US",
  painPoints: ["Emergency maintenance calls at all hours", "Tenant rent collection issues"],
  currentTools: [],
  goals: ["Improve tenant satisfaction", "Reduce manual admin work"],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDeployedWorkflows: any[] = [
    mockWorkflowTemplates[0],
    mockWorkflowTemplates[1]
];

const mockRecommendedTemplates: WorkflowTemplate[] = mockWorkflowTemplates.filter(t => t.templateType === 'ready');

function PartnerDashboardPage() {
  // In a real app, you would fetch this data
  const businessProfile = mockBusinessProfile;
  const deployedWorkflows = mockDeployedWorkflows;
  const recommendedTemplates = mockRecommendedTemplates;

  // if (!businessProfile) {
  //   // In a real app, you'd redirect to onboarding if no profile exists.
  //   // For now, we'll just show a loading state or nothing.
  //   return <div>Loading...</div>;
  // }

  return (
    <>
      <PartnerHeader
        title="Dashboard"
        subtitle="Manage your AI-powered workflows"
      />
      <main className="flex-1 overflow-auto p-6">
        <HybridWorkflowDashboard 
          businessProfile={businessProfile}
          deployedWorkflows={deployedWorkflows}
          recommendedTemplates={recommendedTemplates}
        />
      </main>
    </>
  );
}


export default function PartnerDashboard() {
  return (
    <PartnerAuthWrapper>
      <PartnerDashboardPage />
    </PartnerAuthWrapper>
  )
}
