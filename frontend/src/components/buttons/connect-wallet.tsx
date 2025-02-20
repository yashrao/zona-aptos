import { FC, Fragment } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ConnectWalletButton: FC = () => {
  return (
    <Fragment>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="bg-interactive-button text-interactive-button border-zona-green border-[2px] rounded-interactive-button px-10 py-2 text-[18px] hover:bg-interactive-button-hover hover:text-interactive-button-hover transition-interactive-button duration-interactive-button ease-interactive-button mt-20"
                      style={{ fontFamily: "var(--rk-fonts-body)" }}
                    >
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button onClick={openChainModal} type="button">
                      Wrong network
                    </button>
                  );
                }

                return (
                  <div
                    className="bg-interactive-button text-interactive-button border-zona-green border-[2px] rounded-interactive-button px-10 py-2 text-[18px] hover:bg-interactive-button-hover hover:text-interactive-button-hover transition-interactive-button duration-interactive-button ease-interactive-button mt-20"
                    style={{
                      display: "flex",
                      gap: 12,
                    }}
                  >
                    <button
                      onClick={openChainModal}
                      style={{ display: "flex", alignItems: "center" }}
                      type="button"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: "hidden",
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button onClick={openAccountModal} type="button">
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ""}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </Fragment>
  );
};

export default ConnectWalletButton;
