// src/components/ui/link.tsx
import NextLink from 'next/link';
import * as React from 'react';

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof NextLink>
>(({ ...props }, ref) => {
  return <NextLink ref={ref} {...props} />;
});

Link.displayName = "Link";

export { Link };
