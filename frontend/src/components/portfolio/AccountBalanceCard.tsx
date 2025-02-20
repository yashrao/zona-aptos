import React from 'react';
import { contracts, getBalance } from "../../contract/contracts";
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { parseUnits } from 'viem';

interface AccountBalanceCardProps {
  accountBalance: number; // NOTE: should be replaced soon
  dailyChange: { value: number; percentage: number };
  monthlyChange: { value: number; percentage: number };
}

export default function AccountBalanceCard({ accountBalance, dailyChange, monthlyChange }: AccountBalanceCardProps) {

  const { isConnected, address } = useAccount();

  var balance: number;
  if (isConnected && address != undefined) {
    balance = getBalance(address);
  } else {
    balance = 0;
  }

  return (
    <div className="bg-[#0F1216] border border-[#222226] rounded-lg p-4 md:p-5 flex flex-col justify-between h-full">
      <div>
        <h2 className="text-[#AFAFAF] text-sm md:text-base">Account Balance</h2>
        <div className="text-[40px] font-bold mb-2 md:mb-2.5">${balance.toFixed(1)}</div>
        <div className="h-px bg-[#23F98A] w-full mb-3 md:mb-3"></div>
        <div className="flex mb-1 md:mb-1.5 text-sm md:text-xl">
          <div className="w-1/2">
            <span className="text-[#AFAFAF] text-[16px]">24h change</span>
            <div className="text-[#23F98A] text-[22px] font-bold">↑ ${dailyChange.value.toFixed(1)} ({dailyChange.percentage.toFixed(1)}%)</div>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <h3 className="text-sm md:text-base mb-2 md:mb-2.5">Details</h3>
        <div className="h-px bg-[#AFAFAF] w-full my-2 md:my-2.5"></div>
        {['Funds Available', 'Open Interest'].map((item, index) => (
          <div key={index} className="flex justify-between mb-2 md:mb-2.5 text-sm md:text-base">
            <span className="text-[#AFAFAF]">{item}</span>
            <span>{index === 2 ? '12.5x' : `$${index * 50 + 450}.0`}</span>
          </div>
        ))}
      </div>
    </div>
  );
};