//"use client";
import { FC } from "react";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

import '@rainbow-me/rainbowkit/styles.css';

import {
  ConnectButton,
} from '@rainbow-me/rainbowkit';

const WalletNav: FC = () => {
  return (
    <>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
        <button
          className="h-[50px] md:h-[60px] md:text-[20px] md:w-[5wv] w-full pl-4 pr-4 bg-zona-green border-zona-green hover:text-interactive-button-hover text-black font-bold text-interactive-button border-[2px] rounded-interactive-button hover:bg-interactive-button-hover transition-interactive-button duration-interactive-button ease-interactive-button"
        >
          Connect Wallet
        </button>
        <ConnectButton></ConnectButton>
      </div>
    </>
  );
};

export default WalletNav;
