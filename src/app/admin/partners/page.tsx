
import AdminHeader from "@/components/admin/AdminHeader";
import { mockPartners } from '@/lib/mockData';
import type { Partner } from '@/lib/types';
import PartnerCard from "@/components/admin/PartnerCard";
import PartnerDetailView from "@/components/admin/PartnerDetailView";
import { UserPlus, Search, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddPartnerModal from "@/components/admin/AddPartnerModal";


// This is a temporary server component to display mock data.
// In a real application, this would fetch data from a database.
async function PartnerManagement() {
    const partners = mockPartners;
    const selectedPartner = partners[0];

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 flex overflow-hidden">
                {/* Partner List */}
                <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Partners ({partners.length})</h2>
                            {/* <AddPartnerModal onAddPartner={() => {}} isOpen={false} onClose={() => {}}/> */}
                            <Button size="sm">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Invite
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search partners..." className="pl-8" />
                            </div>
                            <Button variant="outline" size="icon" className="w-9 h-9">
                                <ListFilter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        {partners.map(partner => (
                            <PartnerCard 
                                key={partner.id}
                                partner={partner}
                                isSelected={selectedPartner.id === partner.id}
                                onSelect={() => {
                                    // In a real app, this would update state
                                    console.log("Selected partner:", partner.id);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Partner Detail View */}
                <div className="w-2/3 overflow-y-auto">
                    {selectedPartner ? (
                        <PartnerDetailView partner={selectedPartner} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Select a partner to see details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


export default function AdminPartnersPage() {
  return (
    <>
      <AdminHeader
        title="Partner Management"
        subtitle="Manage partner organizations and their access."
      />
      <main className="flex-1 overflow-hidden">
        <PartnerManagement />
      </main>
    </>
  );
}
