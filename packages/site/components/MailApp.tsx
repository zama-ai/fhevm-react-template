import "../styles/mail-app.css";

import { useState, useRef } from "react";

import { Toaster } from "react-hot-toast";
import LoadingBar from "react-top-loading-bar";

import MailEditor from "./mail/MailEditor";
import MailSidebar from "./mail/MailSidebar";
import MailHeader from "./mail/MailHeader/index";

import { TAB_INDEXES, TabIndex } from "../constants/index";

export type LoadingBarRef = React.RefObject<{
  continuousStart: () => void;
  staticStart: () => void;
  start: () => void;
  complete: () => void;
  increase: (value: number) => void;
  decrease: (value: number) => void;
  getProgress: () => number;
} | null>;

export default function MailApp() {
  const [isOpenEditor, setIsOpenEditor] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabIndex>(TAB_INDEXES.INBOX);
  const [activeTabCount, setActiveTabCount] = useState<number>(0);

  const [searchValue, setSearchValue] = useState<string>("");

  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [activeMailId, setActiveMailId] = useState<string | null>(null);
  const [selectedMailIds, setSelectedMailIds] = useState<string[]>([]);

  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isForwarding, setIsForwarding] = useState<boolean>(false);

  const [bulkActionType, setBulkActionType] = useState<string>("");

  const loadingBarRef = useRef<LoadingBarRef["current"]>(null);

  const executeBulkAction = async () => {};

  return (
    <div className="mailApp">
      <MailEditor
        isOpenEditor={isOpenEditor}
        setIsOpenEditor={setIsOpenEditor}
      />

      <div className="mailBody">
        <MailSidebar
          activeTab={activeTab}
          activeTabCount={activeTabCount}
          setActiveTab={setActiveTab}
          setIsOpenEditor={setIsOpenEditor}
        />

        <div className="mailContent">
          <MailHeader
            activeTab={activeTab}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            isSelecting={isSelecting}
            setIsSelecting={setIsSelecting}
            activeMailId={activeMailId}
            setActiveMailId={setActiveMailId}
            selectedMailIds={selectedMailIds}
            setSelectedMailIds={setSelectedMailIds}
            isReplying={isReplying}
            setIsReplying={setIsReplying}
            isForwarding={isForwarding}
            setIsForwarding={setIsForwarding}
            bulkActionType={bulkActionType}
            setBulkActionType={setBulkActionType}
            executeBulkAction={executeBulkAction}
            loadingBarRef={loadingBarRef}
          />
        </div>
      </div>

      <LoadingBar color="#FED218" ref={loadingBarRef} />
      <Toaster position="bottom-center" toastOptions={{ className: "toast" }} />
    </div>
  );
}
