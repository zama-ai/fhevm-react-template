import "../../../styles/mail-header.css";

import { Dispatch, SetStateAction } from "react";

import MailHeaderSearch from "./MailHeaderSearch";
import MailHeaderWallet from "./MailHeaderWallet";

type MailHeaderProps = {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
};

export default function MailHeader({
  searchValue,
  setSearchValue,
}: MailHeaderProps) {
  return (
    <div>
      <div className="mailHeaderTop">
        <MailHeaderSearch
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <MailHeaderWallet />
      </div>
    </div>
  );
}
