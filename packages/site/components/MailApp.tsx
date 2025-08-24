import "@/styles/mail-app.css";

import { useState, useRef, useEffect } from "react";

import { Toaster } from "react-hot-toast";
import LoadingBar from "react-top-loading-bar";

import MailEditor from "./mail/MailEditor";
import MailSidebar from "./mail/MailSidebar";
import MailHeader from "./mail/MailHeader/index";
import MailItemList from "./mail/MailItemList";
import MailThread from "./mail/MailThread";

import { Mail } from "@/types";
import { TAB_INDEXES, TabIndex } from "@/constants/index";

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
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [filteredMails, setFilteredMails] = useState<Mail[]>([]);

  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [activeMailId, setActiveMailId] = useState<number | null>(null);
  const [selectedMailIds, setSelectedMailIds] = useState<number[]>([]);

  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isForwarding, setIsForwarding] = useState<boolean>(false);

  const [bulkActionType, setBulkActionType] = useState<string>("");
  const loadingBarRef = useRef<LoadingBarRef["current"]>(null);

  const [threadMails, setThreadMails] = useState<Mail[]>([]);

  const [mails, setMails] = useState<Mail[]>([]);
  const refreshMap: Record<number, () => void> = {
    [TAB_INDEXES.STARRED]: () => console.log("refresh starred"),
    [TAB_INDEXES.SENT]: () => console.log("refresh sent"),
    [TAB_INDEXES.ARCHIVE]: () => console.log("refresh archive"),
    [TAB_INDEXES.SPAM]: () => console.log("refresh spam"),
    [TAB_INDEXES.READ]: () => console.log("refresh read"),
    [TAB_INDEXES.TRASH]: () => console.log("refresh trash"),
  };
  const refreshByTab = (tabIndex: number): (() => void) => {
    return refreshMap[tabIndex] ?? (() => {});
  };

  const getMailIds = (): number[] => {
    return mails.map((mail) => mail.id);
  };

  const executeBulkAction = async () => {};

  const onReply = async () => {};

  const onForward = async () => {};

  useEffect(() => {
    setIsSelecting(false);
    setActiveMailId(null);
    setIsReplying(false);
    setIsForwarding(false);
    setSelectedMailIds([]);
  }, [activeTab]);

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
            mailIds={getMailIds()}
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
          {activeMailId === null ? (
            <MailItemList
              mails={mails}
              filteredMails={filteredMails}
              activeTab={activeTab}
              isSearching={isSearching}
              setIsSelecting={setIsSelecting}
              selectedMailIds={selectedMailIds}
              setActiveMailId={setActiveMailId}
              setSelectedMailIds={setSelectedMailIds}
            />
          ) : (
            <MailThread
              activeMail={activeMailId !== null ? mails[activeMailId] : null}
              threadMails={threadMails}
              setThreadMails={setThreadMails}
              onReply={onReply}
              onForward={onForward}
            />
          )}
        </div>
      </div>

      <LoadingBar color="#FED218" ref={loadingBarRef} />
      <Toaster position="bottom-center" toastOptions={{ className: "toast" }} />
    </div>
  );
}
