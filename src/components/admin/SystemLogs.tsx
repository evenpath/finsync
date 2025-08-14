"use client";

import React, { useState } from "react";
import { mockSystemLogs } from "../../lib/mockData";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../shared/Badge";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type LogLevel = 'all' | 'info' | 'warning' | 'error';

export default function SystemLogs() {
  const [filterLevel, setFilterLevel] = useState<LogLevel>('all');

  const filteredLogs = filterLevel === 'all'
    ? mockSystemLogs
    : mockSystemLogs.filter(log => log.level === filterLevel);
  
  const getLevelVariant = (level: string): "info" | "warning" | "danger" => {
    switch(level) {
        case 'error': return 'danger';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'info';
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold font-headline text-foreground">System Logs</h2>
                <p className="text-muted-foreground">Monitor system activities and events</p>
            </div>
            <div className="flex items-center gap-4">
                <Select onValueChange={(value: LogLevel) => setFilterLevel(value)} defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" /> Export Logs
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {filteredLogs.map(log => (
                        <div key={log.id} className="p-6 hover:bg-secondary">
                            <div className="flex items-start gap-4">
                                <Badge variant={getLevelVariant(log.level)}>{log.level}</Badge>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-foreground">{log.action}</h4>
                                        <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                                    </div>
                                    <p className="text-foreground mb-2">{log.details}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>User: {log.user}</span>
                                        <span>IP: {log.ip}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
