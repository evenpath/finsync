
"use client";

import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ArrowRight, 
  Bot, 
  Workflow, 
  Zap, 
  Users,
  Building2,
  TrendingUp,
  Shield,
  Star,
  CheckCircle,
  PlayCircle,
  Briefcase,
  MessageSquare,
  Clock
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-headline">
              Socket
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/partner/login">Partner Login</Link>
            </Button>
            <Button asChild>
              <Link href="/partner/signup">Get Started Free <ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <Badge variant="outline" className="px-4 py-2 text-primary border-primary/20 bg-primary/10 mb-6 font-medium">
            <Bot className="w-4 h-4 mr-2" />
            AI-Powered Business Automation
          </Badge>
          
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-primary via-cyan-600 to-primary bg-clip-text text-transparent mb-6 leading-tight">
            Automate Workflows, Amplify Results.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Socket empowers your business with intelligent, agentic AI workflows. 
            Streamline complex processes, boost team productivity, and drive growth—all on one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow">
              <Link href="/partner/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6 bg-white/50">
              <Link href="#how-it-works">
                <PlayCircle className="mr-2" />
                See How It Works
              </Link>
            </Button>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <span>Trusted by companies like:</span>
            <div className="flex flex-wrap justify-center items-center gap-x-8 md:gap-x-12 gap-y-4 mt-4 font-semibold text-gray-400">
              <p>Innovate LLC</p>
              <p>Solutions Co.</p>
              <p>Quantum Leap</p>
              <p>Apex Industries</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Go from complex problem to automated solution in minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
             {/* Dashed line connector */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px border-t-2 border-dashed border-gray-300 -translate-y-4"></div>
            
            <div className="relative text-center p-6 bg-gray-50 rounded-xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white">1</div>
              <Bot className="w-12 h-12 text-primary mx-auto mb-4 mt-8"/>
              <h3 className="text-xl font-semibold mb-2">Describe Your Problem</h3>
              <p className="text-gray-600">Tell our AI about a process you want to automate in plain English.</p>
            </div>
            <div className="relative text-center p-6 bg-gray-50 rounded-xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white">2</div>
              <Workflow className="w-12 h-12 text-primary mx-auto mb-4 mt-8"/>
              <h3 className="text-xl font-semibold mb-2">Generate a Workflow</h3>
              <p className="text-gray-600">Socket instantly designs a custom, multi-step workflow template for you.</p>
            </div>
            <div className="relative text-center p-6 bg-gray-50 rounded-xl">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white">3</div>
              <Zap className="w-12 h-12 text-primary mx-auto mb-4 mt-8"/>
              <h3 className="text-xl font-semibold mb-2">Deploy & Automate</h3>
              <p className="text-gray-600">Customize if needed, and deploy your new automated process with one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Visual Builder</Badge>
              <h3 className="font-headline text-3xl font-bold mb-4">Design Workflows, No Code Required</h3>
              <p className="text-lg text-gray-600 mb-6">Our intuitive drag-and-drop builder lets you visually construct complex workflows. Connect AI agents, user inputs, and external APIs with ease.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Conditional logic and branching</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Seamless API integration</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Real-time collaboration</span></li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <Image src="https://placehold.co/600x400.png" width={600} height={400} alt="Workflow Builder" className="rounded-lg" data-ai-hint="workflow builder user interface" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="bg-white p-4 rounded-xl shadow-lg md:order-last">
              <Image src="https://placehold.co/600x400.png" width={600} height={400} alt="Team Collaboration" className="rounded-lg" data-ai-hint="team chat interface" />
            </div>
            <div>
              <Badge variant="outline" className="mb-4">Unified Workspace</Badge>
              <h3 className="font-headline text-3xl font-bold mb-4">Collaborate Across Your Organization</h3>
              <p className="text-lg text-gray-600 mb-6">Bring your team together with integrated chat and task management. Switch between different workspaces effortlessly, just like Slack.</p>
               <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Multi-tenant workspaces for different teams or clients</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Role-based access for admins, leaders, and members</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Assign tasks and track progress in one place</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="font-headline text-2xl md:text-3xl font-medium text-gray-900 leading-snug">
              "Socket has revolutionized how we handle our operations. We've automated over 80% of our manual data entry, saving us hundreds of hours a month. It's a game-changer."
            </p>
            <div className="mt-8">
              <p className="font-semibold text-gray-800">Jessica Miller</p>
              <p className="text-gray-500">COO, Innovate LLC</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* User Roles Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Your Entire Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Empower every member of your organization with tools tailored to their role.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Briefcase className="w-6 h-6 text-primary" /></div>
                  <CardTitle className="text-xl">For Partners & Team Leaders</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Customize workflows, manage your team, and oversee your entire workspace from a central dashboard.</p>
                <Button variant="outline" asChild>
                  <Link href="/partner/login">Manage Your Workspace <ArrowRight className="ml-2"/></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
                  <CardTitle className="text-xl">For Employees & Team Members</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Execute assigned tasks, communicate with your team, and access all your workspaces with a simple, secure login.</p>
                <Button variant="outline" asChild>
                  <Link href="/employee/chat">Access Your Tasks & Chat <ArrowRight className="ml-2"/></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to automate your business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of teams who have boosted productivity with Socket.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6">
                 <Link href="/partner/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Contact Sales
              </Button>
            </div>
            <p className="text-blue-200 text-sm mt-4">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-headline text-xl font-bold mb-4">Socket</h3>
              <p className="text-gray-400 text-sm">
                AI-powered workflow automation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>
              © 2024 Socket. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
