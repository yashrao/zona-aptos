import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import useNavbarData from "./data";
import LoginNav from "./login";
import WalletNav from "./wallet";
import ConnectWalletButton from "../buttons/connect-wallet";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface NavBarProps {
  button?: boolean
}

const Navbar: FC<NavBarProps> = ({ button }) => {

  const navigation = useNavbarData();

  return (
    <Disclosure
      as="nav"
      className="bg-transparent fixed w-full top-0 z-50 px-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(5px)",
      }}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl">
            <div className="relative flex h-16 items-center sm:justify-center justify-start">
              <div className="sm:absolute inset-y-0 sm:left-0 flex items-center md:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="absolute left-[50%] right-[50%] sm:left-0 flex items-center justify-center md:items-stretch md:justify-start sm:w-[10%]">
                <Link href="/" className="flex flex-shrink-0 items-center">
                  <Image
                    className="h-9 w-[36px] rounded-full"
                    src="/images/logo/zona-400x400.webp"
                    alt="Your Company"
                    height={400}
                    width={400}
                  />
                  <span className="font-bold ml-3">Zona</span>
                </Link>
              </div>
              <div className="hidden md:ml-6 md:block">
                <div className="flex space-x-4 items-center justify-center z-[51]">
                  {navigation.map((item: any) => (
                    <>
                      {item.name !== "Join Waitlist" ? (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="text-gray-300 hover:underline hover:underline-offset-8 hover:decoration-4 hover:text-zona-green rounded-lg px-3 py-2 text-sm font-bold"
                          target={`${item.external ? "_blank" : "_self"}`}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            "text-black font-extrabold bg-zona-green hover:decoration-4 hover:bg-transparent hover:text-zona-green border-zona-green border-[2px]",
                            "rounded-lg px-5 py-2 text-sm font-extrabold absolute right-0 transition delay-100"
                          )}
                          aria-current={item.current ? "page" : undefined}
                          target={`${item.external ? "_blank" : "_self"}`}
                        >
                          {item.name}
                        </Link>
                      )}
                    </>
                  ))}
                  {button ? (
                    <>
                      L
                      <WalletNav />
                    </>)
                    : ("L")
                  }
                </div>
              </div>
              {/* <LoginNav /> */}
            </div>
          </div>

          <Disclosure.Panel
            className="md:hidden z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, .05)" }}
          >
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-emerald-900 text-white hover:bg-emerald-600"
                      : "text-gray-300 hover:bg-emerald-600 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                  target={`${item.external ? "_blank" : "_self"}`}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
