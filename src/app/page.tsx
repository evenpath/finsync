import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Shield, Briefcase, UserCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <header className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
          Suupe.com
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          The all-in-one platform for creating, managing, and executing AI-powered agentic workflows.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <Link href="/auth/login">
          <Card className="h-full hover:border-primary hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-headline text-2xl">Admin Panel</CardTitle>
              <Shield className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Manage partners, create global workflow templates, and monitor system-wide analytics.
              </p>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Go to Admin <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/partner/login">
          <Card className="h-full hover:border-primary hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-headline text-2xl">Partner App</CardTitle>
              <Briefcase className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Customize workflows, manage your team of employees, and track task progress in your workspace.
              </p>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Go to Partner App <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/partner/login">
          <Card className="h-full hover:border-primary hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-headline text-2xl">Employee Dashboard</CardTitle>
              <UserCheck className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Access your assigned tasks, execute workflows step-by-step, and collaborate with your team.
              </p>
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                Go to Employee Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </main>

      <footer className="mt-16 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Suupe.com. Built by Suupe.</p>
      </footer>
    </div>
  );
}
