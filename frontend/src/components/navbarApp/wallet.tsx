//"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";

export default function WalletNav() {
  const { account, connected, wallet, changeNetwork } = useWallet();

  return (
    <>
      <style jsx global>{`
        .wallet-button {
          padding: 12px; /* px-3 py-3 equivalent */
          background-color: #23f98a; /* bg-zona-green */
          color: black; /* text-black */
          font-weight: bold; /* font-bold */
          border-radius: 12px; /* rounded-xl */
          transition: all 0.2s ease-in-out; /* transition-all duration-200 ease-in-out */
        }

        .wallet-button:hover {
          background-color: black; /* hover:bg-black */
          color: #23f98a; /* hover:text-zona-green */
          border: 2px solid #23f98a; /* hover:border-2 hover:border-zona-green */
        }
      `}</style>
      <div>
        {/* Removed absolute positioning */}
        <WalletConnector />
      </div>
    </>
  );
}
