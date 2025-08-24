import "@/styles/mail-header-wallet.css";

import { useRouter } from "next/navigation";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

export default function MailHeaderWallet() {
  const { push } = useRouter();
  const { acount, disconnect } = useMetaMaskEthersSigner();

  const copyValueToClipboard = async () => {
    await navigator.clipboard.writeText(acount ?? "");
  };

  const onDisconnect = (): void => {
    disconnect();
    push("/");
  };

  return (
    <div className="wallet-info">
      <div className="wallet-info-address">
        {acount
          ? acount?.substring(0, 4) + "..." + acount?.slice(-4)
          : "Not connected"}
      </div>

      <div className="modal">
        <div className="top">
          <div className="img">
            <img src="wallet-image.svg" width={26} alt="Wallet Logo" />
          </div>
          <div className="text">
            <div className="flex items-center gap-2">
              <span>MetaMask</span>
              <img src="metamask.svg" width={26} alt="MetaMask Icon" />
            </div>
            <div className="netWork">Zama</div>
          </div>
        </div>

        <div className="address">
          <div>Default Address</div>
          <div
            onClick={() => copyValueToClipboard()}
            className="cursor-pointer flex items-center gap-2"
          >
            <div>{acount?.substring(0, 10) + "..." + acount?.slice(-10)}</div>
            <i className="fa fa-copy" />
          </div>
        </div>

        <div className="domain">
          <div>
            NFT: <span>Coming soon</span>
          </div>
        </div>
        <div className="domain">
          <div>
            GameFi: <span>Coming soon</span>
          </div>
        </div>
        <div className="domain">
          <div>
            Faucet:{" "}
            <a
              href="https://www.alchemy.com/faucets/ethereum-sepolia"
              target="_blank"
            >
              Target
            </a>
          </div>
        </div>

        <div className="bottom">
          <div className="logout cursor-pointer" onClick={onDisconnect}>
            Logout
          </div>
        </div>
      </div>
    </div>
  );
}
