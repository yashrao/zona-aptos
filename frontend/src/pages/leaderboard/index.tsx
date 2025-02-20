import React, { useState, useMemo, useEffect } from "react";
import Layout from "@/components/layouts";
import Image from "next/image";
import { getContracts } from "@/contract/contracts";
import { markets } from "@/components/utils/mappings";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Loading from "@/components/loading";
import CustomConnect from "@/components/buttons/CustomConnect";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

import { fetchRanks, fetchRank, Player } from "@/components/utils/fetchRanks";

// Used for the call to the contract @ master
interface PlayerCall {
  address: string;
  abi: any;
}

function getValidCityIndentifiers(markets: any[]): string[] {
  const ret: string[] = [];
  markets.forEach((market) => {
    ret.push(market.identifier);
  });
  return ret;
}

const Leaderboard: React.FC = () => {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [leaderboardData, setLeaderBoardData] = useState<Player[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [userRecord, setUserRecord] = useState<Player | undefined>(undefined);
  const validCityIdentifiers = getValidCityIndentifiers(markets);
  const [isFetched, setIsFetched] = useState(false);
  const { openConnectModal } = useConnectModal();
  const contracts = getContracts(undefined);
  const { account: userAddress, connected: isConnected } = useWallet();

  const [playerRanks, setPlayerRanks] = useState<Player[]>([]);
  const [isRanksLoading, setIsRanksLoading] = useState(true);
  const [playerRank, setPlayerRank] = useState<Player | undefined>(undefined);

  // Fetch ranks and user rank
  useEffect(() => {
    const fetchData = async () => {
      setIsRanksLoading(true);
      try {
        if (playerRanks.length == 0) {
          const { data: ranks } = await fetchRanks();
          setPlayerRanks(ranks || []);
        }

        //if (isConnected && userAddress) {
        //  const { data: rank } = await fetchRank(userAddress);
        //  setPlayerRank(rank);
        //}
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsRanksLoading(false);
      }
    };

    fetchData();
  }, [isConnected, userAddress]);

  useEffect(() => {
    if (!isRanksLoading && isConnected && playerRanks.length !== 0) {
      setUserRecord(playerRank);
    }
  }, [isConnected, isRanksLoading, playerRank, playerRanks.length]);

  function getIcon(city: string): string | undefined {
    return markets.find((market) => {
      return market.city === city;
    })?.flag;
  }

  function getCityName(identifier: string) {
    return markets.find((market) => {
      return market.identifier === identifier;
    })?.city;
  }

  function getIconIdentifier(identifier: string): string | undefined {
    return markets.find((market) => {
      return market.identifier === identifier;
    })?.flag;
  }

  // The leaderboard data can be sorted, but will display the static rank
  const finalLeaderboardData = leaderboardData;

  const toggleSort = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  // Market type icon mapping
  const marketTypeIcons: { [key: string]: string } = {
    "Real Estate": "rei_icon.svg",
    "Air Quality": "aqi_icon.svg",
  };

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    return total ? Math.round((wins / total) * 100) : 0;
  };

  const formatAddress = (address: string | undefined): string => {
    if (address == undefined) {
      return "";
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Layout title="Leaderboard" button={true} app={true}>
      <div className="flex flex-col items-center min-h-screen">
        {/* Header Container - sticky on desktop */}
        <div className="relative md:fixed md:top-[50px] md:left-0 md:right-0 md:bg-black md:z-10 w-full">
          <div className="flex flex-col items-center p-2 md:p-0 mt-[52px] md:mt-0">
            {/* Title Section */}
            <h1 className="text-[50px] md:text-[80px] font-medium text-white -mb-3">
              Leaderboard
            </h1>
            <p className="text-[14px] md:text-base text-[#AFAFAF] font-light mb-4 md:mb-6 text-center px-4">
              Find out where you stand amongst Zona's best
            </p>

            {/* User Stats Card */}
            <div className="w-full max-w-7xl rounded-lg p-2 md:p-6 mb-2 md:mb-8">

              {/* Desktop view - hide on mobile */}
              <div className="hidden md:block w-full">
                {userRecord && isConnected ? (
                  <div className="flex justify-center">
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns:
                          "80px 200px 200px 200px 100px 100px",
                        width: "fit-content",
                      }}
                    >
                      {/* Rank */}
                      <div className="flex flex-col">
                        <div className="text-[#AFAFAF] text-[12px] md:text-base font-thin mb-1">
                          Rank
                        </div>
                        <div className="text-zona-green text-[12px] md:text-base font-bold">
                          {userRecord.rank}
                        </div>
                      </div>
                      {/* Address */}
                      <div className="flex flex-col">
                        <div className="text-[#AFAFAF] text-[12px] md:text-base font-thin mb-1">
                          Address
                        </div>
                        <div className="text-zona-green text-[12px] md:text-base font-bold truncate">
                          {formatAddress(userRecord.address)}
                        </div>
                      </div>
                      {/* Favorite City */}
                      <div className="flex flex-col">
                        <div className="text-[#AFAFAF] text-[12px] md:text-base font-thin mb-1">
                          Favorite City
                        </div>
                        <div className="flex items-center gap-2">
                          {userRecord.favoriteCity &&
                            getIconIdentifier(userRecord.favoriteCity) && (
                              <Image
                                src={
                                  getIconIdentifier(userRecord.favoriteCity)!
                                }
                                alt={userRecord.favoriteCity}
                                width={24}
                                height={24}
                              />
                            )}
                          <span className="text-white text-[12px] md:text-base">
                            {getCityName(userRecord.favoriteCity)}
                          </span>
                        </div>
                      </div>
                      {/* Favorite Market */}
                      <div className="flex flex-col">
                        <div className="text-[#AFAFAF] text-[12px] md:text-base font-thin mb-1">
                          Favorite Market
                        </div>
                        <div className="flex items-center gap-2">
                          <Image
                            src={`/images/logo/${userRecord.favoriteMarket ? marketTypeIcons[userRecord.favoriteMarket] : "default.png"}`}
                            alt={
                              userRecord.favoriteMarket
                                ? userRecord.favoriteMarket
                                : ""
                            }
                            width={24}
                            height={24}
                          />
                          <span className="text-white text-[12px] md:text-base">
                            {userRecord.favoriteMarket}
                          </span>
                        </div>
                      </div>
                      {/* W|L */}
                      <div className="flex flex-col">
                        <div className="text-[#AFAFAF] text-[12px] md:text-base font-thin text-left">
                          W&L
                        </div>
                        <div className="text-left">
                          <span className="text-zona-green text-[12px] md:text-base">
                            {userRecord.wins}
                          </span>
                          <span className="text-[#AFAFAF] text-[12px] md:text-base">
                            |
                          </span>
                          <span className="text-zona-red text-[12px] md:text-base">
                            {userRecord.losses}
                          </span>
                        </div>
                      </div>
                      {/* Win Rate */}
                      <div className="flex flex-col">
                        <div className="text-[#AFAFAF] text-[12px] md:text-base font-thin text-right">
                          Win Rate
                        </div>
                        <div className="text-zona-green text-[12px] md:text-base text-right">{`${calculateWinRate(userRecord.wins, userRecord.losses)}%`}</div>
                      </div>
                    </div>
                  </div>
                ) : !isConnected ? (
                  <div className="flex justify-center items-center py-0">
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-0"></div>
                )}
              </div>

              <div className="block md:hidden">
                {userRecord ? (
                  <div className="bg-[#000000] border border-[#222226] rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">Rank</span>
                      <span className="text-[12px] text-white">
                        {userRecord.rank}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">
                        Address
                      </span>
                      <span className="text-[12px] text-white">
                        {formatAddress(userRecord.address)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">
                        Favorite City
                      </span>
                      <div className="flex items-center gap-2">
                        {userRecord.favoriteCity &&
                          getIconIdentifier(userRecord.favoriteCity) && (
                            <Image
                              src={getIconIdentifier(userRecord.favoriteCity)!}
                              alt={userRecord.favoriteCity}
                              width={20}
                              height={20}
                            />
                          )}
                        <span className="text-[12px] text-white">
                          {getCityName(userRecord.favoriteCity)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">
                        Favorite Market
                      </span>
                      <div className="flex items-center gap-2">
                        <Image
                          src={`/images/logo/${userRecord.favoriteMarket ? marketTypeIcons[userRecord.favoriteMarket] : "default.png"}`}
                          alt={
                            userRecord.favoriteMarket
                              ? marketTypeIcons[userRecord.favoriteMarket]
                              : "default.png"
                          }
                          width={20}
                          height={20}
                        />
                        <span className="text-[12px] text-white">
                          {userRecord.favoriteMarket}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">W&L</span>
                      <div>
                        <span className="text-[12px] text-zona-green">
                          {userRecord.wins}
                        </span>
                        <span className="text-[12px] text-[#AFAFAF]">|</span>
                        <span className="text-[12px] text-zona-red">
                          {userRecord.losses}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#AFAFAF]">
                        Win Rate
                      </span>
                      <span className="text-[12px] text-zona-green">{`${calculateWinRate(userRecord.wins, userRecord.losses)}%`}</span>
                    </div>
                  </div>
                ) : (
                  <div >
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Container - starts after sticky header on desktop */}
        <div className="w-full md:mt-[500px]">
          {/* Global Leaderboard title for desktop */}
          <div className="hidden md:block w-full max-w-7xl mx-auto text-center border-t border-[#222226] pt-6">
            <div className="text-[#FFFFFF] text-lg md:text-lg mb-4">
              Global Leaderboard
            </div>
          </div>

          {/* Mobile-only Global Leaderboard title */}
          <div className="md:hidden w-full text-center border-t border-[#222226] pt-6">
            <div className="text-[#FFFFFF] text-lg mb-4">
              Global Leaderboard
            </div>
          </div>

          {/* Scrollable Content Section */}
          <div className="flex justify-center items-center w-full max-w-7xl mx-auto overflow-x-auto px-8">
            {isRanksLoading ? (
              <Loading isMobile={false} />
            ) : (
              <>
                {/* Desktop view - hide on mobile */}
                <table className="w-full text-white hidden md:table">
                  <thead className="bg-[#000000]">
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-3 text-[#AFAFAF] text-[12px] md:text-base font-thin text-left bg-[#000000]">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-[#AFAFAF] text-[12px] md:text-base font-thin text-left bg-[#000000]">
                        Address
                      </th>
                      <th className="px-6 py-3 text-[#AFAFAF] text-[12px] md:text-base font-thin text-left bg-[#000000]">
                        Favorite City
                      </th>
                      <th className="px-6 py-3 text-[#AFAFAF] text-[12px] md:text-base font-thin text-left bg-[#000000]">
                        Favorite Market
                      </th>
                      <th
                        onClick={toggleSort}
                        className="px-6 py-3 text-[#AFAFAF] text-[12px] md:text-base font-thin text-center cursor-pointer hover:text-white transition-colors duration-200 flex items-center justify-center gap-1 bg-[#000000]"
                      >
                        W&L
                        <span className="text-xs">
                          {sortDirection === "desc" ? "↓" : "↑"}
                        </span>
                      </th>
                      <th className="px-6 py-3 text-[#AFAFAF] text-[12px] md:text-base font-thin text-right bg-[#000000]">
                        Win Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerRanks.map((row: Player, index: number) => (
                      <tr
                        key={`${row.rank}-${index}`}
                        className="border-b border-[#222226] bg-[#000000] hover:bg-[#0F1216] transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-[12px] md:text-base font-thin">
                          {row.rank}
                        </td>
                        <td className="px-6 py-4 text-[12px] md:text-base font-thin">
                          {row.address}
                        </td>
                        <td className="px-6 py-4 text-[12px] md:text-base font-thin">
                          <div className="flex items-center gap-2">
                            {row.favoriteCity &&
                              getIconIdentifier(row.favoriteCity) && (
                                <Image
                                  src={getIconIdentifier(row.favoriteCity)!}
                                  alt={row.favoriteCity}
                                  width={30}
                                  height={30}
                                />
                              )}
                            <span>{getCityName(row.favoriteCity)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[12px] md:text-base font-thin">
                          <div className="flex items-center gap-2">
                            <Image
                              src={`/images/logo/${row.favoriteMarket ? marketTypeIcons[row.favoriteMarket] : ""}`}
                              alt={row.favoriteMarket ? row.favoriteMarket : ""}
                              width={30}
                              height={30}
                            />
                            <span>{row.favoriteMarket}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[12px] md:text-base text-center items-center">
                          <span className="text-zona-green">{row.wins}</span>
                          <span className="text-[#AFAFAF] text-[12px] md:text-base">
                            |
                          </span>
                          <span className="text-zona-red text-[12px] md:text-base">
                            {row.losses}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[12px] md:text-base text-right">
                          {`${calculateWinRate(row.wins, row.losses)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile view - hide on desktop */}
                <div className="md:hidden space-y-4 w-full">
                  {playerRanks?.map((row, index) => (
                    <div
                      key={`${row.rank}-${index}`}
                      className="bg-[#000000] border border-[#222226] rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[12px] text-[#AFAFAF]">Rank</span>
                        <span className="text-[12px] text-white">
                          {row.rank}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#AFAFAF]">
                          Address
                        </span>
                        <span className="text-[12px] text-white">
                          {formatAddress(row.address)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#AFAFAF]">
                          Favorite City
                        </span>
                        <div className="flex items-center gap-2">
                          {row.favoriteCity &&
                            getIconIdentifier(row.favoriteCity) && (
                              <Image
                                src={getIconIdentifier(row.favoriteCity)!}
                                alt={row.favoriteCity}
                                width={20}
                                height={20}
                              />
                            )}
                          <span className="text-[12px] text-white">
                            {getCityName(row.favoriteCity)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#AFAFAF]">
                          Favorite Market
                        </span>
                        <div className="flex items-center gap-2">
                          <Image
                            src={`/images/logo/${row.favoriteMarket ? marketTypeIcons[row.favoriteMarket] : ""}`}
                            alt={row.favoriteMarket ? row.favoriteMarket : ""}
                            width={20}
                            height={20}
                          />
                          <span className="text-[12px] text-white">
                            {row.favoriteMarket}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#AFAFAF]">W&L</span>
                        <div>
                          <span className="text-[12px] text-zona-green">
                            {row.wins}
                          </span>
                          <span className="text-[12px] text-[#AFAFAF]">|</span>
                          <span className="text-[12px] text-zona-red">
                            {row.losses}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#AFAFAF]">
                          Win Rate
                        </span>
                        <span className="text-[12px] text-zona-green">{`${calculateWinRate(row.wins, row.losses)}%`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
