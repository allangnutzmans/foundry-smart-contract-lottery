"use client";
import { useState } from 'react';
import { WagmiProvider, cookieToInitialState } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { api, client } from "@/lib/trpc";
import { rainbowkitConfig } from "@/lib/rainbowkitConfig";
import { getRainbowKitTheme } from "@/config/rainbowkitTheme";
import { NotificationProvider } from "@/contexts/NotificationContext";
import type { Session } from 'next-auth';

type Props = {
    children: React.ReactNode;
    cookie?: string | null;
    session: Session | null
};

const theme = getRainbowKitTheme();
export default function Providers({ children , cookie, session }: Props) {
    const initialState = cookieToInitialState(rainbowkitConfig, cookie);
    const [queryClient] = useState(() => new QueryClient())
    return (
        <WagmiProvider config={rainbowkitConfig} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <api.Provider client={client} queryClient={queryClient}>
                  <RainbowKitProvider
                      theme={theme}
                  >
                    <SessionProvider session={session}>
                      <NotificationProvider>
                        {children}
                      </NotificationProvider>
                    </SessionProvider>
                  </RainbowKitProvider>
              </api.Provider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}