import React from "react";
import "@/styles/mail-header-bulk-actions.css";
import { TAB_INDEXES, TabIndex } from "@/constants";
import { Mail, Box } from "@/types";

type BulkIconProps = {
  name: string;
  flag: Box;
  activeTab: TabIndex;
  bulkActionType: Box | null;
  setBulkActionType: (flag: Box) => void;
};

const BulkIcon: React.FC<BulkIconProps> = ({
  name,
  flag,
  bulkActionType,
  setBulkActionType,
  activeTab,
}) => {
  const handleClick = () => {
    if (activeTab !== TAB_INDEXES.TRASH) setBulkActionType(flag);
  };

  return (
    <span
      className="material-symbols-outlined"
      onClick={handleClick}
      style={{ color: bulkActionType === flag ? "rgb(254, 210, 24)" : "gray" }}
    >
      {name}
    </span>
  );
};

export type HeaderBulkActionsProps = {
  activeTab: TabIndex;
  isSelecting: boolean;
  setIsSelecting: (value: boolean) => void;
  threadMails: Mail[];
  setThreadMails: (value: Mail[]) => void;
  setActiveMail: (value: Mail | null) => void;
  setIsReplying: (value: boolean) => void;
  setIsForwarding: (value: boolean) => void;
  selectedMailIds: number[];
  setSelectedMailIds: (ids: number[]) => void;
  mailIds: number[];
  bulkActionType: Box | null;
  setBulkActionType: (value: Box | null) => void;
  moveMails: (mailIds: number[], type: Box | null) => void | Promise<void>;
};

export default function HeaderBulkActions({
  activeTab,
  isSelecting,
  setIsSelecting,
  threadMails,
  setActiveMail,
  setIsReplying,
  setIsForwarding,
  selectedMailIds,
  setSelectedMailIds,
  mailIds,
  bulkActionType,
  setBulkActionType,
  moveMails,
  setThreadMails,
}: HeaderBulkActionsProps) {
  const handleBackClick = () => {
    setIsSelecting(false);
    setActiveMail(null);
    setIsReplying(false);
    setIsForwarding(false);
    setSelectedMailIds([]);
    setThreadMails([]);
    setBulkActionType(null)
  };

  const handleCheckboxClick = (): void => {
    setIsSelecting(!isSelecting);
    if (isSelecting) setBulkActionType(null);
    if (selectedMailIds.length === 0) setSelectedMailIds(mailIds);
    else setSelectedMailIds([]);
  };

  const executeBulkAction = async (): Promise<void> => {
    if (bulkActionType !== null) {
      await moveMails(selectedMailIds, bulkActionType);
      handleBackClick()
    }
  };

  return (
    <div className={`header-tools-row ${activeTab === TAB_INDEXES.TRASH ? "disabled-action" : ""}`}>
      {threadMails?.length > 0 ? (
        <span className="material-symbols-outlined" onClick={handleBackClick}>
          arrow_back
        </span>
      ) : (
        <span
          style={{ color: isSelecting ? "rgb(254,210,24)" : "" }}
          className="material-symbols-outlined delete-icon"
          onClick={handleCheckboxClick}
        >
          {isSelecting ? "check_box" : "check_box_outline_blank"}
        </span>
      )}

      <div className="tool-box-selection">
        <BulkIcon
          name="archive"
          flag={Box.ARCHIVE}
          {...{ bulkActionType, setBulkActionType, activeTab }}
        />
        <BulkIcon
          name="star"
          flag={Box.STAR}
          {...{ bulkActionType, setBulkActionType, activeTab }}
        />
        <BulkIcon
          name="report"
          flag={Box.SPAM}
          {...{ bulkActionType, setBulkActionType, activeTab }}
        />
        <BulkIcon
          name="mark_email_read"
          flag={Box.READ}
          {...{ bulkActionType, setBulkActionType, activeTab }}
        />
        <BulkIcon
          name="delete"
          flag={Box.TRASH}
          {...{ bulkActionType, setBulkActionType, activeTab }}
        />
      </div>

      {isSelecting && (
        <button
          onClick={executeBulkAction}
          className={`bulk mediumSans ${selectedMailIds.length === 0 || bulkActionType === null ? "bulk-inactive" : ""}`}
        >
          <span className="material-symbols-outlined">fingerprint</span>
        </button>
      )}
    </div>
  );
}
