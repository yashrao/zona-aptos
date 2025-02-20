import { useConnectModal } from "@rainbow-me/rainbowkit"

export default function CustomConnect() {
  const { openConnectModal } = useConnectModal();

  return (
    <>
      <button
        type="button"
        className="px-3 py-3 md:px-4 md:py-3 bg-zona-green text-black font-bold rounded-xl hover:bg-black hover:text-zona-green hover:border-2 hover:border-zona-green transition-all duration-200 ease-in-out"
        onClick={openConnectModal}
      >
        Connect Wallet
      </button>
    </>
  )
}
