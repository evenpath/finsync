
'use client';

import React, { useState } from 'react';
import type { Industry, BusinessProfile } from '../../../lib/types';
import { CheckCircle } from 'lucide-react';
import IndustrySelector from '../../../components/onboarding/IndustrySelector';
import BusinessProfileForm from '../../../components/onboarding/BusinessProfileForm';

export default function PartnerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [businessProfile, setBusinessProfile] = useState<Partial<BusinessProfile> | null>(null);

  const steps = [
    { id: 1, title: 'Choose Your Industry' },
    { id: 2, title: 'Business Profile' },
    { id: 3, title: 'Workflow Recommendations' },
    { id: 4, title: 'Quick Setup' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    currentStep >= step.id ? 'bg-primary text-white' : 'bg-gray-200 text-muted-foreground'
                    }`}>
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                    </div>
                    <p className={`mt-2 text-xs font-medium ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>{step.title}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 transition-colors ${
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <IndustrySelector 
              onIndustrySelect={(industry) => {
                setSelectedIndustry(industry);
                setCurrentStep(2);
              }}
              selectedIndustry={selectedIndustry}
            />
          )}
          {currentStep === 2 && selectedIndustry && (
            <BusinessProfileForm 
              industry={selectedIndustry}
              onProfileComplete={(profile) => {
                setBusinessProfile(profile);
                setCurrentStep(3);
                console.log("Profile complete:", profile);
                // In a real app, you would now probably show workflow recommendations
              }}
            />
          )}
          {currentStep >= 3 && (
              <div className="text-center p-8 bg-secondary rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">Onboarding Complete!</h2>
                  <p className="text-muted-foreground">Next steps would show recommended workflows and final setup.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
