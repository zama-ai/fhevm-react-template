import "@/styles/mail-app.css";

import { Toaster } from "react-hot-toast";
import LoadingBar from "react-top-loading-bar";

import MailEditor from "./mail/MailEditor";
import MailSidebar from "./mail/MailSidebar";
import MailHeader from "./mail/MailHeader";
import MailItemList from "./mail/MailItemList";
import MailThread from "./mail/MailThread";

import { useZmailManager } from "@/hooks/useZmailManager";

export default function MailApp() {
  const { state, setters, refs, methods } = useZmailManager();

  return (
    <div className="mailApp">
      <MailEditor
        isOpenEditor={state.isOpenEditor}
        setIsOpenEditor={setters.setIsOpenEditor}
        sendMail={methods.sendMail}
      />

      <div className="mailBody">
        <MailSidebar
          activeTab={state.activeTab}
          activeTabCount={state.activeTabCount}
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
            activeMailId={state.activeMailId}
            mailIds={methods.getMailIds()}
            setActiveMailId={setters.setActiveMailId}
            selectedMailIds={state.selectedMailIds}
            setSelectedMailIds={setters.setSelectedMailIds}
            isReplying={state.isReplying}
            setIsReplying={setters.setIsReplying}
            isForwarding={state.isForwarding}
            setIsForwarding={setters.setIsForwarding}
            bulkActionType={state.bulkActionType}
            setBulkActionType={setters.setBulkActionType}
            executeBulkAction={methods.executeBulkAction}
            loadingBarRef={refs.loadingBarRef}
          />
          {state.activeMailId === null ? (
            <MailItemList
              mails={state.mails}
              filteredMails={state.filteredMails}
              activeTab={state.activeTab}
              isSearching={state.isSearching}
              setIsSelecting={setters.setIsSelecting}
              selectedMailIds={state.selectedMailIds}
              setActiveMailId={setters.setActiveMailId}
              setSelectedMailIds={setters.setSelectedMailIds}
            />
          ) : (
            <MailThread
              activeMail={state.activeMailId !== null ? state.mails[state.activeMailId] : null}
              threadMails={state.threadMails}
              setThreadMails={setters.setThreadMails}
              onReply={methods.onReply}
              onForward={methods.onForward}
            />
          )}
        </div>
      </div>

      <LoadingBar color="#FED218" ref={refs.loadingBarRef} />
      <Toaster position="bottom-center" toastOptions={{ className: "toast" }} />
    </div>
  );
}
