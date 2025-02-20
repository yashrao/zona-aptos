import { FC } from "react";
import Head from "next/head";
import Navbar from "@/components/navbar";
import NavbarApp from "@/components/navbarApp";
import Image from "next/image";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";

interface LayoutProps {
  title: string;
  children: React.ReactNode;
  bgImage?: string;
  heroText?: string;
  heroDescription?: string;
  button?: boolean;
  app?: boolean;
}

const Layout: FC<LayoutProps> = ({
  title,
  children,
  bgImage,
  heroText,
  heroDescription,
  button,
  app,
}) => {
  return (
    <>
      {/* Add a global style override */}
      <Head>
        <title>{title}</title>
      </Head>
      <NavbarApp button={button} />
      {bgImage ? (
        <>
          <div
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(${bgImage})`,
              backgroundSize: "cover",
              filter: "grayscale(0%)",
            }}
            className="object-cover w-full flex flex-col items-center justify-center h-[750px]"
          >
            <div className="mx-auto w-full max-w-7xl py-6 px-4">
              <h1 className="text-[36px] sm:text-[48px] font-bold my-auto sm:mb-28 mb-20 sm:tracking-[2px]">
                {heroText}
              </h1>
              <span className="text-[28px] sm:text-[36px] font-bold sm:tracking-[2px]">
                {heroDescription}
              </span>
            </div>
          </div>
          <div className="mx-auto w-full max-w-7xl my-10 px-4">{children}</div>
        </>
      ) : (
        <>
          <div className="">{children}</div>
        </>
      )}
      <Analytics />
    </>
  );
};

export default Layout;
