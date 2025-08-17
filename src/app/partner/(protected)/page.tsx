// src/app/partner/(protected)/page.tsx
"use client";

import PartnerHeader from "../../../components/partner/PartnerHeader";
import PartnerDashboard from "../../../components/partner/PartnerDashboard";
import PartnerAuthWrapper from "../../../components/partner/PartnerAuthWrapper";

function ProtectedPartnerDashboard() {
    return (
        <>
            <PartnerHeader
                title="Dashboard"
                subtitle="Here's a quick overview of your workspace"
            />
            <main className="flex-1 overflow-auto p-6">
                <PartnerDashboard />
            </main>
        </>
    );
}

export default function PartnerDashboardPage() {
    return (
        <PartnerAuthWrapper>
            <ProtectedPartnerDashboard />
        </PartnerAuthWrapper>
    )
}
