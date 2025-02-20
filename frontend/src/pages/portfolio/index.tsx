import React, { Fragment, useEffect, useState, useCallback } from "react";
import Layout from "@/components/layouts";
import Image from "next/image";
import {
  useAccount,
  usePublicClient,
  useWatchContractEvent,
  useReadContract,
  useReadContracts,
} from "wagmi";
import { multicall } from "@wagmi/core";
import { config } from "@/contract/chains";
import {
  getContracts,
  masterAbi,
  createPlayerRecordCalls,
  fetchHistories,
} from "@/contract/contracts";
import { parseAbi } from "viem";
import { markets, getValidCityIdentifiers } from "@/components/utils/mappings";
import { formatDate } from "@/components/utils/dateutils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import CustomConnect from "@/components/buttons/CustomConnect";
import * as htmlToImage from "html-to-image";
import Loading from "@/components/loading";

import { fetchRank, fetchRanks, Player } from "@/components/utils/fetchRanks";

function formatGuess(guess: number, currency: string | undefined) {
  if (currency === undefined) {
    currency = "";
  }
  function numberWithCommas(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return currency + " " + numberWithCommas(guess);
}

function getIconIdentifier(identifier: string): string | undefined {
  return markets.find((market) => {
    return market.identifier === identifier;
  })?.flag;
}

const marketTypeIcons = new Map<string, string>([
  ["Real Estate", "rei_icon.svg"],
  ["Air Quality", "aqi_icon.svg"],
]);

export default function PortfolioPage() {
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const contracts = getContracts(chainId);
  const [events, setEvents] = useState<any[]>([]);
  const [player, setPlayer] = useState<any>();
  const [isFetched, setIsFetched] = useState(false);
  const [isFetchedHistory, setIsFetchedHistory] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [favoriteCity, setFavoriteCity] = useState<string | null>(null);
  const [copyButtonText, setCopyButtonText] = useState("Copy Image");
  const { openConnectModal } = useConnectModal();

  // Get valid city identifiers
  const validCityIdentifiers = markets.map((market) => market.identifier);

  const [isRanksLoading, setIsRanksLoading] = useState(true);
  const [win, setWin] = useState(0);
  const [loss, setLoss] = useState(0);

  useEffect(() => {
    const fetchHistoricalEvents = async () => {
      if (!contracts?.master || !address) return;

      try {
        const logs = await publicClient?.getLogs({
          address: contracts.master,
          event: parseAbi([
            "event PositionResolved(address indexed player, bytes32 indexed oracleKey, uint256 guess, bool long, uint256 timeframe, uint256 timestamp, bool won, uint256 finalValue)",
          ])[0],
          args: {
            player: address,
          },
          fromBlock: BigInt(contracts.startBlock),
          toBlock: "latest",
        });

        console.log("Raw logs:", logs); // Debugging: Inspect the logs

        const parsedEvents = logs
          ?.map((log: any) => {
            if (!log.args) {
              console.warn("Skipping log with missing args:", log);
              return null;
            }

            const {
              player,
              oracleKey,
              guess,
              long,
              timeframe,
              timestamp,
              won,
              finalValue,
            } = log.args;

            return {
              player,
              oracleKey: oracleKey?.toString(),
              guess: guess?.toString(),
              long,
              timeframe: timeframe?.toString(),
              date: formatDate(timestamp?.toString()),
              timestamp: Number(timestamp?.toString()),
              won,
              finalValue: finalValue?.toString(),
            };
          })
          .filter(Boolean)
          .sort((a: any, b: any) => {
            if (a !== null && b !== null) {
              return b.timestamp - a.timestamp;
            } else {
              return 0;
            }
          });

        if (parsedEvents !== undefined) {
          setEvents(parsedEvents);
          setIsFetchedHistory(true);
        }
      } catch (error) {
        console.error("Failed to fetch historical events:", error);
      }
    };

    fetchHistoricalEvents();
  }, [address, contracts?.master, publicClient, chainId]);

  useEffect(() => {
    const fetchData = async () => {
      setIsRanksLoading(true);
      try {
        if (isConnected && address) {
          const { data } = await fetchRank(address);
          setUserRank(data.rank);
          setWin(data.wins);
          setLoss(data.losses);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsRanksLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address]);

  // Helper function to get city icon
  const getCityIcon = (cityName: string | null) => {
    if (!cityName) return null;
    return markets.find((market) => market.city === cityName)?.flag;
  };

  // Update handleDownload function
  const handleDownload = useCallback(async () => {
    const isMobile = window.innerWidth < 768;
    const element = document.getElementById(
      isMobile ? "mobile-stats-card" : "stats-card",
    );

    if (!element) return;

    try {
      // Wait a bit for images to load
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#141111",
        style: {
          transform: "none",
          opacity: "1",
        },
        filter: (node: HTMLElement) => {
          // Preserve all images and SVGs
          if (node instanceof HTMLImageElement || node instanceof SVGElement) {
            return true;
          }
          // Skip any unwanted elements
          return !node.classList?.contains("exclude-from-snapshot");
        },
      });

      // Download image
      const link = document.createElement("a");
      link.download = "zona-stats.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  }, []);

  // Add handleShare function
  const handleShare = useCallback(async () => {
    const desktopElement = document.getElementById("stats-card");
    const mobileElement = document.getElementById("mobile-stats-card");
    const element = window.innerWidth < 768 ? mobileElement : desktopElement;

    if (!element) return;

    try {
      const canvas = await htmlToImage.toBlob(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#141111",
        style: {
          transform: "none",
          opacity: "1",
        },
        filter: (node: HTMLElement) => {
          // Preserve all images and SVGs
          if (node instanceof HTMLImageElement || node instanceof SVGElement) {
            return true;
          }
          // Skip any unwanted elements
          return !node.classList?.contains("exclude-from-snapshot");
        },
      });

      if (canvas) {
        // Create tweet text
        const tweetText = `I'm taking bets on @zona_io, come join me at https://app.zona.finance`;
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

        window.open(shareUrl, "_blank");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, []);

  const handleCopyImage = useCallback(async () => {
    const isMobile = window.innerWidth < 768;
    const element = document.getElementById(
      isMobile ? "mobile-stats-card" : "stats-card",
    );

    if (!element) return;

    try {
      const blob = await htmlToImage.toBlob(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#141111",
        style: {
          transform: "none",
          opacity: "1",
        },
        filter: (node: HTMLElement) => {
          if (node instanceof HTMLImageElement || node instanceof SVGElement) {
            return true;
          }
          return !node.classList?.contains("exclude-from-snapshot");
        },
      });

      if (blob) {
        // Create ClipboardItem and write to clipboard
        const data = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([data]);

        // Show feedback
        setCopyButtonText("Copied!");
        setTimeout(() => setCopyButtonText("Copy Image"), 2000);
      }
    } catch (error) {
      console.error("Error copying image:", error);
      setCopyButtonText("Failed to copy");
      setTimeout(() => setCopyButtonText("Copy Image"), 2000);
    }
  }, []);

  return (
    <Fragment>
      <Layout title="Portfolio" button={true} app={true}>
        <div className="py-20 md:py-10 lg:py-20">
          <div className="bg-black text-white p-4 md:p-5 font-inter">
            {/* Stats Section with Zona Logo */}
            <div className="mt-4 md:mt-20 mb-6 md:mb-10">
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-60">
                {/* Win-Loss Record */}
                <div className="text-center">
                  <p className="text-[20px] text-[#FFFFFF] font-thin mt-4">
                    Win-Loss Record
                  </p>
                  {isConnected ? (
                    <p className="text-[80px] font-bold -mt-4">
                      <span className="text-zona-green">{win}</span>
                      <span className="text-[#FFFFFF]">-</span>
                      <span className="text-zona-red">{loss}</span>
                    </p>
                  ) : (
                    <div className="flex justify-center items-center py-5">
                      <CustomConnect />
                    </div>
                  )}
                </div>

                {isConnected ? (
                  <div className="text-center">
                    <p className="text-[20px] text-[#FFFFFF] font-thin">
                      Your Rank
                    </p>
                    <div
                      className="cursor-pointer transition-opacity hover:opacity-50"
                      onClick={() => setIsPopupOpen(true)}
                    >
                      <div className="text-[80px] font-bold -mt-4 flex justify-center items-center opacity-80">
                        <span className="pl-5">
                          {userRank ? userRank : "-"}
                        </span>
                        <Image
                          src="/images/icons/svg/share_icon.svg"
                          className="invert ml-2"
                          alt="Zona Stats"
                          width={20}
                          height={85}
                          priority
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>

            {/* Main Popup Container */}
            {isPopupOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4">
                {/* Overlay */}
                <div
                  className="absolute inset-0 bg-black opacity-80"
                  onClick={() => setIsPopupOpen(false)}
                />

                {/* Desktop Stats Card - hidden on mobile */}
                <div className="relative hidden md:flex bg-[#1A1D24] p-8 rounded-lg border-[0.5px] border-[#222226] flex-row gap-8">
                  {/* Existing desktop card content */}
                  <div
                    id="stats-card"
                    className="relative w-[800px] h-[450px] bg-[#141111] overflow-hidden ring-1 ring-card-border ring-opacity-5"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <Image
                        src="/images/logo/rankshare.svg"
                        alt="Rank Share Background"
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                      />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-6 md:p-16 flex flex-col justify-between h-full scale-[0.4] md:scale-100 origin-top-left md:origin-top">
                      {/* Top Section */}
                      <div>
                        <div className="mb-16">
                          <div className="flex justify-center items-center gap-60">
                            {/* Your Rank - Left Side */}
                            <div className="text-center translate-x-[30px] translate-y-[60px] md:translate-x-[30px] md:translate-y-[60px]">
                              <div className="text-[#AFAFAF] text-[22px] mt-5 font-thin">
                                Your Rank
                              </div>
                              <div className="text-white text-[120px] -mt-6 font-extrabold leading-tight">
                                {userRank || "-"}
                              </div>
                            </div>

                            {/* Your Record - Right Side */}
                            <div className="text-center -translate-x-[30px] translate-y-[50px] md:-translate-x-[30px] md:translate-y-[50px]">
                              <div className="text-[#AFAFAF] text-[22px] mt-6 font-thin">
                                Your Record
                              </div>
                              <div className="text-[34px] font-bold -mt-2">
                                <span className="text-zona-green">{win}</span>
                                <span className="text-white">
                                  {" "}
                                  {win > 1 ? "wins" : "win"}{" "}
                                </span>
                              </div>
                              <div className="text-[34px] font-bold -mt-2">
                                <span className="text-zona-red">{loss}</span>
                                <span className="text-white">
                                  {" "}
                                  {loss > 1 ? "losses" : "loss"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section */}
                      <div className="grid grid-cols-3 gap-4 translate-y-[-40px] md:translate-y-0">
                        <div>
                          <div className="text-[#AFAFAF] text-[18px] font-thin">
                            Favorite City
                          </div>
                          <div className="flex items-center gap-2">
                            {favoriteCity &&
                              getIconIdentifier(favoriteCity) && (
                                <Image
                                  src={getIconIdentifier(favoriteCity)!}
                                  alt={favoriteCity}
                                  width={24}
                                  height={24}
                                  priority
                                />
                              )}
                            <span className="text-white text-[18px] font-thin">
                              {favoriteCity || "Dubai"}
                            </span>
                          </div>
                        </div>

                        <div className="-translate-x-8">
                          <div className="text-[#AFAFAF] text-[18px] font-thin">
                            Favorite Market
                          </div>
                          <div className="flex items-center gap-2">
                            <Image
                              src="/images/logo/rei_icon.svg"
                              alt="Real Estate Icon"
                              width={24}
                              height={24}
                              priority
                            />
                            <span className="text-white text-[18px] font-thin">
                              Real Estate
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[#AFAFAF] text-[18px] font-thin">
                            Trade on
                          </div>
                          <div className="text-white text-[18px] font-thin">
                            app.zona.finance
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Existing right side content */}
                  <div className="w-64 flex flex-col justify-between">
                    {/* Welcome Message */}
                    <div className="text-white">
                      <h2 className="text-[20px] md:text-[23px] text-zona-green font-bold mb-4 text-center">
                        Congrats, keep betting!
                      </h2>
                      <p className="text-[#AFAFAF] text-[15px] text-center">
                        Share your achievements!
                      </p>
                    </div>

                    {/* Share Options */}
                    <div className="flex flex-col gap-3 my-4 md:mb-6">
                      <button
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 text-white text-sm bg-[#222226] hover:bg-[#2f3039] px-6 py-3 rounded-lg transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Download Image
                      </button>
                      <button
                        onClick={async () => {
                          const desktopElement =
                            document.getElementById("stats-card");
                          const mobileElement =
                            document.getElementById("mobile-stats-card");
                          const element =
                            window.innerWidth < 768
                              ? mobileElement
                              : desktopElement;

                          if (!element) return;

                          try {
                            const blob = await htmlToImage.toBlob(element, {
                              quality: 1,
                              pixelRatio: 2,
                              backgroundColor: "#141111",
                              style: {
                                transform: "none",
                                opacity: "1",
                              },
                              filter: (node: HTMLElement) => {
                                // Preserve all images and SVGs
                                if (
                                  node instanceof HTMLImageElement ||
                                  node instanceof SVGElement
                                ) {
                                  return true;
                                }
                                // Skip any unwanted elements
                                return !node.classList?.contains(
                                  "exclude-from-snapshot",
                                );
                              },
                            });

                            if (blob) {
                              await navigator.clipboard.write([
                                new ClipboardItem({
                                  "image/png": blob,
                                }),
                              ]);

                              setCopyButtonText("Copied!");
                              setTimeout(() => {
                                setCopyButtonText("Copy Image");
                              }, 2000);
                            }
                          } catch (error) {
                            console.error("Error copying image:", error);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 text-white text-sm bg-[#222226] hover:bg-[#2f3039] px-4 py-3 rounded-lg"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        {copyButtonText}
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 text-white text-sm bg-[#222226] hover:bg-[#2f3039] px-6 py-3 rounded-lg transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085a4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Share on X
                      </button>
                    </div>

                    {/* Additional Info */}
                    <div className="text-center">
                      <p className="text-[#AFAFAF] text-[15px] mb-4">
                        Join our community today!
                      </p>
                      <a
                        href="https://discord.com/invite/9Kf6vvguug"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-white text-sm bg-[#222226] hover:bg-[#2f3039] px-6 py-3 rounded-lg transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        Join Discord
                      </a>
                    </div>
                  </div>
                </div>

                {/* Mobile Stats Card */}
                <div className="relative md:hidden bg-[#1A1D24] p-4 rounded-lg border-[0.5px] border-[#222226] w-full max-w-[320px]">
                  {/* Mobile Stats Card Content */}
                  <div
                    id="mobile-stats-card"
                    className="relative bg-[#141111] rounded-lg overflow-hidden"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      <Image
                        src="/images/logo/rankshare.svg"
                        alt="Rank Share Background"
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                      />
                    </div>

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <Image
                        src="/images/logo/zona-400x400.webp"
                        alt="Zona"
                        width={24}
                        height={24}
                        className="rounded-full"
                        priority
                      />
                      <span className="text-white text-lg font-bold">Zona</span>
                    </div>

                    {/* Mobile Content */}
                    <div className="relative z-10 p-6 pt-16">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Rank */}
                        <div className="text-center">
                          <div className="text-[#AFAFAF] text-sm font-thin">
                            Your Rank
                          </div>
                          <div
                            className={`text-white font-bold ${
                              userRank?.toString().length === 1
                                ? "text-3xl"
                                : userRank?.toString().length === 2
                                  ? "text-3xl"
                                  : userRank?.toString().length === 3
                                    ? "text-3xl"
                                    : "text-xl"
                            }`}
                          >
                            {userRank || "-"}
                          </div>
                        </div>

                        {/* Record */}
                        <div className="text-center">
                          <div className="text-[#AFAFAF] text-sm font-thin">
                            Your Record
                          </div>
                          <div
                            className={`font-bold ${
                              Math.max(
                                win?.toString().length || 0,
                                loss?.toString().length || 0,
                              ) === 1
                                ? "text-3xl"
                                : Math.max(
                                      win?.toString().length || 0,
                                      loss?.toString().length || 0,
                                    ) === 2
                                  ? "text-2xl"
                                  : Math.max(
                                        win?.toString().length || 0,
                                        loss?.toString().length || 0,
                                      ) === 3
                                    ? "text-2xl"
                                    : "text-xl"
                            }`}
                          >
                            <span className="text-zona-green">{win}</span>
                            <span className="text-white">-</span>
                            <span className="text-zona-red">{loss}</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Stats */}
                      <div className="grid grid-cols-2 gap-4 translate-x-4">
                        {/* Favorite City */}
                        <div>
                          <div className="text-[#AFAFAF] text-[11px] font-thin">
                            Favorite City
                          </div>
                          <div className="flex items-center gap-1">
                            {favoriteCity &&
                              getIconIdentifier(favoriteCity) && (
                                <Image
                                  src={getIconIdentifier(favoriteCity)!}
                                  alt={favoriteCity}
                                  width={14}
                                  height={14}
                                  priority
                                />
                              )}
                            <span className="text-white text-[11px]">
                              {favoriteCity || "Dubai"}
                            </span>
                          </div>
                        </div>

                        {/* Favorite Market */}
                        <div>
                          <div className="text-[#AFAFAF] text-[11px] font-thin">
                            Favorite Market
                          </div>
                          <div className="flex items-center gap-1">
                            <Image
                              src="/images/logo/rei_icon.svg"
                              alt="Real Estate Icon"
                              width={14}
                              height={14}
                              priority
                            />
                            <span className="text-white text-[11px]">
                              Real Estate
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Trade on URL */}
                      <div className="text-right mt-4">
                        <div className="text-[#AFAFAF] text-sm font-thin">
                          Trade on
                        </div>
                        <div className="text-white text-sm">
                          app.zona.finance
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2 text-white text-sm bg-[#222226] hover:bg-[#2f3039] px-4 py-3 rounded-lg"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Download Image
                    </button>
                    <button
                      onClick={async () => {
                        const desktopElement =
                          document.getElementById("stats-card");
                        const mobileElement =
                          document.getElementById("mobile-stats-card");
                        const element =
                          window.innerWidth < 768
                            ? mobileElement
                            : desktopElement;

                        if (!element) return;

                        try {
                          const blob = await htmlToImage.toBlob(element, {
                            quality: 1,
                            pixelRatio: 2,
                            backgroundColor: "#141111",
                            style: {
                              transform: "none",
                              opacity: "1",
                            },
                            filter: (node: HTMLElement) => {
                              // Preserve all images and SVGs
                              if (
                                node instanceof HTMLImageElement ||
                                node instanceof SVGElement
                              ) {
                                return true;
                              }
                              // Skip any unwanted elements
                              return !node.classList?.contains(
                                "exclude-from-snapshot",
                              );
                            },
                          });

                          if (blob) {
                            await navigator.clipboard.write([
                              new ClipboardItem({
                                "image/png": blob,
                              }),
                            ]);

                            setCopyButtonText("Copied!");
                            setTimeout(() => {
                              setCopyButtonText("Copy Image");
                            }, 2000);
                          }
                        } catch (error) {
                          console.error("Error copying image:", error);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 text-white text-sm bg-[#222226] hover:bg-[#2f3039] px-4 py-3 rounded-lg"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      {copyButtonText}
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-full flex items-center justify-center gap-2 text-white text-sm bg-[#222226] hover:bg-[#2f3039] px-4 py-3 rounded-lg"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085a4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Share on X
                    </button>
                    <a
                      href="https://discord.com/invite/9Kf6vvguug"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 text-white text-sm bg-[#222226] hover:bg-[#2f3039] px-4 py-3 rounded-lg transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      Join Discord
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full max-w-full overflow-x-auto">
              {/* Trade History title - updated to match leaderboard style */}
              {isConnected ? (
                <div className="text-[#FFFFFF] text-lg mb-4 text-center">
                  Trade History
                </div>
              ) : (
                ""
              )}

              {isConnected && !isFetchedHistory ? (
                <div className="flex justify-center">
                  <Loading isMobile={false} />
                </div>
              ) : isConnected ? (
                <>
                  {/* Desktop table - hide on mobile */}
                  <table className="w-full text-white hidden md:table">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-6 py-3 text-[#AFAFAF] font-thin text-left">
                          Date
                        </th>
                        <th className="px-6 py-3 text-[#AFAFAF] font-thin text-left">
                          Market
                        </th>
                        <th className="px-6 py-3 text-[#AFAFAF] font-thin text-left">
                          Market Type
                        </th>
                        <th className="px-6 py-3 text-[#AFAFAF] font-thin text-left">
                          Entry Value
                        </th>
                        <th className="px-6 py-3 text-[#AFAFAF] font-thin text-left">
                          Direction
                        </th>
                        <th className="px-6 py-3 text-[#AFAFAF] font-thin text-left">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event, index) => (
                        <tr
                          key={index}
                          className="border-b border-[#222226] bg-[#000000] hover:bg-[#0F1216] transition-colors duration-200"
                        >
                          <td className="px-6 py-4 font-thin">{event.date}</td>{" "}
                          {/* Use event.date */}
                          <td className="px-6 py-4 font-thin">
                            <div className="flex items-center gap-2">
                              <Image
                                src={`${markets.find((market) => market.oracleKey === event.oracleKey)?.flag}`}
                                alt={`${markets.find((market) => market.oracleKey === event.oracleKey)?.city} logo`}
                                width={20}
                                height={20}
                              />
                              <span>
                                {
                                  markets.find(
                                    (market) =>
                                      market.oracleKey === event.oracleKey,
                                  )?.city
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-thin">
                            <div className="flex items-center gap-2">
                              <Image
                                src={`/images/logo/${marketTypeIcons.get(markets.find((market) => market.oracleKey === event.oracleKey)!.type)}`}
                                alt={`${event.market} icon`}
                                width={20}
                                height={20}
                              />
                              <span>
                                {
                                  markets.find(
                                    (market) =>
                                      market.oracleKey === event.oracleKey,
                                  )?.type
                                }
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-thin text-[#FFFFFF]">
                            {formatGuess(
                              event.guess / 100,
                              markets.find(
                                (market) =>
                                  market.oracleKey === event.oracleKey,
                              )?.currency,
                            )}
                          </td>
                          <td className="px-6 py-4 font-thin text-[#FFFFFF]">
                            {event.long ? "Above" : "Below"}
                          </td>
                          <td
                            className={`px-6 py-4 font-bold ${event.won ? "text-zona-green" : "text-zona-red"}`}
                          >
                            {event.won ? "Win" : "Loss"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile view - hide on desktop */}
                  <div className="md:hidden space-y-4">
                    {events.map((event, index) => (
                      <div
                        key={index}
                        className="bg-[#000000] border border-[#222226] rounded-lg p-4 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] text-[#AFAFAF]">
                            Date
                          </span>
                          <span className="text-[12px] text-white">
                            {event.date}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[12px] text-[#AFAFAF]">
                            Market
                          </span>
                          <div className="flex items-center gap-2">
                            <Image
                              src={`${markets.find((market) => market.oracleKey === event.oracleKey)?.flag}`}
                              alt={`${markets.find((market) => market.oracleKey === event.oracleKey)?.city} logo`}
                              width={20}
                              height={20}
                            />
                            <span className="text-[12px] text-white">
                              {
                                markets.find(
                                  (market) =>
                                    market.oracleKey === event.oracleKey,
                                )?.city
                              }
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[12px] text-[#AFAFAF]">
                            Market Type
                          </span>
                          <div className="flex items-center gap-2">
                            <Image
                              src={`/images/logo/${marketTypeIcons.get(markets.find((market) => market.oracleKey === event.oracleKey)!.type)}`}
                              alt={`${event.market} icon`}
                              width={20}
                              height={20}
                            />
                            <span className="text-[12px] text-white">
                              {
                                markets.find(
                                  (market) =>
                                    market.oracleKey === event.oracleKey,
                                )?.type
                              }
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[12px] text-[#AFAFAF]">
                            Entry Value
                          </span>
                          <span className="text-[12px] text-white">
                            {formatGuess(
                              event.guess / 100,
                              markets.find(
                                (market) =>
                                  market.oracleKey === event.oracleKey,
                              )?.currency,
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[12px] text-[#AFAFAF]">
                            Direction
                          </span>
                          <span className="text-[12px] text-white">
                            {event.long ? "Above" : "Below"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[12px] text-[#AFAFAF]">
                            Result
                          </span>
                          <span
                            className={`text-[12px] font-bold ${event.won ? "text-zona-green" : "text-zona-red"}`}
                          >
                            {event.won ? "Win" : "Loss"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Layout>
    </Fragment>
  );
}
