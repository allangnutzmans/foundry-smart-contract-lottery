import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Coins,
  Gift,
  Ticket,
  Store,
  LifeBuoy,
  Book,
  Search,
  ChevronDown,
  Gem,
  MessageSquare,
} from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = () => {
  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col z-10">
      <div className="p-4 h-20 flex items-center">
        <div className="flex items-center space-x-2">
          <Gem className="h-8 w-8 text-brand-purple" />
          <h1 className="text-2xl font-bold">Logo</h1>
        </div>
      </div>
      <div className="p-4 relative">
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Search Games"
          className="w-full bg-muted rounded-md p-2 pl-10"
        />
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul>
          <li className="mb-2">
            <Button variant="ghost" className="w-full justify-start bg-card hover:bg-muted">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
          </li>
          <li className="mb-2">
            <Button variant="ghost" className="w-full justify-between bg-card hover:bg-muted">
              <div className="flex items-center">
                <Wallet className="mr-3 h-5 w-5" />
                NFT
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </li>
        </ul>
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider my-4 px-4">Play</h2>
        <ul>
          <li className="mb-2">
            <Button variant="ghost" className="w-full justify-between bg-card hover:bg-muted">
              <div className="flex items-center">
                <Coins className="mr-3 h-5 w-5" />
                Casino
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </li>
          <li className="mb-2">
            <Button variant="ghost" className="w-full justify-between bg-card hover:bg-muted">
              <div className="flex items-center">
                <Ticket className="mr-3 h-5 w-5" />
                Sports
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </li>
        </ul>
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider my-4 px-4">Events</h2>
        <ul>
          <li className="mb-2">
            <Button variant="ghost" className="w-full justify-start bg-card hover:bg-muted">
              <Gift className="mr-3 h-5 w-5" />
              Promotions
            </Button>
          </li>
          <li className="mb-2">
            <Button variant="secondary" className="w-full justify-between">
              <div className="flex items-center">
                <Ticket className="mr-3 h-5 w-5" />
                Raffles
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </li>
        </ul>
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider my-4 px-4">More</h2>
        <ul>
          <li className="mb-2">
            <Button variant="ghost" className="w-full justify-start bg-card hover:bg-muted">
              <Store className="mr-3 h-5 w-5" />
              Store
            </Button>
          </li>
          <li className="mb-2">
            <Button variant="ghost" className="w-full justify-start bg-card hover:bg-muted">
              <LifeBuoy className="mr-3 h-5 w-5" />
              Support
            </Button>
          </li>
          <li className="mb-2">
            <Button variant="ghost" className="w-full justify-start bg-card hover:bg-muted">
              <Book className="mr-3 h-5 w-5" />
              Blog
            </Button>
          </li>
        </ul>
      </nav>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex-1 mx-2">
            English
          </Button>
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm">4,119 Bets Wagered</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
