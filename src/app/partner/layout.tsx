// This file is intentionally left minimal. 
// It ensures that both auth and protected layouts can share the same root provider if needed in the future.
// For now, it simply passes children through. The actual layout logic is in the route group layouts.
export default function PartnerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
