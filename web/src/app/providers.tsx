"use client";

import { WagmiProvider, cookieToInitialState } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { w3Config } from "@/lib/w3Config";
import {getRainbowKitTheme} from "@/config/rainbowkitTheme";

const queryClient = new QueryClient();

type Props = {
    children: React.ReactNode;
    cookie?: string | null;
};

const theme = getRainbowKitTheme();
export default function Providers({ children , cookie }: Props) {
    const initialState = cookieToInitialState(w3Config, cookie);
    return (
        <WagmiProvider config={w3Config} initialState={initialState}>
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