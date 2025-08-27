import "@/styles/mail-header.css";

import { Dispatch, SetStateAction } from "react";
import { TabIndex } from "@/constants";
import MailHeaderSearch from "./MailHeaderSearch";
import MailHeaderWallet from "./MailHeaderWallet";
import MailHeaderBulkActions from "./MailHeaderBulkActions";

export type MailHeaderProps = {
  activeTab: TabIndex;
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  isSelecting: boolean;
  setIsSelecting: Dispatch<SetStateAction<boolean>>;
  activeMailId: number | null;
  setActiveMailId: Dispatch<SetStateAction<number | null>>;
  selectedMailIds: number[];
  setSelectedMailIds: Dispatch<SetStateAction<number[]>>;
  mailIds: number[];
  setIsReplying: Dispatch<SetStateAction<boolean>>;
  setIsForwarding: Dispatch<SetStateAction<boolean>>;
  bulkActionType: string;
  setBulkActionType: Dispatch<SetStateAction<string>>;
  executeBulkAction: () => void | Promise<void>;
};

export default function MailHeader({
  activeTab,
  searchValue,
  setSearchValue,
  isSelecting,
  setIsSelecting,
  activeMailId,
  setActiveMailId,
  mailIds,
  selectedMailIds,
  setSelectedMailIds,
  setIsReplying,
  setIsForwarding,
  bulkActionType,
  setBulkActionType,
  executeBulkAction,
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
          activeMailId={activeMailId}
          setActiveMailId={setActiveMailId}
          setIsReplying={setIsReplying}
          setIsForwarding={setIsForwarding}
          selectedMailIds={selectedMailIds}
          setSelectedMailIds={setSelectedMailIds}
          mailIds={mailIds}
          bulkActionType={bulkActionType}
          setBulkActionType={setBulkActionType}
          executeBulkAction={executeBulkAction}
        />
      </div>
    </div>
  );
}
