import { FC, useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import ExpandMoreSharpIcon from "@mui/icons-material/ExpandMoreSharp";

interface TradingPageDropdownListProps {
  cities: Array<{ city: string; code: string; flag: string }>;
  currentCity: string;
  setCity: (city: string) => void;
}

const TradingPageDropdownList: FC<TradingPageDropdownListProps> = ({ cities, currentCity, setCity }) => {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="flex items-center">
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
            <Menu.Items className="absolute overflow-hidden left-[-150px] mt-4 z-10 w-60 sm:w-64 origin-top-right bg-black backdrop-blur-sm rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border-white border-2">
              <div className="">
                {cities.map((item) => (
                  <Menu.Item key={item.code}>
                    {({ active }) => (
                      <button
                        className={`text-white py-2 block text-center text-[18px] w-full ${
                          active ? 'bg-zona-green' : ''
                        } ${currentCity === item.city ? 'bg-gray-700' : ''}`}
                        onClick={() => setCity(item.city)}
                      >
                        {item.city}
                      </button>
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

export default TradingPageDropdownList;