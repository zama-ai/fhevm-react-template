import "../../../styles/mail-header.css";

import { Dispatch, SetStateAction } from "react";
import { TabIndex } from "../../../constants";
import { LoadingBarRef } from "../../MailApp";
import MailHeaderSearch from "./MailHeaderSearch";
import MailHeaderWallet from "./MailHeaderWallet";
import MailHeaderBulkActions from "./MailHeaderBulkActions";

export type MailHeaderProps = {
  activeTab: TabIndex;
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  isSelecting: boolean;
  setIsSelecting: Dispatch<SetStateAction<boolean>>;
  activeMailId: string | null;
  setActiveMailId: Dispatch<SetStateAction<string | null>>;
  selectedMailIds: string[];
  setSelectedMailIds: Dispatch<SetStateAction<string[]>>;
  isReplying: boolean;
  setIsReplying: Dispatch<SetStateAction<boolean>>;
  isForwarding: boolean;
  setIsForwarding: Dispatch<SetStateAction<boolean>>;
  bulkActionType: string;
  setBulkActionType: Dispatch<SetStateAction<string>>;
  executeBulkAction: () => void | Promise<void>;
  loadingBarRef: LoadingBarRef;
};

export default function MailHeader({
  activeTab,
  searchValue,
  setSearchValue,
  isSelecting,
  setIsSelecting,
  activeMailId,
  setActiveMailId,
  selectedMailIds,
  setSelectedMailIds,
  isReplying,
  setIsReplying,
  isForwarding,
  setIsForwarding,
  bulkActionType,
  setBulkActionType,
  executeBulkAction,
  loadingBarRef,
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
          isReplying={isReplying}
          setIsReplying={setIsReplying}
          isForwarding={isForwarding}
          setIsForwarding={setIsForwarding}
          selectedMailIds={selectedMailIds}
          setSelectedMailIds={setSelectedMailIds}
          bulkActionType={bulkActionType}
          setBulkActionType={setBulkActionType}
          executeBulkAction={executeBulkAction}
          loadingBarRef={loadingBarRef}
        />
      </div>
    </div>
  );
}
