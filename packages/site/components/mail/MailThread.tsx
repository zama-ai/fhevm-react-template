import "@/styles/mail-thread.css";
import { useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Mail } from "@/types";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

interface MailThreadProps {
  activeMail: Mail | null;
  threadMails: Mail[];
  setThreadMails: (data: Mail[]) => void;
  onReply: () => void;
  onForward: () => void;
}

function MailThread({
  activeMail,
  threadMails,
  setThreadMails,
  onReply,
  onForward,
}: MailThreadProps) {
  const { acount } = useMetaMaskEthersSigner();

  const fetchReplies = async () => {
    try {
      const mails: Mail[] = [];
      setThreadMails(mails);
    } catch (error) {
      toast.error("Failed to fetch replies.");
    }
  };

  function isMe(owner: string, acount: string): boolean {
    return owner.toLowerCase() === acount.toLowerCase();
  }

  function getMailOwnerLabel(owner: string, acount: string): string {
    if (!owner || !acount) return "Unknown";
    return isMe(owner, acount) ? "Me" : "Sender";
  }

  useEffect(() => {
    if (activeMail) fetchReplies();
  }, [activeMail]);

  return (
    <motion.div
      className="mail-thread"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="details-header">
        <p className="head mediumRegular">{activeMail?.subject}</p>
        <button className="badge mediumRegular">Inbox</button>
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
