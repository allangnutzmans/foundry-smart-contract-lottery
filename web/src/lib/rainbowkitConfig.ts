'use client';

import { http, createStorage, cookieStorage } from 'wagmi'
import { sepolia, bscTestnet, blastSepolia } from 'wagmi/chains'
import { type Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

const projectId = '6a6bc9ccada2df8d6c64e6bc29a2abbe';

const supportedChains: Chain[] = [sepolia, bscTestnet, blastSepolia];

export const rainbowkitConfig = getDefaultConfig({
    appName: 'WalletConnection',
    projectId,
    chains: supportedChains as never,
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
    transports: supportedChains.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {})
});