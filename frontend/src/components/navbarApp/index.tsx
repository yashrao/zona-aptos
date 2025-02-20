import { FC, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import useNavbarData from "./data";
import WalletNav from "./wallet";
import Link from "next/link";
import { useRouter } from "next/router";
import NavbarDropdowns from "./navbardropdowns";
import styles from "./Navbar.module.css";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface NavBarProps {
  button?: boolean;
}

interface chainInfo {
  name: string;
  faucetLink: string;
}

const Navbar: FC<NavBarProps> = ({ button }) => {
  const navigation = useNavbarData();
  const router = useRouter();
  const [isPlumeMode, setIsPlumeMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { account, connected, wallet, changeNetwork } = useWallet();

  const chain: chainInfo = {
    name: "Aptos",
    faucetLink: "",
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  return (
    <Disclosure
      as="nav"
      className="bg-transparent fixed w-full top-0 z-50 px-4"
      style={{
        backgroundColor: "#000000",
        backdropFilter: "blur(5px)",
      }}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-full">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Link
                      href="/trade"
                      className="flex flex-shrink-0 items-center group"
                    >
                      <div className="transition-transform duration-300">
                        <Image
                          className="h-9 w-[36px] rounded-full transition-all duration-1000 group-hover:animate-spin-slow group-hover:invert"
                          src="/images/logo/zona-400x400.webp"
                          alt="Zona"
                          height={400}
                          width={400}
                        />
                      </div>
                      <span className="font-bold ml-3 hidden md:block">
                        Zona
                      </span>
                    </Link>
                  </div>
                  <div className="hidden md:flex md:ml-6">
                    <div className="flex space-x-4">
                      <NavbarDropdowns />
                      {navigation
                        .filter((item) => !["Trade"].includes(item.name))
                        .map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              styles.navItem,
                              isActive(item.href) ? styles.active : "",
                              "rounded-md px-3 py-2 text-sm",
                            )}
                          >
                            {item.name}
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {connected && (
                    <a
                      href={chain.faucetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:block bg-[#0F1216] border-[0.5px] border-[#222226] rounded-[8px] px-4 py-2 text-sm text-white hover:bg-[#1a1f25] transition-colors duration-200"
                    >
                      {chain.name} Faucet
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="md:ml-4">{button && <WalletNav />}</div>
                    <div className="md:hidden">
                      <Disclosure.Button className="relative inline-flex items-center justify-center rounded-[8px] p-2 bg-[#0F1216] border-[0.5px] border-[#222226] text-white hover:bg-[#1a1f25] transition-colors duration-200 focus:outline-none">
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        ) : (
                          <Bars3Icon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
                        )}
                      </Disclosure.Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    isActive(item.href)
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium",
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {connected && (
                <a
                  href={chain.faucetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {chain.name} Faucet
                </a>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
