
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
  MessageSquare,
  Building2,
  Workflow,
  Shield,
  Globe,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  Check,
  Pause,
  ArrowDown,
} from 'lucide-react';

function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Demo Components must be defined before they are used in the `features` array.
  const WorkflowBuilderDemo = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {[
          { name: 'Form Input', active: true },
          { name: 'AI Analysis', active: true },
          { name: 'Approval', active: false },
          { name: 'Notification', active: false }
        ].map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-500 ${
              step.active 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-600 text-gray-400'
            }`}>
              {index + 1}
            </div>
            {index < 3 && (
              <div className={`w-8 h-0.5 mx-2 transition-all duration-500 ${
                step.active ? 'bg-blue-500' : 'bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-sm text-green-400 mb-1">✓ Workflow Created</div>
        <div className="text-white text-sm">Customer Onboarding Process</div>
        <div className="text-gray-400 text-xs">4 steps • 2 AI agents • 15min avg completion</div>
      </div>
    </div>
  );

  const AIAgentDemo = () => (
    <div className="space-y-3">
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400">AI Agent Processing</span>
        </div>
        <div className="text-white text-sm mb-1">Analyzing customer feedback...</div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-3/4 animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-500/20 border border-green-500/30 rounded p-2">
          <div className="text-green-400 text-xs font-medium">Sentiment: Positive</div>
          <div className="text-white text-xs">Confidence: 94%</div>
        </div>
        <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2">
          <div className="text-blue-400 text-xs font-medium">Category: Support</div>
          <div className="text-white text-xs">Priority: Medium</div>
        </div>
      </div>
    </div>
  );

  const ChatDemo = () => (
    <div className="space-y-2">
      <div className="bg-gray-800 rounded-lg p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">SM</span>
          </div>
          <span className="text-sm text-gray-300">Sarah M.</span>
          <span className="text-xs text-gray-500">2:34 PM</span>
        </div>
        <div className="text-white text-sm">Task review completed ✅</div>
      </div>
      <div className="bg-blue-600 rounded-lg p-3 max-w-xs ml-auto">
        <div className="text-white text-sm">Great! Moving to next step</div>
        <div className="text-blue-200 text-xs mt-1">2:35 PM</div>
      </div>
      <div className="flex items-center gap-2 text-gray-400 text-xs">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span>3 team members online</span>
      </div>
    </div>
  );

  const features = [
    {
      icon: Workflow,
      title: 'Visual Workflow Builder',
      description: 'Create complex workflows with simple drag-and-drop interface. No coding required.',
      highlights: ['Drag & Drop', 'Pre-built Templates', 'Industry Specific'],
      demoTitle: 'Building Customer Onboarding Flow',
      demoComponent: WorkflowBuilderDemo,
      stats: [
        { value: '50+', label: 'Templates' },
        { value: '3 min', label: 'Avg Setup' },
        { value: '94%', label: 'Success Rate' }
      ]
    },
    {
      icon: Bot,
      title: 'AI-Powered Automation',
      description: 'Integrate AI agents for document analysis, sentiment detection, and intelligent routing.',
      highlights: ['LLMs Integration', 'Auto Classification', 'Smart Routing'],
      demoTitle: 'AI Processing Customer Feedback',
      demoComponent: AIAgentDemo,
      stats: [
        { value: '8 AI', label: 'Models' },
        { value: '95%', label: 'Accuracy' },
        { value: '10x', label: 'Faster' }
      ]
    },
    {
      icon: MessageSquare,
      title: 'Integrated Team Chat',
      description: 'Built-in communication keeps everyone aligned without switching between tools.',
      highlights: ['Multi-Workspace', 'Task Context', 'File Sharing'],
      demoTitle: 'Team Collaboration Hub',
      demoComponent: ChatDemo,
      stats: [
        { value: '100+', label: 'Workspaces' },
        { value: '5ms', label: 'Response' },
        { value: '99.9%', label: 'Uptime' }
      ]
    },
    {
      icon: Users,
      title: 'Multi-Role Management',
      description: 'Flexible role system with granular permissions for admins, partners, and workers.',
      highlights: ['Role-Based Access', 'Team Management', 'Workspace Switching'],
      demoTitle: 'Role & Permission Management',
      demoComponent: () => (
        <div className="space-y-3">
          {[
            { role: 'Admin', permissions: 'Full System Access', count: 2, color: 'red' },
            { role: 'Partner Admin', permissions: 'Workspace Management', count: 12, color: 'blue' },
            { role: 'Worker', permissions: 'Task Execution', count: 156, color: 'green' }
          ].map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                <div>
                  <div className="text-white text-sm font-medium">{item.role}</div>
                  <div className="text-gray-400 text-xs">{item.permissions}</div>
                </div>
              </div>
              <div className="text-white font-bold">{item.count}</div>
            </div>
          ))}
        </div>
      ),
      stats: [
        { value: '3', label: 'Role Types' },
        { value: '170+', label: 'Users' },
        { value: '99.8%', label: 'Security' }
      ]
    },
    {
      icon: Globe,
      title: 'API Integrations',
      description: 'Connect with 200+ popular tools and services through our extensive API library.',
      highlights: ['200+ Integrations', 'Custom APIs', 'Webhook Support'],
      demoTitle: 'Connected Services',
      demoComponent: () => (
        <div className="grid grid-cols-2 gap-2">
          {[
            'Slack', 'Salesforce', 'Google Workspace', 'Microsoft 365',
            'Stripe', 'HubSpot', 'Jira', 'GitHub'
          ].map((service, index) => (
            <div key={index} className="bg-gray-800 rounded p-2 text-center">
              <div className="text-white text-sm font-medium">{service}</div>
              <div className="text-green-400 text-xs">✓ Connected</div>
            </div>
          ))}
        </div>
      ),
      stats: [
        { value: '200+', label: 'Integrations' },
        { value: '5min', label: 'Setup' },
        { value: '100%', label: 'Reliability' }
      ]
    }
  ];
  
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, features.length]);

  const FeatureCard = ({ feature, isActive, onClick }: { feature: any, isActive: boolean, onClick: () => void }) => (
    <div 
      className={`group cursor-pointer p-6 rounded-xl border transition-all duration-300 ${
        isActive 
          ? 'bg-white border-blue-200 shadow-lg ring-2 ring-blue-100' 
          : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
        }`}>
          <feature.icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{feature.description}</p>
          <div className="flex flex-wrap gap-2">
            {feature.highlights.map((highlight: string, index: number) => (
              <span 
                key={index}
                className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
          isActive ? 'text-blue-500 transform rotate-90' : 'text-gray-400 group-hover:text-gray-600'
        }`} />
      </div>
    </div>
  );

  const DemoVisualization = ({ feature }: { feature: any }) => (
    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 h-full min-h-[30rem] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern" style={{ maskImage: 'linear-gradient(to top, transparent, black)' }}></div>
      </div>
      
      {/* Demo Content */}
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <feature.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold">{feature.title}</h4>
              <p className="text-gray-400 text-sm">{feature.demoTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live Demo
          </div>
        </div>

        <div className="flex-1">
          <feature.demoComponent />
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          {feature.stats.map((stat: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left Panel: Features List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Core Capabilities</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {isAutoPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Demo
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Play Demo
                    </>
                  )}
                </button>
              </div>
            </div>

            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature}
                isActive={activeFeature === index}
                onClick={() => {
                  setActiveFeature(index);
                  setIsAutoPlaying(false);
                }}
              />
            ))}
          </div>

          {/* Right Panel: Demo Visualization */}
          <div>
            <DemoVisualization feature={features[activeFeature]} />
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
      buttonStyle: 'bg-gray-700 hover:bg-gray-600 border border-gray-600',
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
      buttonStyle: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600',
      popular: true
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
      buttonStyle: 'bg-blue-600 hover:bg-blue-700',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="bg-gray-900 py-20 text-white">
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
              className={`relative flex flex-col ${plan.popular ? 'transform lg:scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`flex flex-col ${plan.popular ? 'bg-gray-800 border-2 border-purple-500 shadow-lg' : 'bg-gray-800 border border-gray-700 hover:border-gray-600'} rounded-xl p-6 h-full transition-all duration-300`}>
                  <div className="mb-6 h-28">
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
                      className={`w-full text-lg ${plan.buttonStyle}`}
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

       <FeaturesSection />
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
