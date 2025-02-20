import { getDefaultConfig } from '@rainbow-me/rainbowkit';

import {
    // base,
    baseSepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'zona',
    projectId: '66299b59c166752d10a4fd338dc1c11c',
    chains: [baseSepolia],
    ssr: true, // If your dApp uses server side rendering (SSR)
});