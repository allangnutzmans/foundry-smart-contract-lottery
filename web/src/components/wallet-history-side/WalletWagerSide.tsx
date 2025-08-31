'use client';

import { useState } from 'react';
import { useMedia } from 'react-use';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { UserCard } from '@/components/wallet-history-side/UserCard';
import { WagerHistory } from '@/components/wallet-history-side/WagerHistory';
import { useWalletSync } from '@/hooks/useWalletSync';
import { cn } from '@/lib/utils';

export default function WalletWagerSide() {
  useWalletSync();
  const isSmall = useMedia('(max-width: 1830px)');
  const [open, setOpen] = useState(false);

  if (isSmall) {
    return (
      <div className="relative overflow-hidden me-2" onMouseEnter={() => setOpen(true)}>
        {/* Trigger estilo iPhone */}
        <button
          className={cn(
            'fixed top-1/2 right-0 transform -translate-y-1/2',
            'w-5 h-20 rounded-l-full flex items-center justify-center'
          )}
          aria-label="Open drawer"
        >
          <div className="w-1 h-20 bg-gray-600 rounded-full"></div>
        </button>

        {/* Drawer */}
        <Drawer open={open} onOpenChange={setOpen} direction="right">
          <DrawerContent className="w-[300px] max-w-[100vw] h-full px-3 rounded-l-xl shadow-lg">
            <UserCard />
            <WagerHistory isSmall={isSmall} />
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <aside className="relative w-[20%] min-w-[230px] rounded-xl ps-4 overflow-hidden h-full">
      <UserCard />
      <WagerHistory />
    </aside>
  );
}
