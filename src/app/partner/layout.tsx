import PartnerSidebar from "@/components/partner/PartnerSidebar";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-secondary/30 text-foreground">
      <PartnerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
