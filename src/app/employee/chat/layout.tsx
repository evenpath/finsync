import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Chat | Flow Factory',
  description: 'Communicate with your team members in real-time',
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col h-full">
      {children}
    </div>
  );
}