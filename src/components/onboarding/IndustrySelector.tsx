
"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Industry } from "@/lib/types";
import { industries as mockIndustries } from "@/lib/mockData";


interface IndustrySelectorProps {
  onIndustrySelect: (industry: Industry) => void;
  selectedIndustry?: Industry | null;
}

export default function IndustrySelector({ onIndustrySelect, selectedIndustry }: IndustrySelectorProps) {

  const industries = mockIndustries.map(industry => ({
      ...industry,
      templateCount: 12, // example data
      avgRoi: '320%' // example data
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {industries.map(industry => (
        <Card 
          key={industry.id}
          className={`cursor-pointer transition-all ${
            selectedIndustry?.id === industry.id ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-lg'
          }`}
          onClick={() => onIndustrySelect(industry)}
        >
          <CardContent className="p-6 text-center">
            <div className="text-5xl mb-4">{industry.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{industry.name}</h3>
            <p className="text-muted-foreground mb-4 h-12">{industry.description}</p>
            <div className="flex justify-between text-sm border-t pt-4 mt-4">
              <span className="font-medium text-foreground">{industry.templateCount} workflows</span>
              <span className="font-bold text-green-600">{industry.avgRoi} avg ROI</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
