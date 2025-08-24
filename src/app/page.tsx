
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
  ArrowDown,
} from 'lucide-react';

function OperationsProblemsSection() {
  const [activeFlow, setActiveFlow] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const ProcessNode = ({ children, active, delay = 0, status = 'normal' }: { children: React.ReactNode, active: boolean, delay?: number, status?: string }) => (
    <div className={`
      px-6 py-4 rounded-lg text-center transition-all duration-500 border text-sm font-medium
      ${active 
        ? status === 'problem' 
          ? 'bg-red-50 border-red-200 text-red-900' 
          : status === 'slow'
          ? 'bg-orange-50 border-orange-200 text-orange-900'
          : 'bg-blue-50 border-blue-200 text-blue-900'
        : 'bg-gray-50 border-gray-200 text-gray-500'
      }
    `}
    style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );

  const FlowArrow = ({ active, delay = 0 }: { active: boolean, delay?: number }) => (
    <div className="flex justify-center items-center py-2">
      <ArrowDown
        className={`w-5 h-5 transition-opacity duration-500 ${
          active ? 'text-gray-400 opacity-100' : 'text-gray-300 opacity-0'
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      />
    </div>
  );

  const ChatWorkFlow = ({ active }: { active: boolean }) => (
    <div className="h-80 flex flex-col justify-center">
      <div className="space-y-4 max-w-sm mx-auto">
        <ProcessNode active={active} delay={0}>💬 Task mentioned in chat</ProcessNode>
        <FlowArrow active={active} delay={300} />
        <ProcessNode active={active} delay={600} status="slow">🔍 Scroll through 200+ messages</ProcessNode>
        <FlowArrow active={active} delay={900} />
        <ProcessNode active={active} delay={1200} status="slow">📱 Ping 5 people for status</ProcessNode>
        <FlowArrow active={active} delay={1500} />
        <ProcessNode active={active} delay={1800} status="problem">⏰ Deadline already passed</ProcessNode>
      </div>
    </div>
  );

  const ChannelChaosFlow = ({ active }: { active: boolean }) => (
    <div className="h-80 flex flex-col justify-center">
      <div className="space-y-6">
        <div className="flex justify-center">
          <ProcessNode active={active} delay={0}>📋 Same project discussion</ProcessNode>
        </div>
        <FlowArrow active={active} delay={300} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div>
            <div className="text-xs text-gray-600 mb-2 font-medium text-center">#general</div>
            <ProcessNode active={active} delay={600} status="normal">💬 Initial mention</ProcessNode>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-2 font-medium text-center">#project-channel</div>
            <ProcessNode active={active} delay={800} status="slow">📝 Detailed discussion</ProcessNode>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-2 font-medium text-center">DM threads</div>
            <ProcessNode active={active} delay={1000} status="problem">🤫 Side conversations</ProcessNode>
          </div>
        </div>
        <FlowArrow active={active} delay={1300} />
        <div className="flex justify-center">
          <ProcessNode active={active} delay={1600} status="problem">🤷 Nobody has the full picture</ProcessNode>
        </div>
      </div>
    </div>
  );

  const InformationBuriedFlow = ({ active }: { active: boolean }) => (
    <div className="h-80 flex flex-col justify-center">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <ProcessNode active={active} delay={0}>📊 Critical update shared</ProcessNode>
          <ProcessNode active={active} delay={200}>📈 Progress reported</ProcessNode>
          <ProcessNode active={active} delay={400}>🚨 Issue mentioned</ProcessNode>
        </div>
        <FlowArrow active={active} delay={600} />
        <div className="flex justify-center">
          <div className={`
            text-center p-6 rounded-lg border-2 border-dashed transition-all duration-500 max-w-xs
            ${active ? 'border-gray-400 bg-gray-50' : 'border-gray-300 bg-gray-50'}
          `}
          style={{ transitionDelay: '800ms' }}>
            <div className="text-lg font-medium text-gray-700 mb-1">💬 Lost in 500+ messages</div>
            <div className="text-sm text-gray-500">Manager hasn't seen it</div>
          </div>
        </div>
        <FlowArrow active={active} delay={1200} />
        <div className="flex justify-center">
          <ProcessNode active={active} delay={1500} status="problem">🔥 Emergency discovered in client call</ProcessNode>
        </div>
      </div>
    </div>
  );

  const problems = [
    {
      title: "Chat Coordination Chaos",
      subtitle: "Important tasks get buried in endless message threads",
      component: ChatWorkFlow,
    },
    {
      title: "Multi-Channel Confusion", 
      subtitle: "Same project scattered across different channels and DMs",
      component: ChannelChaosFlow,
    },
    {
      title: "Critical Updates Buried",
      subtitle: "Important status changes lost in message history",
      component: InformationBuriedFlow,
    }
  ];

  return (
    <div className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Work Coordination Shouldn't Be This Messy
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your team spends more time hunting for information in chat than actually getting work done.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-1 flex flex-wrap justify-center gap-1">
            {problems.map((problem, index) => (
              <button
                key={index}
                onClick={() => setActiveFlow(index)}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeFlow === index
                    ? 'bg-slate-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {problem.title}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Display */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="px-4 md:px-8 py-6 border-b border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {problems[activeFlow].title}
              </h3>
              <p className="text-gray-600 text-sm">
                {problems[activeFlow].subtitle}
              </p>
            </div>
          </div>
          
          {/* Flow Content - Fixed Height Container */}
          <div className="relative overflow-hidden h-[380px]">
            {problems.map((problem, index) => (
              <div
                key={index}
                className={`absolute inset-0 px-4 md:px-8 transition-opacity duration-500 ${
                  activeFlow === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <problem.component active={activeFlow === index} />
              </div>
            ))}
          </div>
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
        'Community Support'
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
        'Email Support'
      ],
      additionalUser: '+$8/additional user',
      buttonText: 'Start Free Trial',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      name: 'Professional',
      description: 'For growing businesses',
      monthlyPrice: 49,
      yearlyPrice: 39,
      features: [
        'Everything in Starter',
        '10 Users',
        '25,000 Predictions / month',
        '5GB Storage',
        'Advanced AI & Integrations',
        'Priority Support'
      ],
      additionalUser: '+$6/additional user',
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
       <section id="pricing" className="py-12 bg-gray-900 text-white">
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
                className={`relative ${plan.popular ? 'transform md:scale-105' : ''} flex`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`flex flex-col ${plan.popular ? 'bg-gray-800 border-2 border-purple-500 shadow-lg' : 'bg-gray-800 border border-gray-700 hover:border-gray-600'} rounded-xl p-6 h-full transition-all duration-300`}>
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
                        {plan.name === 'Free' ? 'Get Started' : 'First Month Free'}
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
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
            <Link href="/partner/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
          <div className="md:hidden">
            <Button variant="outline" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
           <div className="text-4xl md:text-7xl font-extrabold font-headline leading-tight min-h-[60px] md:min-h-[90px]">
             <span className="hero-text">{animatedText}</span>
             <span className="typing-animation"></span>
           </div>
           <div className="text-4xl md:text-7xl font-extrabold font-headline leading-tight">
             <div className="text-gray-900">That Run Your Business</div>
           </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-6 mb-8">
            FlowOps automates your business operations with intelligent AI agents.
            Stop managing tasks manually – let our platform handle routine processes while you focus on growth.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
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
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
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
