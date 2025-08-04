// src/app/partner/team/diagnostics/page.tsx
"use client";

import React from 'react';
import TeamManagementDiagnostics from "@/components/partner/TeamManagementDiagnostics";
import PartnerAuthWrapper from "@/components/partner/PartnerAuthWrapper";


function PartnerTeamDiagnosticsPage() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <TeamManagementDiagnostics />
    </div>
  );
}


export default function PartnerTeamDiagnosticsProtected() {
    return (
        <PartnerAuthWrapper>
            <PartnerTeamDiagnosticsPage />
        </PartnerAuthWrapper>
    )
}
