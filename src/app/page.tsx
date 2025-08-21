
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50"></div>
        <div className="relative container mx-auto px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Badge variant="outline" className="px-4 py-2 text-blue-600 border-blue-200 bg-blue-50">
                <Bot className="w-4 h-4 mr-2" />
                AI-Powered Automation Platform
              </Badge>
            </div>
            
            <h1 className="font-headline text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Socket
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Streamline your business operations with intelligent workflow automation.
              <br className="hidden md:block" />
              Create, manage, and execute AI-powered workflows that adapt to your needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/partner/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">AI-Powered</h3>
                <p className="text-gray-600 text-sm">Intelligent automation with built-in AI agents</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Multi-Workspace</h3>
                <p className="text-gray-600 text-sm">Manage multiple teams and organizations</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">No-Code</h3>
                <p className="text-gray-600 text-sm">Build workflows without programming</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to automate your business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From simple task management to complex AI-powered workflows, Socket provides the tools to transform your operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Workflow className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Visual Workflow Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Design complex workflows with our intuitive drag-and-drop interface. No coding required.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI Agent Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enhance workflows with AI agents for classification, summarization, and intelligent decision-making.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Task Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Assign, track, and manage tasks across your team with real-time progress monitoring.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Team Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built-in chat system for seamless communication between team members and across workspaces.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Multi-Workspace Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Switch between multiple organizations and projects, just like Slack workspaces.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Analytics & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track performance metrics, identify bottlenecks, and optimize your workflows with detailed analytics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Perfect for any industry
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From property management to healthcare, Socket adapts to your specific business needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Property Management</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Emergency maintenance response
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Automated rent collection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Tenant screening workflows
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Property inspection scheduling
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Professional Services</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Client onboarding automation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Project milestone tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Invoice and payment processing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Quality assurance workflows
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for every role in your organization
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're an admin, team leader, or team member, Socket has the right tools for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/auth/login">
              <Card className="h-full hover:border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-headline text-2xl">System Administrators</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">
                    Manage partners, create global workflow templates, and monitor system-wide analytics across all organizations.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    <li className="flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Partner management
                    </li>
                    <li className="flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Global templates
                    </li>
                    <li className="flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      System analytics
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white">
                    Access Admin Panel <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/partner/login">
              <Card className="h-full hover:border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-headline text-2xl">Team Leaders</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">
                    Customize workflows for your organization, manage your team of employees, and track task progress in your workspace.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    <li className="flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Workflow customization
                    </li>
                    <li className="flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Team management
                    </li>
                    <li className="flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Progress tracking
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full group-hover:bg-green-600 group-hover:text-white">
                    Start Managing <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/employee/chat">
              <Card className="h-full hover:border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="font-headline text-2xl">Team Members</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6">
                    Execute assigned tasks within workspaces, communicate with your team through integrated chat, and switch between multiple workspaces.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    <li className="flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Task execution
                    </li>
                    <li className="flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Team chat
                    </li>
                    <li className="flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Multi-workspace
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full group-hover:bg-purple-600 group-hover:text-white">
                    Join Your Team <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your business operations?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of teams who have automated their workflows and boosted productivity with Socket.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/partner/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                Contact Sales
              </Button>
            </div>
            <p className="text-blue-200 text-sm mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-headline text-2xl font-bold mb-4">Socket</h3>
              <p className="text-gray-400 mb-4">
                The AI-powered workflow automation platform that adapts to your business needs.
              </p>
              <div className="flex space-x-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Socket. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

    