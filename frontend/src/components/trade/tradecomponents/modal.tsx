import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, SetStateAction } from "react";
import CloseIcon from "@mui/icons-material/Close";

interface TradeModalProps {
  openModal: boolean;
  setOpen: SetStateAction<any>;
  modalTitle: string | ReactNode;
  children?: ReactNode;
  fullScreen?: boolean;
  hasCloseButton?: boolean;
  hasFixedButtonPanel?: boolean;
  buttonInPanel?: ReactNode;
  className?: string;
}

export default function Modal({
  openModal,
  setOpen,
  children,
  modalTitle,
  fullScreen = false,
  hasCloseButton = false,
  hasFixedButtonPanel = false,
  buttonInPanel,
}: TradeModalProps) {
  return (
    <Transition.Root as={Fragment} show={openModal}>
      <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => {
            // Only close if clicking outside the modal content
            setOpen(false);
          }}
        >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className={`flex items-center justify-center text-center ${
              fullScreen ? "sm:min-h-full" : "h-full"
            } sm:items-center sm:p-0`}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative ${
                  fullScreen && "h-screen w-full sm:h-[75vh] sm:w-[80%]"
                } z-50 overflow-y-auto bg-[#0F1216] text-left shadow-xl transition-all rounded-lg min-h-[350px] w-3/4 lg:w-1/3 scrollbar-hide`}
                onClick={(e) => e.stopPropagation()}
              >
                {hasCloseButton && (
                  <>
                    <div
                      className={`sticky top-0 z-10 flex ${
                        fullScreen ? "w-full" : ""
                      } items-center justify-between px-6 py-4 bg-[#0F1216]`}
                    >
                      <div className="w-full text-[15px] font-bold leading-[150%]">
                        {modalTitle}
                      </div>
                      <button
                        className="p-2 rounded-[4px] hover:bg-slate-600 text-white focus:ring-0 focus:outline-none focus:border-none bg-[#222226]"
                        type="button"
                        onClick={() => setOpen(false)}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    <hr className="bg-[#222226] h-[0.5px] border-0" />
                  </>
                )}

                <div className="p-[20px] sm:mb-0 overflow-y-auto scrollbar-hide">
                  {/* CONTENT */}
                  {children}
                  {/* ACTIONS */}
                  {hasFixedButtonPanel && (
                    <div
                      className={`ml-auto flex items-center ${
                        fullScreen ? "w-full" : ""
                      }`}
                    >
                      <div className="ml-auto" />
                      <button
                        className="text-[#8E96A4] focus:ring-0 focus:outline-none focus:border-none"
                        type="button"
                        onClick={() => setOpen(false)}
                      >
                        Close
                      </button>
                      {buttonInPanel}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}