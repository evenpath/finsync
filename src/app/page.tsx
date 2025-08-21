
"use client";

import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ArrowRight, 
  Shield, 
  Briefcase, 
  Users, 
  Bot, 
  MessageSquare, 
  Workflow, 
  Zap, 
  CheckCircle, 
  Building2,
  Play,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
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
              <Link href="/partner/signup">Get Started <ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 opacity-60"></div>
        <div className="relative container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="px-4 py-2 text-primary border-primary/20 bg-primary/10 mb-6">
              <Bot className="w-4 h-4 mr-2" />
              AI-Powered Business Automation
            </Badge>
            
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-primary via-cyan-600 to-primary bg-clip-text text-transparent mb-6">
              Automate Your Operations, Intelligently.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Socket provides agentic AI workflows to streamline complex business processes, saving you time and boosting efficiency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="px-8 py-6 text-lg">
                <Link href="/partner/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/employee/chat">
                  <Users className="mr-2" />
                  Chat & Tasks
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* "As Featured In" Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Trusted by leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 md:gap-x-12 gap-y-4">
            <p className="font-medium text-gray-400">TechCorp</p>
            <p className="font-medium text-gray-400">Innovate LLC</p>
            <p className="font-medium text-gray-400">Solutions Co.</p>
            <p className="font-medium text-gray-400">Quantum Leap</p>
            <p className="font-medium text-gray-400">Apex Industries</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              A smarter way to run your business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Socket isn't just another automation tool. We provide intelligent, adaptive workflows that learn and optimize your business processes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Workflow className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Visual Workflow Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Design complex, multi-step workflows with our intuitive drag-and-drop interface. No coding required.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Agentic AI Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enhance workflows with AI agents for classification, summarization, and intelligent decision-making.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built-in chat and task management for seamless communication between team members across workspaces.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for your entire organization
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From owners to employees, Socket provides the right tools for everyone to be more productive.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/partner/login">
              <Card className="h-full hover:border-primary/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-headline text-2xl">For Business Owners</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6 px-4">
                    Customize workflows, manage your team, and track your business performance from a central dashboard.
                  </p>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white">
                    Manage Your Workspace <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/employee/chat">
              <Card className="h-full hover:border-primary/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-headline text-2xl">For Team Members</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6 px-4">
                    Execute assigned tasks, communicate with your team, and switch between multiple workspaces with ease.
                  </p>
                  <Button variant="outline" className="w-full group-hover:bg-purple-600 group-hover:text-white">
                    Access Chat & Tasks <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
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
