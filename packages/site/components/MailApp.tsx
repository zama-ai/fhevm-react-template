import "@/styles/mail-app.css";

import { Toaster } from "react-hot-toast";
import LoadingBar from "react-top-loading-bar";

import MailEditor from "./mail/MailEditor";
import MailSidebar from "./mail/MailSidebar";
import MailHeader from "./mail/MailHeader";
import MailItemList from "./mail/MailItemList";
import MailThread from "./mail/MailThread";
import MailLoading from "./mail/MailLoading";

import { useZmailManager } from "@/hooks/useZmailManager";

export default function MailApp() {
  const { state, setters, refs, methods } = useZmailManager();

  return (
    <div className="mailApp">
      <MailEditor
        threadMails={state.threadMails}
        setThreadMails={setters.setThreadMails}
        isReplying={state.isReplying}
        setIsReplying={setters.setIsReplying}
        isForwarding={state.isForwarding}
        setIsForwarding={setters.setIsForwarding}
        isOpenEditor={state.isOpenEditor}
        setIsOpenEditor={setters.setIsOpenEditor}
        sendMail={methods.sendMail}
        reply={methods.reply}
        forward={methods.forward}
      />

      <div className="mailBody">
        <MailSidebar
          activeTab={state.activeTab}
          activeTabCount={state.mails.length}
          setActiveTab={setters.setActiveTab}
          setIsOpenEditor={setters.setIsOpenEditor}
        />

        <div className="mailContent">
          <MailHeader
            activeTab={state.activeTab}
            searchValue={state.searchValue}
            setSearchValue={setters.setSearchValue}
            isSelecting={state.isSelecting}
            setIsSelecting={setters.setIsSelecting}
            threadMails={state.threadMails}
            mailIds={methods.getMailIds()}
            setThreadMails={setters.setThreadMails}
            setActiveMail={setters.setActiveMail}
            selectedMailIds={state.selectedMailIds}
            setSelectedMailIds={setters.setSelectedMailIds}
            setIsReplying={setters.setIsReplying}
            setIsForwarding={setters.setIsForwarding}
            bulkActionType={state.bulkActionType}
            setBulkActionType={setters.setBulkActionType}
            moveMails={methods.moveMails}
          />
          {state.loading ? (
            <MailLoading />
          ) : state.threadMails.length === 0 ? (
            <MailItemList
              mails={state.mails}
              filteredMails={state.filteredMails}
              activeTab={state.activeTab}
              isSearching={state.isSearching}
              setIsSelecting={setters.setIsSelecting}
              selectedMailIds={state.selectedMailIds}
              setActiveMail={setters.setActiveMail}
              setSelectedMailIds={setters.setSelectedMailIds}
            />
          ) : (
            <MailThread
              activeTab={state.activeTab}
              threadMails={state.threadMails}
              setIsReplying={setters.setIsReplying}
              setIsForwarding={setters.setIsForwarding}
              setIsOpenEditor={setters.setIsOpenEditor}
            />
          )}
        </div>
      </div>

      <LoadingBar color="#FED218" ref={refs.loadingBarRef} />
      <Toaster position="bottom-center" toastOptions={{ className: "toast" }} />
    </div>
  );
}
