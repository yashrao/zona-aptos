import Layout from "@/components/layouts";
import useValueData from "@/data/values/valuedata";
import PublicIcon from "@mui/icons-material/Public";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import DropdownMenu from "@/organisms/dropdown-menu";

export default function Home() {
  const valueData = useValueData();

  return (
    <>
      <Layout title={"Home Page"}>
        {/* Offerings */}
        <div className="sm:flex gap-x-8">
          <div className="mt-10 rounded-2xl border border-white flex flex-col items-left justify-end px-6 pt-48 w-full">
            <div className="text-[48px] font-bold">April Trading Contest</div>
            <div className="my-4 flex items-center justify-between">
              <div className="">
                Join our trading contest, co-hosted with AssetDash!
              </div>
              <button className="rounded-2xl px-10 py-2 text-black border border-amber-600 text-amber-500 hover:text-white hover:bg-amber-500">
                View
              </button>
            </div>
          </div>
          <div className="mt-10 rounded-2xl border border-white flex flex-col items-left justify-end px-6 pt-48 w-full">
            <div className="text-[48px] font-bold">New Markets</div>
            <div className="my-4 flex items-center justify-between">
              <div className="">
                Hong Kong, Vietnam, and Korea now available to trade.
              </div>
              <button className="rounded-2xl px-10 py-2 border border-amber-600 text-amber-500 hover:text-white hover:bg-amber-500">
                View
              </button>
            </div>
          </div>
        </div>

        {/* Total Value Locked */}
        <div className="sm:flex sm:items-start mt-5 sm:gap-x-5 max-sm:px-2">
          {valueData.map((item: any) => {
            return (
              <>
                <div className="flex sm:items-center sm:justify-center sm:gap-x-2">
                  <div>{item.name}</div>
                  {item.icon && <div>{item.icon}</div>}
                  <div className="text-green-400">{item.value}</div>
                </div>
              </>
            );
          })}
        </div>

        {/* Explore Collections */}

        <div className="mt-10">
          <div className="text-[28px] font-semibold">Explore Collections</div>
          <div className="text-[18px] text-slate-500">
            Explore markets based on similar attributes.
          </div>
          <div className="flex max-sm:flex-col max-sm:items-center max-sm:justify-center gap-x-4 mt-8">
            <button className="flex items-center justify-left px-5 py-3 border border-green-600 rounded-xl bg-green-600 bg-opacity-20 hover:bg-opacity-50">
              <div className="rounded-full bg-green-300 w-[10px] h-[10px] mr-3" />
              Active Markets
            </button>
            <button className="flex items-center justify-left px-5 py-3">
              <PublicIcon style={{ marginRight: "12px" }} />
              Non-Trading Markets
            </button>
            <button className="flex items-center justify-left px-5 py-3">
              <ArrowOutwardIcon style={{ marginRight: "12px" }} />
              Top Gainers
            </button>
            <button className="flex items-center justify-left px-5 py-3">
              <SouthEastIcon style={{ marginRight: "12px" }} />
              Top Losers
            </button>
          </div>
        </div>

        {/* Trending Markets */}
        <div className="mt-10">
          <div className="text-[36px] font-semibold">Trending Markets</div>
          <div className="flex items-center justify-between">
            <div className="text-[18px] text-slate-500">
              Track market movements based on performance.
            </div>
            <DropdownMenu menuItems={["3 Months", "6 Months", "1 Year"]} />
          </div>
        </div>

        {/* Trending Up and Down */}
        <div className="mt-10 sm:flex gap-x-6">
          {/* Trending Up */}
          <div className="pl-4 w-full">
            <div className="flex items-center justify-between">
              <div className="text-[28px]">Trending Up</div>
              <button className="px-4 py-2 border border-white rounded-xl text-[12px] bg-slate-500 bg-opacity-40 hover:bg-opacity-80">
                View All
              </button>
            </div>
            <div className="h-[2px] w-full bg-white mt-4" />

            {/* Trending Up Data */}
            <div className="mt-5 mb-20">
              <div className="flex items-center w-full justify-between mb-8">
                <div className="max-sm:hidden">1</div>
                <div className="w-1/4 pl-4">
                  <span>Hong Kong</span>
                  <div className="flex items-center mt-1">
                    <div className="mr-2 text-[18px]">🇭🇰</div>Hong Kong
                  </div>
                </div>
                <div>Graph Here</div>
                <div className="text-left">
                  <div className="text-green-600 flex items-center">
                    <ArrowOutwardIcon style={{ marginRight: "1px" }} />
                    14.24%
                  </div>
                  <div className="mt-1 text-right">$69.69</div>
                </div>
              </div>

              {/* Data Point 2 */}
              <div className="flex items-center w-full justify-between">
                <div className="max-sm:hidden">2</div>
                <div className="w-1/4 pl-4">
                  <span>Korea</span>
                  <div className="flex items-center mt-1">
                    <div className="mr-2 text-[18px]">🇰🇷</div>Korea
                  </div>
                </div>
                <div>Graph Here</div>
                <div className="text-left">
                  <div className="text-green-600 flex items-center">
                    <ArrowOutwardIcon style={{ marginRight: "1px" }} />
                    14.24%
                  </div>
                  <div className="mt-1 text-right">$69.69</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Down */}
          <div className="pl-4 w-full">
            <div className="flex items-center justify-between">
              <div className="text-[28px]">Trending Down</div>
              <button className="px-4 py-2 border border-white rounded-xl text-[12px] bg-slate-500 bg-opacity-40 hover:bg-opacity-80">
                View All
              </button>
            </div>
            <div className="h-[2px] w-full bg-white mt-4" />

            {/* Trending Down Data */}
            <div className="mt-5 mb-20">
              <div className="flex items-center w-full justify-between mb-8">
                <div className="max-md:hidden">1</div>
                <div className="w-1/4 pl-4">
                  <span>Hong Kong</span>
                  <div className="flex items-center mt-1">
                    <div className="mr-2 text-[18px]">🇭🇰</div>Hong Kong
                  </div>
                </div>
                <div>Graph Here</div>
                <div className="text-left">
                  <div className="text-red-800 flex items-center">
                    <SouthEastIcon style={{ marginRight: "1px" }} />
                    14.24%
                  </div>
                  <div className="mt-1 text-right">$69.69</div>
                </div>
              </div>

              {/* Data Point 2 */}
              <div className="flex items-center w-full justify-between">
                <div className="max-md:hidden">2</div>
                <div className="w-1/4 pl-4">
                  <span>Korea</span>
                  <div className="flex items-center mt-1">
                    <div className="mr-2 text-[18px]">🇰🇷</div>Korea
                  </div>
                </div>
                <div>Graph Here</div>
                <div className="text-left">
                  <div className="text-red-800 flex items-center">
                    <SouthEastIcon style={{ marginRight: "1px" }} />
                    14.24%
                  </div>
                  <div className="mt-1 text-right">$69.69</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
