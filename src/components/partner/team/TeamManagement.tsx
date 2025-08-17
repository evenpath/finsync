// src/components/partner/team/TeamManagement.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Users } from 'lucide-react';

export default function TeamManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>This is a placeholder for the team management content.</p>
          <p>The page is now loading correctly.</p>
        </div>
      </CardContent>
    </Card>
  );
}
