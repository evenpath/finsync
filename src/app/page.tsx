

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import {
  Bot,
  Users,
  CheckCircle,
  Play,
  Zap,
  Mail,
  Settings,
  Calendar,
} from 'lucide-react';

function OperationsProblemsSection() {
  const [activeFlow, setActiveFlow] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const SimpleNode = ({ children, active, delay = 0, status = 'normal' }: { children: React.ReactNode, active: boolean, delay?: number, status?: string }) => (
    <div className={`
      px-4 py-3 rounded-lg text-center transition-all duration-700 border
      ${active 
        ? status === 'problem' 
          ? 'bg-red-50 border-red-200 text-red-700' 
          : status === 'slow'
          ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
          : 'bg-blue-50 border-blue-200 text-blue-700'
        : 'bg-gray-50 border-gray-200 text-gray-500'
      }
    `}
    style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );

  const SimpleArrow = ({ active, delay = 0 }: { active: boolean, delay?: number }) => (
    <div className="flex justify-center items-center py-2">
      <div className={`
        text-2xl transition-all duration-500
        ${active ? 'text-gray-600' : 'text-gray-300'}
      `}
      style={{ transitionDelay: `${delay}ms` }}>
        ↓
      </div>
    </div>
  );

  const ManualFlow = ({ active }: { active: boolean }) => (
    <div className="space-y-4 max-w-xs mx-auto">
      <SimpleNode active={active} delay={0}>📋 Task Assigned</SimpleNode>
      <SimpleArrow active={active} delay={300} />
      <SimpleNode active={active} delay={600} status="slow">⏱️ Find the right tool</SimpleNode>
      <SimpleArrow active={active} delay={900} />
      <SimpleNode active={active} delay={1200} status="slow">💬 Ask for clarification</SimpleNode>
      <SimpleArrow active={active} delay={1500} />
      <SimpleNode active={active} delay={1800} status="problem">😰 Rush to finish</SimpleNode>
    </div>
  );

  const ProcessFlow = ({ active }: { active: boolean }) => (
    <div className="space-y-6">
      <SimpleNode active={active} delay={0}>📋 Same Task</SimpleNode>
      <SimpleArrow active={active} delay={300} />
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className={`text-sm text-gray-500 mb-2 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '600ms' }}>Person A</div>
          <SimpleNode active={active} delay={600} status="normal">Method 1</SimpleNode>
        </div>
        <div className="text-center">
          <div className={`text-sm text-gray-500 mb-2 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '800ms' }}>Person B</div>
          <SimpleNode active={active} delay={800} status="slow">Method 2</SimpleNode>
        </div>
        <div className="text-center">
          <div className={`text-sm text-gray-500 mb-2 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '1000ms' }}>Person C</div>
          <SimpleNode active={active} delay={1000} status="problem">Method 3</SimpleNode>
        </div>
      </div>
      <SimpleArrow active={active} delay={1300} />
      <SimpleNode active={active} delay={1600} status="problem">❌ Inconsistent Results</SimpleNode>
    </div>
  );

  const VisibilityFlow = ({ active }: { active: boolean }) => (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-4">
        <SimpleNode active={active} delay={0}>Task 1</SimpleNode>
        <SimpleNode active={active} delay={200}>Task 2</SimpleNode>
        <SimpleNode active={active} delay={400}>Task 3</SimpleNode>
      </div>
      <SimpleArrow active={active} delay={600} />
      <div className={`
        text-center p-4 rounded-lg border-2 border-dashed transition-all duration-700
        ${active ? 'border-gray-400 bg-gray-100' : 'border-gray-200 bg-gray-50'}
      `}
      style={{ transitionDelay: '800ms' }}>
        <div className="text-2xl mb-2">🤷‍♂️</div>
        <div className="text-sm text-gray-600">Manager's View</div>
        <div className="text-xs text-gray-500 mt-1">What's the status?</div>
      </div>
      <SimpleArrow active={active} delay={1200} />
      <SimpleNode active={active} delay={1500} status="problem">🚨 Last-minute surprises</SimpleNode>
    </div>
  );

  const problems = [
    {
      title: "Manual Work",
      subtitle: "Too many steps, too much time",
      component: ManualFlow
    },
    {
      title: "No Standard Process",
      subtitle: "Everyone does it differently",
      component: ProcessFlow
    },
    {
      title: "No Visibility",
      subtitle: "Problems discovered too late",
      component: VisibilityFlow
    }
  ];

  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Operations Shouldn't Be This Hard
          </h2>
          <p className="text-lg text-gray-600">
            Every day, your team wastes hours on repetitive tasks that could be automated.
          </p>
        </div>

        {/* Current Problem Display */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {problems[activeFlow].title}
            </h3>
            <p className="text-gray-600 text-sm">
              {problems[activeFlow].subtitle}
            </p>
          </div>
          
          <div className="min-h-[280px] flex items-center justify-center">
            {problems.map((problem, index) => (
              <div
                key={index}
                className={`transition-opacity duration-500 ${
                  activeFlow === index ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              >
                <problem.component active={activeFlow === index} />
              </div>
            ))}
          </div>
        </div>

        {/* Simple Navigation */}
        <div className="flex justify-center space-x-8">
          {problems.map((problem, index) => (
            <button
              key={index}
              onClick={() => setActiveFlow(index)}
              className={`text-center transition-all duration-200 ${
                activeFlow === index ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 transition-colors ${
                activeFlow === index ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
              <div className="text-xs font-medium">{problem.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        '1 User',
        '500 Predictions / month',
        '25MB Storage',
        'Basic Workflows',
        'Admin Roles & Permissions'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outline' as const,
      popular: false
    },
    {
      name: 'Starter',
      description: 'For individuals & small teams',
      monthlyPrice: 19,
      yearlyPrice: 15,
      features: [
        'Everything in Free',
        '3 Users',
        '5,000 Predictions / month',
        '500MB Storage',
        'AI Agents & Custom Workflows',
        'Admin Roles & Permissions',
        'Email Support'
      ],
      additionalUser: '+$5/additional user',
      buttonText: 'Start Free Trial',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      name: 'Professional',
      description: 'For growing businesses',
      monthlyPrice: 30,
      yearlyPrice: 39,
      features: [
        'Everything in Starter',
        '6 Users',
        '25,000 Predictions / month',
        '5GB Storage',
        'Advanced AI & Integrations',
        'Admin Roles & Permissions',
      ],
      additionalUser: '+$5/additional user',
      buttonText: 'Start Free Trial',
      buttonVariant: 'default' as const,
      popular: false
    }
  ];

  const getSavingsPercentage = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    return Math.round(((monthly * 12 - yearly * 12) / (monthly * 12)) * 100);
  };


  return (
       <section id="pricing" className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 font-headline">Choose Your Plan</h2>
            <p className="text-lg text-gray-400 mb-8">Start for free, then scale as you grow.</p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`${!isYearly ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
              <div 
                className="relative w-14 h-8 bg-gray-600 rounded-full cursor-pointer"
                onClick={() => setIsYearly(!isYearly)}
              >
                <div 
                  className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                    isYearly ? 'transform translate-x-6' : ''
                  }`}
                />
              </div>
              <span className={`${isYearly ? 'text-white' : 'text-gray-400'}`}>
                Yearly <span className="text-green-400 text-sm">(Save up to 23%)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`relative ${plan.popular ? 'transform scale-105' : ''} flex`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className={`flex flex-col ${plan.popular ? 'bg-gray-800 border-2 border-purple-500 shadow-lg' : 'bg-gray-800 border border-gray-700 hover:border-gray-600'} rounded-xl p-8 h-full transition-all duration-300`}>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 h-10">{plan.description}</p>
                      <div className="flex items-baseline mb-6">
                        <span className="text-4xl font-bold">
                          ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-gray-400 ml-1">
                          {plan.monthlyPrice === 0 ? '' : '/month'}
                        </span>
                      </div>
                    </div>
                  
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                     {plan.additionalUser && (
                      <p className="text-xs text-gray-400 mt-auto">{plan.additionalUser}</p>
                    )}
                  
                  <div className="mt-8">
                    <Link href="/partner/signup">
                      <Button
                        size="lg"
                        className="w-full text-lg"
                        variant={plan.buttonVariant}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}


export default function FlowOpsHomepage() {
  const [workflowStep, setWorkflowStep] = useState(0);
  const [animatedText, setAnimatedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  const textOptions = ["AI Workflows", "Automation", "Efficiency"];
  const typingSpeed = 60; 
  const deletingSpeed = 30;
  const delay = 1500;

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % textOptions.length;
      const fullText = textOptions[i];

      setAnimatedText(
        isDeleting
          ? fullText.substring(0, animatedText.length - 1)
          : fullText.substring(0, animatedText.length + 1)
      );

      if (!isDeleting && animatedText === fullText) {
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isDeleting && animatedText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const typingTimeout = setTimeout(
      handleTyping,
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(typingTimeout);
  }, [animatedText, isDeleting, loopNum]);


  useEffect(() => {
    const workflowInterval = setInterval(() => {
      setWorkflowStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => {
      clearInterval(workflowInterval);
    };
  }, []);

  const workflowSteps = [
    { status: 'completed', text: 'Welcome email sent', icon: <Mail className="w-5 h-5 text-gray-500" /> },
    { status: 'completed', text: 'Account setup completed', icon: <Settings className="w-5 h-5 text-gray-500" /> },
    { status: 'active', text: 'Training session scheduled', icon: <Calendar className="w-5 h-5 text-blue-500" /> },
    { status: 'pending', text: 'Follow-up call pending', icon: <Play className="w-5 h-5 text-gray-400" /> },
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
           <div className="text-5xl md:text-7xl font-extrabold font-headline leading-tight min-h-[80px] md:min-h-[90px]">
            <div className="hero-text"><span className="typing-animation">{animatedText}</span></div>
          </div>
          <div className="text-5xl md:text-7xl font-extrabold font-headline leading-tight">
            <div className="text-gray-900">That Run Your Business</div>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-6 mb-8">
            FlowOps automates your business operations with intelligent AI agents.
            Stop managing tasks manually – let our platform handle routine processes while you focus on growth.
          </p>
          <div className="flex justify-center space-x-4">
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

      <OperationsProblemsSection />

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
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
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

       <PricingSection />

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 font-headline">Ready to Automate Your Operations?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join hundreds of businesses that have streamlined their workflows with FlowOps.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/partner/signup">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">Start Free Trial</Button>
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
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
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
    