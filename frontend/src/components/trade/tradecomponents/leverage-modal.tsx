import Modal from "@/components/trade/tradecomponents/modal";
import { SetStateAction } from "react";

interface LeverageModalProps {
  shortSelected: boolean;
  openModal: boolean;
  setOpen: (open: boolean) => void;
  leverage: number;
  leverageSliderChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LeverageModal({
  shortSelected,
  openModal,
  setOpen,
  leverage,
  leverageSliderChange,
}: LeverageModalProps) {
  const handleButtonClick = () => {
    setOpen(false); // Close the modal
  };

  const color = shortSelected ? "zona-red" : "zona-green";
  const bgColor = shortSelected ? "#D8515F" : "#23F98A";

  return (
    <>
      <Modal
        openModal={openModal}
        setOpen={setOpen}
        hasCloseButton
        modalTitle={<span style={{ color: "#AFAFAF", fontWeight: "300" }}>Select Leverage</span>}
        className="border-b-[0.5px] border-[#AFAFAF]"
      >
        <div className="relative">
          <div className="flex items-center justify-center">
            <h1 className={`text-[70px] font-bold text-${color}`}>
              {leverage}x
            </h1>
          </div>
          <div className="relative flex items-center justify-center px-6 py-4">
            <div className="absolute top-[14px] w-full">
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={leverage}
                onChange={leverageSliderChange}
                className={`w-full h-3 rounded-2xl accent-${color} appearance-none bg-${color} cursor-pointer
                           [&::-webkit-slider-runnable-track]:rounded-full
                           [&::-webkit-slider-runnable-track]:bg-transparent
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:h-[25px]
                           [&::-webkit-slider-thumb]:w-[25px]
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-white
                `}
                style={{
                  background: `linear-gradient(to right, ${bgColor} ${(leverage * 5) - 1}%, #222226 ${(leverage * 5) - 1}%)`
                }}
              />
            </div>
          </div>

          <div className="w-full mt-16">
            <button
              type="button"
              onClick={handleButtonClick}
              className={`p-4 rounded-lg w-full font-bold 
                         border-2 border-solid
                         transition-all duration-300 ease-in-out`}
              style={{ 
                backgroundColor: bgColor,
                borderColor: bgColor,
                color: 'black'
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.backgroundColor = 'transparent';
                btn.style.color = bgColor;
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.backgroundColor = bgColor;
                btn.style.color = 'black';
              }}
            >
              Select
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}