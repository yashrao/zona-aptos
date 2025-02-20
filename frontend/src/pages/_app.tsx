import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { MizuWallet } from "@mizuwallet-sdk/aptos-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();
const wallets = [new PetraWallet()];

export default function App({ Component, pageProps }: AppProps) {
  console.log("App rendering", pageProps);
  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={true}
      dappConfig={{ network: Network.DEVNET }}
      onError={(error) => {
        console.log("error", error);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </AptosWalletAdapterProvider>
  );
}
