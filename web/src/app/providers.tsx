"use client";

import { WagmiProvider, cookieToInitialState } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { rainbowkitConfig } from "@/lib/rainbowkitConfig";
import {getRainbowKitTheme} from "@/config/rainbowkitTheme";

const queryClient = new QueryClient();

type Props = {
    children: React.ReactNode;
    cookie?: string | null;
};

const theme = getRainbowKitTheme();
export default function Providers({ children , cookie }: Props) {
    const initialState = cookieToInitialState(rainbowkitConfig, cookie);
    return (
        <WagmiProvider config={rainbowkitConfig} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={theme}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}