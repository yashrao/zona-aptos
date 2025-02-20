import { Fragment, useState, useRef, useEffect } from "react";
import Layout from "@/components/layouts";
import MarketTable from "@/components/markets/MarketTable";
import MarketTable_AQ from "@/components/markets/MarketTable_AQ";
import Image from "next/image";

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState<"real-estate" | "air-quality">(
    "real-estate",
  );
  const [currencyDisplay, setCurrencyDisplay] = useState<"local" | "usd">(
    "local",
  );
  const underlineRef = useRef<HTMLDivElement>(null);
  const currencyUnderlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateUnderlinePosition = () => {
      const activeTabElement = document.querySelector(
        `[data-tab="${activeTab}"]`,
      );
      if (activeTabElement && underlineRef.current) {
        const { offsetLeft, offsetWidth } = activeTabElement as HTMLElement;
        const shortenedWidth = offsetWidth - 20;
        const centerOffset = (offsetWidth - shortenedWidth) / 2;
        underlineRef.current.style.left = `${offsetLeft + centerOffset}px`;
        underlineRef.current.style.width = `${shortenedWidth}px`;
      }
    };

    updateUnderlinePosition();
    window.addEventListener("resize", updateUnderlinePosition);

    return () => window.removeEventListener("resize", updateUnderlinePosition);
  }, [activeTab]);

  useEffect(() => {
    const updateCurrencyUnderlinePosition = () => {
      const activeCurrencyElement = document.querySelector(
        `[data-currency="${currencyDisplay}"]`,
      );
      if (activeCurrencyElement && currencyUnderlineRef.current) {
        const { offsetLeft, offsetWidth } =
          activeCurrencyElement as HTMLElement;
        const shortenedWidth = offsetWidth - 20;
        const centerOffset = (offsetWidth - shortenedWidth) / 2;
        currencyUnderlineRef.current.style.left = `${offsetLeft + centerOffset}px`;
        currencyUnderlineRef.current.style.width = `${shortenedWidth}px`;
      }
    };

    updateCurrencyUnderlinePosition();
    window.addEventListener("resize", updateCurrencyUnderlinePosition);

    return () =>
      window.removeEventListener("resize", updateCurrencyUnderlinePosition);
  }, [currencyDisplay]);

  return (
    <Fragment>
      <Layout title="Markets" button={true} app={true}>
        <div className="relative mt-24 mx-6 sm:mx-12 md:mx-20">
          <div className="opacity-100">
            <div className="mb-8 text-center">
              <h1 className="text-[50px] md:text-[80px] font-medium text-white -mb-3">
                Markets
              </h1>
              <p className="text-[14px] md:text-base text-[#AFAFAF] font-light">
                Explore real estate and air quality indexes
              </p>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <nav className="flex relative">
                <button
                  data-tab="real-estate"
                  onClick={() => setActiveTab("real-estate")}
                  className={`py-2 px-4 transition-colors duration-200 ease-in-out
                    ${
                      activeTab === "real-estate"
                        ? "text-[#23F98A] font-bold"
                        : "text-text-grey hover:text-[#23F98A]"
                    }`}
                >
                  Real Estate
                </button>
                {/*<button
                  data-tab="air-quality"
                  onClick={() => setActiveTab("air-quality")}
                  className={`py-2 px-4 transition-colors duration-200 ease-in-out
                    ${
                      activeTab === "air-quality"
                        ? "text-[#23F98A] font-bold"
                        : "text-text-grey hover:text-[#23F98A]"
                    }`}
                >
                  Air Quality
                </button>*/}
                <div
                  ref={underlineRef}
                  className="absolute bottom-0 h-0.5 bg-[#23F98A] transition-all duration-300 ease-in-out rounded-full"
                />
              </nav>

              {activeTab === "real-estate" && (
                <div className="flex items-center">
                  <nav className="flex relative">
                    <button
                      data-currency="local"
                      onClick={() => setCurrencyDisplay("local")}
                      className={`py-2 px-4 transition-colors duration-200 ease-in-out
                        ${
                          currencyDisplay === "local"
                            ? "text-[#23F98A] font-bold"
                            : "text-text-grey hover:text-[#23F98A]"
                        }`}
                    >
                      Local Currency
                    </button>
                    <button
                      data-currency="usd"
                      onClick={() => setCurrencyDisplay("usd")}
                      className={`py-2 px-4 transition-colors duration-200 ease-in-out
                        ${
                          currencyDisplay === "usd"
                            ? "text-[#23F98A] font-bold"
                            : "text-text-grey hover:text-[#23F98A]"
                        }`}
                    >
                      USD
                    </button>
                    <div
                      ref={currencyUnderlineRef}
                      className="absolute bottom-0 h-0.5 bg-[#23F98A] transition-all duration-300 ease-in-out rounded-full"
                    />
                  </nav>
                </div>
              )}
            </div>

            <div className="mb-16">
              {activeTab === 'real-estate' ? (
                <>
                  {/* Desktop view - hide on mobile */}
                  <div className="hidden md:block">
                    <MarketTable currencyDisplay={currencyDisplay} />
                  </div>

                  {/* Mobile view - hide on desktop */}
                  <div className="md:hidden space-y-4">
                    <MarketTable currencyDisplay={currencyDisplay} isMobile={true} />
                  </div>
                </>
              ) : (
                <>
                  {/* Desktop view - hide on mobile */}
                  <div className="hidden md:block">
                    <MarketTable_AQ />
                  </div>

                  {/* Mobile view - hide on desktop */}
                  <div className="md:hidden space-y-4">
                    <MarketTable_AQ isMobile={true} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </Fragment>
  );
}
