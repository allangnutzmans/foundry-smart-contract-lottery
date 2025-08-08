import Link from "next/link";
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
} from "@/components/ui/sidebar";
import {
  Wallet, Bell, BarChart3, Settings, Users, Gem, MessageSquare,
  Coins, Ticket, Gift, LayoutDashboard, ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
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

const menuItems: sidebarItem[] = [
    {
      title: "Home",
      icon: LayoutDashboard,
      to: "/",
    },
    {
      title: "NFT",
      icon: Wallet,
      to: "#",
    },
    {
      title: "Casino",
      icon: Coins,
      to: "#",
    },
    {
      title: "Sports",
      icon: Ticket,
      to: "#",
    },
    {
      header: "Events",
    },
    {
      title: "Promotions",
      icon: Gift,
      to: "#",
    },

    { header: "Play" },
    {
      title: "Raffles",
      icon: Ticket,
      to: "/",
      children: [
        { title: "My Raffles", to: "id" },
        { title: "All Raffles", to: "/raffles" },
        { title: "Ongoing", to: "/ongoing" },
        { title: "Leaderboard", to: "/raffles" },
      ],
    },
    { header: "Account" },
    { title: "Wallet", icon: Wallet, to: "#" },
    { title: "Notifications", icon: Bell, to: "#" },
    { title: "Profile", icon: Users, to: "#" },

    { header: "Analytics" },
    { title: "Stats", icon: BarChart3, to: "#" },
    { title: "Settings", icon: Settings, to: "#" },
  ];
  
  const renderMenuItem = (item: sidebarItem): React.ReactNode => {
    const Icon = item.icon as React.ElementType;
  
    // HEADER (grupo de título, sem link)
    if (item.header) {
      return (
        <SidebarGroup key={item.header}>
          <SidebarGroupLabel>{item.header}</SidebarGroupLabel>
        </SidebarGroup>
      );
    }
  
    // ITEM COM CHILDREN (usa Collapsible + SidebarMenuSub)
    if (item.children && item.children.length > 0) {
      return (
        <SidebarMenuItem key={item.title} asChild>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton variant="outline" tooltip={item.title}>
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
  
    // ITEM SIMPLES (sem children)
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton variant="outline" asChild tooltip={item.title}>
          <Link href={item.to || ""}>
            {Icon && <Icon className="mr-2" />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };
  
  // Função auxiliar para submenus
  const renderSubMenuItem = (item: sidebarItem) => {
    const Icon = item.icon as React.ElementType;
  
    if (item.children && item.children.length > 0) {
      return (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton>
              {Icon && <Icon className="mr-2" />}
              <span>{item.title}</span>
              <ChevronDown className="ml-auto h-4 w-4" />
            </SidebarMenuSubButton>
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
      );
    }
  
    return (
      <SidebarMenuSubButton asChild>
        <Link href={item.to || ""}>
          {Icon && <Icon className="mr-2" />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    );
  };
  

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="mt-2 h-20 flex items-center justify-between px-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-12">
        <div className="flex items-center space-x-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:hidden">
          <Gem className="h-8 w-8 text-brand-purple" />
          <h1 className="text-2xl font-bold">Raffle & NFT</h1>
        </div>
      </SidebarHeader>
        <SidebarContent>
          {/* TODO IMPLEMENT TOGGLE POSITIONING */}
          <SidebarTrigger className="" />
            {menuItems.map((item) => renderMenuItem(item))}
        </SidebarContent>
            <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
            <div className="flex items-center justify-between mb-4 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:space-y-2">
            <Button variant="outline" size="icon" className="group-data-[collapsible=icon]:w-full">
                <MessageSquare className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex-1 mx-2 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:mx-0">
                Contact icons
            </Button>
            </div>
            <div className="flex items-center group-data-[collapsible=icon]:justify-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 group-data-[collapsible=icon]:hidden"></div>
            <span className="text-sm group-data-[collapsible=icon]:hidden">4,119 Bets Wagered</span>
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
