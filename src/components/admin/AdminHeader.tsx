import { Bell, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

type AdminHeaderProps = {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
};

export default function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  return (
    <header className="bg-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4" />
            <span className="hidden md:inline ml-2">Search</span>
          </Button>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">3</Badge>
          </Button>
          {actions}
        </div>
      </div>
    </header>
  );
}
