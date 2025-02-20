import { FC, useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import ExpandMoreSharpIcon from "@mui/icons-material/ExpandMoreSharp";
import Image from 'next/image';

interface DropdownListProps {
  setGraphLocation: (location: string) => void;
}

const markets = [
  { city: "Hong Kong", code: "HKG", flag: "/images/logo/zona_hk_logo.svg" },
  { city: "Singapore", code: "SG", flag: "/images/logo/zona_sg_logo.svg" },
  { city: "Dubai", code: "DB", flag: "/images/logo/zona_db_logo.svg" },
  { city: "Sydney", code: "SYD", flag: "/images/logo/zona_aus_logo.svg" },
  { city: "Melbourne", code: "MLB", flag: "/images/logo/zona_aus_logo.svg" },
  { city: "London", code: "LDN", flag: "/images/logo/zona_uk_logo.svg" }, // Add this line
  { city: "Brisbane", code: "BRB", flag: "/images/logo/zona_aus_logo.svg" }, // Add this line
  { city: "Adelaide", code: "ADL", flag: "/images/logo/zona_aus_logo.svg" }, // Add this line
];

const DropdownList: FC<DropdownListProps> = ({ setGraphLocation }) => {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);


  
  return (
    <>
      {isClient && (
        <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="">
          <ExpandMoreSharpIcon style={{ width: "36px", height: "36px" }} />
        </Menu.Button>

          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute overflow-hidden right-0 mt-4 z-10 w-60 sm:w-64 origin-top-right bg-[#0F1216] backdrop-blur-sm rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border-[#222226] border-0.5">
              <div className="">
                {markets.map((market) => (
                  <Menu.Item key={market.city}>
                    {() => (
                      <div
                        className="flex items-center text-white py-2 px-4 text-[18px] hover:font-extrabold hover:text-[#222226] hover:bg-zona-green"
                        onClick={() => setGraphLocation(market.city)}
                      >
                        <Image
                          src={market.flag}
                          alt={`${market.city} flag`}
                          width={24}
                          height={24}
                          className="mr-2"
                        />
                        {market.city}
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </>
  );
};


export default DropdownList;
