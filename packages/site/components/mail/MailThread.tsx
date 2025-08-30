import "@/styles/mail-thread.css";
import { motion } from "framer-motion";
import { Mail } from "@/types";
import { TAB_INDEXES, TabIndex } from "@/constants";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

interface MailThreadProps {
  threadMails: Mail[];
  activeTab: TabIndex;
  setIsReplying: (value: boolean) => void;
  setIsForwarding: (value: boolean) => void;
  setIsOpenEditor: (value: boolean) => void;
}

function MailThread({
  threadMails,
  activeTab,
  setIsReplying,
  setIsForwarding,
  setIsOpenEditor,
}: MailThreadProps) {
  const { acount } = useMetaMaskEthersSigner();

  function isMe(owner: string, acount: string): boolean {
    return owner.toLowerCase() === acount.toLowerCase();
  }

  function onReply(): void {
    setIsReplying(true);
    setIsOpenEditor(true);
  }

  function onForward(): void {
    setIsForwarding(true);
    setIsOpenEditor(true);
  }

  function getTabLabelWithEmoji(tabIndex: TabIndex): string {
    switch (tabIndex) {
      case TAB_INDEXES.INBOX:
        return "Inbox";
      case TAB_INDEXES.STARRED:
        return "Starred";
      case TAB_INDEXES.SENT:
        return "Sent";
      case TAB_INDEXES.ARCHIVE:
        return "Archive";
      case TAB_INDEXES.SPAM:
        return "Spam";
      case TAB_INDEXES.READ:
        return "Read";
      case TAB_INDEXES.TRASH:
        return "Trash";
      default:
        return "Unknown";
    }
  }

  return (
    <motion.div
      className="mail-thread"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="details-header">
        <p className="head mediumRegular">{threadMails[0]?.subject}</p>
        <button className="badge mediumRegular">
          {getTabLabelWithEmoji(activeTab)}
        </button>
      </div>

      <div className="mail-thread-list">
        {threadMails?.map((el, key) => {
          const isMyMail = isMe(el.owner, acount || "");
          return (
            <motion.div
              key={key}
              className={`message-wrapper ${isMyMail ? "me" : "sender"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * key }}
            >
              <motion.img src="/zama-image.jpg" width={32} />
              <div className="message-content">
                <p className="message-body">{el.body}</p>
                <span className="message-time">{el.time}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {threadMails?.length > 0 && (
        <motion.div
          className="reply-forward"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button onClick={onReply}>
            <span className="material-symbols-outlined">reply</span>
            <span>Reply</span>
          </button>
          <button onClick={onForward}>
            <span className="material-symbols-outlined">forward</span>
            <span>Forward</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default MailThread;
