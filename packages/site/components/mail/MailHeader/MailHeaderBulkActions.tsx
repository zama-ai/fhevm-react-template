import React from "react";
import "@/styles/mail-header-bulk-actions.css";
import { TAB_INDEXES, TabIndex } from "@/constants";

type BulkIconProps = {
  name: string;
  flag: string;
  activeTab: TabIndex;
  bulkActionType: string;
  setBulkActionType: (flag: string) => void;
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
  activeMailId: number | null;
  setActiveMailId: (value: number | null) => void;
  setIsReplying: (value: boolean) => void;
  setIsForwarding: (value: boolean) => void;
  selectedMailIds: number[];
  setSelectedMailIds: (ids: number[]) => void;
  mailIds: number[];
  bulkActionType: string;
  setBulkActionType: (value: string) => void;
  executeBulkAction: () => void | Promise<void>;
};

export default function HeaderBulkActions({
  activeTab,
  isSelecting,
  setIsSelecting,
  activeMailId,
  setActiveMailId,
  setIsReplying,
  setIsForwarding,
  selectedMailIds,
  setSelectedMailIds,
  mailIds,
  bulkActionType,
  setBulkActionType,
  executeBulkAction,
}: HeaderBulkActionsProps) {
  const handleBackClick = () => {
    setIsSelecting(false);
    setActiveMailId(null);
    setIsReplying(false);
    setIsForwarding(false);
    setSelectedMailIds([]);
  };

  const handleCheckboxClick = () => {
    setIsSelecting(!isSelecting);
    if (isSelecting) setBulkActionType("");
    if (selectedMailIds.length === 0) setSelectedMailIds(mailIds);
    else setSelectedMailIds([]);
  };

  return (
    <div
      className={`header-tools-row ${
        activeTab === TAB_INDEXES.TRASH ? "disabled-action" : ""
      }`}
    >
      {activeMailId ? (
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
        <>
          <BulkIcon
            name="archive"
            flag="archive-flag"
            {...{ bulkActionType, setBulkActionType, activeTab }}
          />
          <BulkIcon
            name="star"
            flag="star-flag"
            {...{ bulkActionType, setBulkActionType, activeTab }}
          />
          <BulkIcon
            name="report"
            flag="spam-flag"
            {...{ bulkActionType, setBulkActionType, activeTab }}
          />
          <BulkIcon
            name="mark_email_read"
            flag="read-flag"
            {...{ bulkActionType, setBulkActionType, activeTab }}
          />
          <BulkIcon
            name="delete"
            flag="trash-flag"
            {...{ bulkActionType, setBulkActionType, activeTab }}
          />
        </>
      </div>

      {isSelecting && (
        <button
          onClick={executeBulkAction}
          className={`bulk mediumSans ${
            selectedMailIds.length === 0 ? "bulk-inactive" : ""
          }`}
        >
          <span className="material-symbols-outlined">fingerprint</span>
        </button>
      )}
    </div>
  );
}
