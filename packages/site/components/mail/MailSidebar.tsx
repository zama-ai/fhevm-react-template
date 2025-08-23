import "../../styles/side-bar.css";
import { motion } from "framer-motion";
import { TAB_INDEXES, TabIndex } from "../../constants/index";

type MailSidebarProps = {
  activeTabCount: number;
  activeTab: TabIndex;
  setActiveTab: React.Dispatch<React.SetStateAction<TabIndex>>;
  setIsOpenEditor: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MailSidebar({
  activeTab,
  activeTabCount,
  setActiveTab,
  setIsOpenEditor,
}: MailSidebarProps) {
  const menuItems = [
    {
      key: TAB_INDEXES.INBOX,
      label: "Inbox",
      icon: "inbox",
      counter: activeTabCount,
    },
    {
      key: TAB_INDEXES.STARRED,
      label: "Starred",
      icon: "star",
      counter: activeTabCount,
    },
    {
      key: TAB_INDEXES.SENT,
      label: "Sent",
      icon: "send",
      counter: activeTabCount,
    },
    {
      key: TAB_INDEXES.ARCHIVE,
      label: "Archive",
      icon: "archive",
      counter: activeTabCount,
    },
    {
      key: TAB_INDEXES.SPAM,
      label: "Spam",
      icon: "report",
      counter: activeTabCount,
    },
    {
      key: TAB_INDEXES.READ,
      label: "Read",
      icon: "mark_email_read",
      counter: activeTabCount,
    },
    {
      key: TAB_INDEXES.TRASH,
      label: "Trash",
      icon: "delete",
      counter: activeTabCount,
    },
  ];

  return (
    <div className="sideBar">
      <div className="navMenuTitle">
        <motion.img src="/side-bar-image.svg" width={220} />
      </div>

      <button
        onClick={() => setIsOpenEditor(true)}
        className="compose mediumRegular"
      >
        Compose
      </button>

      <ul>
        {menuItems.map((item) => (
          <li
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={activeTab === item.key ? "active" : ""}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="mediumRegular">{item.label}</span>

            {activeTab === item.key && (
              <motion.span className="boldSans inbox-counter">
                {item.counter}
              </motion.span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
