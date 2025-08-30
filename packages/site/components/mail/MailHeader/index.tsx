import "@/styles/mail-header.css";

import { Dispatch, SetStateAction } from "react";
import { TabIndex } from "@/constants";
import { Mail, Box } from "@/types";
import MailHeaderSearch from "./MailHeaderSearch";
import MailHeaderWallet from "./MailHeaderWallet";
import MailHeaderBulkActions from "./MailHeaderBulkActions";

export type MailHeaderProps = {
  activeTab: TabIndex;
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  isSelecting: boolean;
  setIsSelecting: Dispatch<SetStateAction<boolean>>;
  threadMails: Mail[];
  setActiveMail: Dispatch<SetStateAction<Mail | null>>;
  selectedMailIds: number[];
  setSelectedMailIds: Dispatch<SetStateAction<number[]>>;
  mailIds: number[];
  setIsReplying: Dispatch<SetStateAction<boolean>>;
  setIsForwarding: Dispatch<SetStateAction<boolean>>;
  setThreadMails: Dispatch<SetStateAction<Mail[]>>;
  bulkActionType: Box | null;
  setBulkActionType: (value: Box | null) => void;
  moveMails: (mailIds: number[], type: Box | null) => void | Promise<void>;
};

export default function MailHeader({
  activeTab,
  searchValue,
  setSearchValue,
  isSelecting,
  setIsSelecting,
  threadMails,
  setThreadMails,
  setActiveMail,
  mailIds,
  selectedMailIds,
  setSelectedMailIds,
  setIsReplying,
  setIsForwarding,
  bulkActionType,
  setBulkActionType,
  moveMails,
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

      <div className="mailHeaderBottom">
        <MailHeaderBulkActions
          activeTab={activeTab}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
          threadMails={threadMails}
          setActiveMail={setActiveMail}
          setIsReplying={setIsReplying}
          setIsForwarding={setIsForwarding}
          selectedMailIds={selectedMailIds}
          setSelectedMailIds={setSelectedMailIds}
          mailIds={mailIds}
          bulkActionType={bulkActionType}
          setBulkActionType={setBulkActionType}
          moveMails={moveMails}
          setThreadMails={setThreadMails}
        />
      </div>
    </div>
  );
}
