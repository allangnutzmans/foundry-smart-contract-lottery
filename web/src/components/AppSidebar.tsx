'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  Wallet, Bell, BarChart3, Settings, Users,
  Coins, Ticket, Gift, LayoutDashboard, ChevronDown,
  Github, Instagram, Mail,
  LinkedinIcon,
  Club,
  SquareAsterisk
} from "lucide-react";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { api } from "@/lib/trpc";

export type sidebarItem = {
    header?: string;
    title?: string;
    icon?: React.ElementType | string;
    to?: string;
    getURL?: boolean;
    divider?: boolean;
    chip?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: sidebarItem[];
    disabled?: boolean;
    type?: string;
    subCaption?: string;
}

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const [menuItems, setMenuItems] = useState<sidebarItem[]>([
    {
      title: "Home",
      icon: LayoutDashboard,
      to: "/",
    },
    { header: "Play" },
    {
      title: "Raffle",
      icon: Ticket,
      to: "/raffle",
      children: [
        { title: "Enter raffle", to: "/raffle/enter" },
        { title: "Guide", to: "/raffle/guide" },
        { title: "Leaderboard", to: "/raffle", disabled: !isConnected },
        { title: "Wager History", to: "/raffle/history", disabled: !isConnected },
      ],
    },
      {
        title: "Casino",
        icon: Club,
        to: "#",
        disabled: true
      },
      {
        title: "Sports",
        icon: Ticket,
        to: "#",
        disabled: true
      },
      {
        header: "Events",
      },
      {
        title: "Promotions",
        icon: Gift,
        to: "#",
        disabled: true
      },
      { header: "Account" },
      { title: "Wallet", icon: Wallet, to: "#", disabled: true },
      {
        title: "NFT",
        icon: SquareAsterisk,
        to: "#",
        disabled: true
      },
      { title: "Notifications", icon: Bell, to: "#", disabled: true },
      { title: "Profile", icon: Users, to: "#", disabled: true },
      { header: "Analytics" },
      { title: "Stats", icon: BarChart3, to: "#", disabled: true },
      { title: "Settings", icon: Settings, to: "#", disabled: true },

  ]);

  const { data: totalWagers } = api.wagerHistory.getTotalWagers.useQuery();

  useEffect(() => {
    setMenuItems((prevItems) =>
      prevItems.map((item) => {
        if (item.children) {
          return {
            ...item,
            children: item.children.map((child) => {
              if (child.title === "Leaderboard" || child.title === "Wager History") {
                return { ...child, disabled: !isConnected };
              }
              return child;
            }),
          };
        }
        return item;
      })
    );
  }, [isConnected]);

  const renderSubMenuItem = (item: sidebarItem) => {
    const Icon = item.icon as React.ElementType;

    if (item.disabled) {
      return (
        <SidebarMenuSubButton isActive={pathname === item.to} disabled>
          {Icon && <Icon className="mr-2" />}
          <span>{item.title}</span>
        </SidebarMenuSubButton>
      );
    }
    return (
      <SidebarMenuSubButton asChild isActive={pathname === item.to}>
        <Link href={item.to || ""}>
          {Icon && <Icon className="mr-2" />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    );
  };

  const renderMenuItem = (item: sidebarItem) => {
    const Icon = item.icon as React.ElementType;

    if (item.header) {
      return (
        <SidebarGroup key={item.header}>
          <SidebarGroupLabel>{item.header}</SidebarGroupLabel>
        </SidebarGroup>
      );
    }

    if (item.children && item.children.length > 0) {
      const isChildActive = item.children.some(child => pathname.startsWith(child.to || ""));
      return (
        <SidebarMenuItem key={item.title}>
          <Collapsible defaultOpen={isChildActive}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton variant="outline" tooltip={item.title} isActive={isChildActive || pathname.startsWith(item.to || "/")}>
                {Icon && <Icon className="mr-2" />}
                <span>{item.title}</span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children.map((child) => (
                  <SidebarMenuSubItem key={child.title || child.header}>
                    {renderSubMenuItem(child)}
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      );
    }

    if (item.disabled) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton variant="outline" tooltip={item.title} isActive={pathname === item.to} disabled={true}>
            {Icon && <Icon className="mr-2" />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton variant="outline" asChild tooltip={item.title} isActive={pathname === item.to}>
          <Link href={item.to || ""}>
            {Icon && <Icon className="mr-2" />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="mt-6 h-20 flex items-center justify-between px-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-12">
          <div className="flex items-center space-x-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:hidden">
            <Coins className="h-8 w-8 text-brand-purple" />
            <h1 className="text-2xl font-bold">The Raffle</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="h-full px-2">
            <SidebarMenu>
              {menuItems.map((item) => renderMenuItem(item))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
          <div className="flex items-center justify-between mb-4 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:space-y-2">
            <Button variant="outline" size="icon" className="group-data-[collapsible=icon]:px-2">
              <a href="https://www.linkedin.com/in/allan-gnutzmans-5424191b5/" target="_blank" rel="noopener noreferrer">
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" className="group-data-[collapsible=icon]:px-2">
              <a href="https://github.com/allangnutzmans/foundry-smart-contract-lottery" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" className="group-data-[collapsible=icon]:px-2">
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" className="group-data-[collapsible=icon]:px-2">
              <a href="mailto:allan.sgnutzmans@gmail.com">
                <Mail className="h-4 w-4" />
              </a>
            </Button>
            <SidebarTrigger className="" />
          </div>
          <div className="flex items-center group-data-[collapsible=icon]:justify-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 group-data-[collapsible=icon]:hidden"></div>
            <span className="text-sm group-data-[collapsible=icon]:hidden">{totalWagers ?? 0} Bets Wagered</span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
