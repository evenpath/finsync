"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import {
  Mail,
  Zap,
  Bot,
  Users,
  Eye,
  GitBranch,
  ClipboardList,
  Play,
  Settings,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export default function FlowOpsHomepage() {
  const [workflowStep, setWorkflowStep] = useState(0);
  const [problemIndex, setProblemIndex] = useState(0);
  const [statsCounter, setStatsCounter] = useState(0);

  useEffect(() => {
    const workflowInterval = setInterval(() => {
      setWorkflowStep((prev) => (prev + 1) % 4);
    }, 2000);
    const problemInterval = setInterval(() => {
      setProblemIndex((prev) => (prev + 1) % 3);
    }, 3000);
    const statsInterval = setInterval(() => {
      setStatsCounter((prev) => (prev < 100 ? prev + 1 : 0));
    }, 50);

    return () => {
      clearInterval(workflowInterval);
      clearInterval(problemInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const workflowSteps = [
    { status: 'completed', text: 'Welcome email sent', icon: <Mail className="w-5 h-5 text-gray-500" /> },
    { status: 'completed', text: 'Account setup completed', icon: <Settings className="w-5 h-5 text-gray-500" /> },
    { status: 'active', text: 'Training session scheduled', icon: <Calendar className="w-5 h-5 text-blue-500" /> },
    { status: 'pending', text: 'Follow-up call pending', icon: <Play className="w-5 h-5 text-gray-400" /> },
  ];

  const problems = [
    {
      title: 'Manual Task Management',
      desc: 'Teams spend 3+ hours daily on task assignments, status updates, and progress tracking',
      color: 'red',
      icon: <ClipboardList className="w-6 h-6 text-red-600" />,
    },
    {
      title: 'Inconsistent Processes',
      desc: 'Without standardized workflows, quality varies and important steps get missed',
      color: 'orange',
      icon: <GitBranch className="w-6 h-6 text-orange-600" />,
    },
    {
      title: 'No Visibility',
      desc: "Managers can't see bottlenecks or understand where work gets stuck",
      color: 'yellow',
      icon: <Eye className="w-6 h-6 text-yellow-600" />,
    },
  ];

  return (
      <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-headline">FlowOps</h1>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
            <Link href="/partner/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 font-headline leading-tight">
            <div className="typing-container">
              <span className="typing-text bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Workflows
              </span>
            </div>
            <br />
            <span className="text-gray-900 business-text">That Run Your Business</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 hero-description">
            FlowOps automates your business operations with intelligent AI agents. 
            Stop managing tasks manually – let our platform handle routine processes while you focus on growth.
          </p>
          <div className="flex justify-center space-x-4 hero-buttons">
            <Link href="/partner/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Button variant="outline" size="lg">
               <Play className="w-4 h-4 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="features" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-headline">Your Operations Shouldn't Be This Hard</h2>
            <p className="text-xl text-gray-600">
              Every day, your team wastes hours on repetitive tasks that could be automated.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
                <div key={index} className={`bg-white p-8 rounded-xl shadow-sm border-0 transition-all duration-300 ${problemIndex === index ? 'transform -translate-y-2 ring-2 ring-blue-400' : 'opacity-70'}`}>
                    <div className={`w-12 h-12 bg-${problem.color}-100 rounded-lg flex items-center justify-center mb-6`}>
                        {problem.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{problem.title}</h3>
                    <p className="text-gray-600">{problem.desc}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-headline">FlowOps Makes Operations Effortless</h2>
            <p className="text-xl text-gray-600">
              Create intelligent workflows that handle your business processes automatically.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Automation</h3>
                  <p className="text-gray-600">Workflows that learn from your team's patterns and optimize themselves over time.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Task Distribution</h3>
                  <p className="text-gray-600">Automatically assign work based on team capacity, skills, and availability.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Analytics</h3>
                  <p className="text-gray-600">Get instant insights into workflow performance and team productivity.</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Customer Onboarding</h4>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Active</span>
                </div>
                <div className="space-y-3">
                    {workflowSteps.map((step, index) => (
                        <div key={index} className={`flex items-center space-x-3 p-2 rounded-md transition-all duration-300 ${workflowStep === index ? 'bg-blue-50 scale-105' : ''}`}>
                            {step.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <div className={`w-5 h-5 flex items-center justify-center rounded-full ${workflowStep === index ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>}
                            <span className={`text-sm ${workflowStep >= index ? 'text-gray-800' : 'text-gray-500'}`}>{step.text}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="pricing" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-headline">Get Started in Minutes</h2>
            <p className="text-xl text-gray-600">
              No complex setup or technical expertise required.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Workflow</h3>
              <p className="text-gray-600">Pick from pre-built templates or create custom workflows for your business.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Your Team</h3>
              <p className="text-gray-600">Invite team members and define their roles and permissions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Watch It Work</h3>
              <p className="text-gray-600">AI takes over routine tasks while you monitor progress and results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 font-headline">Ready to Automate Your Operations?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join hundreds of businesses that have streamlined their workflows with FlowOps.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/partner/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">Start Free Trial</Button>
            </Link>
            <Button variant="outline" size="lg" className="bg-primary/20 text-white hover:bg-primary/40 border-primary-foreground/50">Schedule Demo</Button>
          </div>
          <p className="text-purple-200 text-sm mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded"></div>
                </div>
                <h3 className="text-xl font-bold font-headline">FlowOps</h3>
              </div>
              <p className="text-gray-400">AI-powered workflow automation for modern businesses.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FlowOps. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
