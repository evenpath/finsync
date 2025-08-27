// src/components/ui/sidebar.tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

type SidebarContextType = {
  state: 'expanded' | 'collapsed';
  isMobile: boolean;
  setOpen: (open: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children, defaultOpen = true }: { children: React.ReactNode, defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const state = open && !isMobile ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo(() => ({
    state,
    isMobile,
    setOpen,
  }), [state, isMobile]);

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

const sidebarVariants = cva(
  "fixed top-0 left-0 h-full z-40 bg-card border-r transition-width duration-300 ease-in-out hidden md:flex flex-col",
  {
    variants: {
      state: {
        expanded: "w-64",
        collapsed: "w-16",
      },
    },
    defaultVariants: {
      state: "expanded",
    },
  }
)

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { state, isMobile } = useSidebar();

  if (isMobile) {
    // On mobile, the sidebar is handled differently (e.g., in a sheet), so we don't render the main div.
    return null; 
  }

  return (
    <>
      <div ref={ref} className={cn(sidebarVariants({ state }), className)} {...props} />
      <div className={cn(
        "transition-[margin-left] duration-300 ease-in-out",
        state === 'expanded' ? 'md:ml-64' : 'md:ml-16'
      )}></div>
    </>
  );
});
Sidebar.displayName = "Sidebar"


export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 border-b", className)} {...props} />
));
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 overflow-y-auto", className)} {...props} />
));
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-2 border-t mt-auto", className)} {...props} />
));
SidebarFooter.displayName = "SidebarFooter";

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex flex-col gap-1 p-2", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { setOpen, state } = useSidebar();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("hidden md:inline-flex", className)}
      onClick={() => setOpen(state === 'collapsed')}
      {...props}
    />
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

interface SidebarMenuButtonProps extends React.ComponentProps<typeof Button> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, tooltip, children, ...props }, ref) => {
  const { state } = useSidebar();

  const buttonContent = (
    <Button
      ref={ref}
      variant={isActive ? "secondary" : "ghost"}
      className={cn("w-full justify-start gap-3", state === 'collapsed' && "justify-center", className)}
      {...props}
    >
      {children}
    </Button>
  );

  if (state === 'collapsed' && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
});
SidebarMenuButton.displayName = "SidebarMenuButton";
