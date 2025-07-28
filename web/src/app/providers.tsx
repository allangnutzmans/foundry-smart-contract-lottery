"use client";
import { useState } from 'react';
import { WagmiProvider, cookieToInitialState } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, client } from "@/lib/trpc";
import { rainbowkitConfig } from "@/lib/rainbowkitConfig";
import { getRainbowKitTheme } from "@/config/rainbowkitTheme";

type Props = {
    children: React.ReactNode;
    cookie?: string | null;
};

const theme = getRainbowKitTheme();
export default function Providers({ children , cookie }: Props) {
    const initialState = cookieToInitialState(rainbowkitConfig, cookie);
    const [queryClient] = useState(() => new QueryClient())
    return (
        <WagmiProvider config={rainbowkitConfig} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <trpc.Provider client={client} queryClient={queryClient}>
                  <RainbowKitProvider
                      theme={theme}
                  >
                      {children}
                  </RainbowKitProvider>
              </trpc.Provider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}