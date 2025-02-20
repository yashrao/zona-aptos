import { FC, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface DropdownMenuProps {
  menuItems: Array<String>;
}

const DropdownMenu: FC<DropdownMenuProps> = ({ menuItems = [] }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex w-full items-center justify-center gap-x-1.5 rounded-md text-white px-10 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Options
          <ExpandMoreIcon
            style={{
              marginRight: "-4px",
              height: "25px",
              width: "25px",
              color: "white",
            }}
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-full bg-gray-100 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {menuItems.map((item: any, index: any) => {
              return (
                <Menu.Item key={`${item}-${index}`}>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-100 text-black" : "text-black",
                        "block px-4 py-2 text-sm"
                      )}
                    >
                      {item}
                    </a>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DropdownMenu;
