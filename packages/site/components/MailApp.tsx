import "../styles/mail-app.css";
import MailEditor from "./mail/MailEditor";
import MailSidebar from "./mail/MailSidebar";
import MailHeader from "./mail/MailHeader/index";

import { useState } from "react";

import { TAB_INDEXES, TabIndex } from "../constants/index";

export default function MailApp() {
  const [isOpenEditor, setIsOpenEditor] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabIndex>(TAB_INDEXES.INBOX);
  const [activeTabCount, setActiveTabCount] = useState<number>(0);

  const [searchValue, setSearchValue] = useState<string>("");

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
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
        </div>
      </div>
    </div>
  );
}
