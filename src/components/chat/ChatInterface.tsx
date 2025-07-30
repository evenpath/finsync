'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Hash,
  User,
  Settings,
  Paperclip,
  Mic,
  Smile,
  Send,
  Users,
  MessageSquare
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/shared/Badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Sarah Wilson',
      avatar: 'https://placehold.co/40x40.png?text=SW',
      text: 'Hey team, the Q4 marketing proposal is ready for initial review. I\'ve attached it to the task.',
      time: '10:30 AM',
      isMe: false,
    },
    {
      id: 2,
      user: 'Mike Chen',
      avatar: 'https://placehold.co/40x40.png?text=MC',
      text: 'Great, I\'ll take a look this afternoon. Is the AI summarization step complete?',
      time: '10:32 AM',
      isMe: false,
    },
    {
        id: 3,
        user: 'You',
        avatar: 'https://placehold.co/40x40.png?text=PA',
        text: 'Yes, the summary is attached to the approval step. Let me know your feedback.',
        time: '10:35 AM',
        isMe: true,
      },
      {
        id: 4,
        user: 'System',
        avatar: 'https://placehold.co/40x40.png?text=S',
        text: 'Task "Review Marketing Proposal" has been approved by Partner Admin.',
        time: '11:15 AM',
        isNotification: true,
      },
  ]);
  
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        user: 'You',
        avatar: 'https://placehold.co/40x40.png?text=PA',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      },
    ]);
    setNewMessage('');
  };

  return (
    <div className="flex h-screen bg-secondary/50">
      {/* Sidebar */}
      <div className="w-72 bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold font-headline">TechCorp Workspace</h1>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase mb-2">Channels</h2>
            <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start bg-primary/10 text-primary"><Hash className="mr-2" /> general</Button>
                <Button variant="ghost" className="w-full justify-start"><Hash className="mr-2" /> marketing-campaigns</Button>
                <Button variant="ghost" className="w-full justify-start"><Hash className="mr-2" /> invoice-processing</Button>
            </div>
          </div>
          <div className="p-4">
            <h2 className="text-xs font-bold text-muted-foreground uppercase mb-2">Direct Messages</h2>
            <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2"><Avatar className="h-6 w-6"><AvatarImage src="https://placehold.co/40x40.png?text=SW" /></Avatar>Sarah Wilson</Button>
                <Button variant="ghost" className="w-full justify-start gap-2"><Avatar className="h-6 w-6"><AvatarImage src="https://placehold.co/40x40.png?text=MC" /></Avatar>Mike Chen <Badge variant="success" className="ml-auto">Online</Badge></Button>
            </div>
          </div>
        </ScrollArea>
        <div className="p-2 border-t">
          <Button variant="ghost" className="w-full justify-start"><Settings className="mr-2"/>Settings</Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="p-4 border-b bg-card flex items-center justify-between">
            <div>
                <h2 className="text-lg font-bold font-headline flex items-center gap-2"><Hash /> general</h2>
                <p className="text-sm text-muted-foreground">Company-wide announcements and updates.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Users /></Button>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9" />
                </div>
            </div>
        </header>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((msg) => (
                msg.isNotification ? (
                    <div key={msg.id} className="text-center text-xs text-muted-foreground my-4 flex items-center gap-2">
                        <hr className="flex-1"/> <span>{msg.text}</span> <hr className="flex-1"/>
                    </div>
                ) : (
              <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                <Avatar>
                  <AvatarImage src={msg.avatar} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className={`rounded-lg p-3 max-w-lg ${msg.isMe ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <div className="font-bold text-sm mb-1">{msg.user}</div>
                  <p>{msg.text}</p>
                  <div className={`text-xs mt-1 text-right ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</div>
                </div>
              </div>
                )
            ))}
          </div>
        </ScrollArea>

        <footer className="p-4 border-t bg-card">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Button variant="ghost" size="icon" type="button"><Paperclip/></Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message in #general..."
              className="flex-1"
            />
            <Button variant="ghost" size="icon" type="button"><Smile/></Button>
            <Button type="submit"><Send/></Button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatInterface;
