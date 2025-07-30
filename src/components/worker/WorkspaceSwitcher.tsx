"use client";

import { useState } from 'react';
import { Briefcase, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const workspaces = [
    { id: 'techcorp', name: 'TechCorp Industries', initial: 'T' },
    { id: 'mktgsol', name: 'Marketing Solutions Ltd', initial: 'M' },
    { id: 'starthub', name: 'StartupHub', initial: 'S' },
];

export default function WorkspaceSwitcher() {
    const [activeWorkspace, setActiveWorkspace] = useState('techcorp');

    return (
        <TooltipProvider>
            <div className="w-20 bg-secondary/50 border-r flex flex-col items-center py-4 gap-4">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground mb-4">
                    <Briefcase />
                </div>
                <div className="flex flex-col gap-2">
                    {workspaces.map(ws => (
                        <Tooltip key={ws.id}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={activeWorkspace === ws.id ? 'default' : 'ghost'}
                                    size="icon"
                                    className={`w-12 h-12 text-lg font-bold transition-all duration-200 ${activeWorkspace === ws.id ? 'rounded-xl' : 'rounded-full'}`}
                                    onClick={() => setActiveWorkspace(ws.id)}
                                >
                                    {ws.initial}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>{ws.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="w-12 h-12 mt-4 text-muted-foreground">
                            <PlusCircle />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Join Workspace</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
