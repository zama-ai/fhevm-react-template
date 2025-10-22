import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { Address, getAddress } from "viem";
import { useDisconnect } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { ArrowsRightLeftIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/helper";
import { useOutsideClick } from "~~/hooks/helper";
import { getTargetNetworks } from "~~/utils/helper";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  displayName: string;
  ensAvatar?: string;
  blockExplorerAddressLink?: string;
};

export const AddressInfoDropdown = ({ address, ensAvatar, displayName }: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };

  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md dropdown-toggle gap-0 h-auto!">
          <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
          <span className="ml-2 mr-1">{displayName}</span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
        </summary>
        <ul className="dropdown-content menu z-2 p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1">
          <NetworkOptions hidden={!selectingNetwork} />
          {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="h-8 btn-sm rounded-xl! flex gap-3 py-3"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true);
                }}
              >
                <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span>
              </button>
            </li>
          ) : null}
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-error h-8 btn-sm rounded-xl! flex gap-3 py-3"
              type="button"
              onClick={() => disconnect()}
            >
              <ArrowLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
