
// src/components/partner/team/diagnostics/page.tsx
"use client";

import React from 'react';
import TeamManagementDiagnostics from "../../../partner/TeamManagementDiagnostics";
import PartnerAuthWrapper from "../../../partner/PartnerAuthWrapper";


function PartnerTeamDiagnosticsPage() {
  return (
    <PartnerAuthWrapper>
        <div className="p-6 h-full overflow-y-auto">
         <TeamManagementDiagnostics />
        </div>
    </PartnerAuthWrapper>
  );
}


export default PartnerTeamDiagnosticsPage;
