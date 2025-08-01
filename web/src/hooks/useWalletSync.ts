import { useAccount } from 'wagmi';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { api } from '@/lib/trpc';
/**
 * useWalletSync is a custom React hook that automatically synchronizes the
 * connected wallet address from Wagmi with the authenticated user's account in the backend.
 *
 * This hook:
 * - Listens for changes to the wallet address using `wagmi`'s `useAccount()`.
 * - Waits until the user session is authenticated via `next-auth`.
 * - Sends the wallet address to the backend using a protected tRPC mutation (`linkWallet`).
 * - Prevents duplicate syncing by using an internal ref (`syncedRef`) to track the last synced address.
 *
 * @example
 * useWalletSync(); // call this inside a top-level component to enable automatic wallet syncing
 *
 * @returns void
 */
export function useWalletSync() {
  const { address, isConnected } = useAccount();
  const { data: session, status } = useSession();
  const { mutate: linkWallet } = api.user.linkWallet.useMutation();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!address || !isConnected || status !== 'authenticated') return;
    if (syncedRef.current === address) return;

    linkWallet({ address }, {
      onSuccess: () => {
        syncedRef.current = address;
        console.log('Wallet successfully synced:', address);
      },
      onError: (err) => {
        console.warn('Error while sync wallet', err.message);
      },
    });
  }, [address, isConnected, status, session?.user.id, linkWallet]);
}