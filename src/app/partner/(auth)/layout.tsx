// src/app/partner/(auth)/layout.tsx
// This is a new layout file for public-facing partner pages like login and signup.

export default function PartnerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      {children}
    </div>
  );
}
