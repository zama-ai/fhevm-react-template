import "@/styles/mail-editor.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Mail, Box } from "@/types";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { parseUnixToUTC } from "@/utils";

import Blockies from "react-blockies";
import ReactMarkdown from "react-markdown";

type MailEditorProps = {
  threadMails: Mail[];
  isOpenEditor: boolean;
  isReplying: boolean;
  isForwarding: boolean;
  setIsReplying: (value: boolean) => void;
  setIsForwarding: (value: boolean) => void;
  setIsOpenEditor: React.Dispatch<React.SetStateAction<boolean>>;
  setThreadMails: React.Dispatch<React.SetStateAction<Mail[]>>;
  sendMail: (to: string, subject: string, body: string) => void | Promise<void>;
  forward: (mailId: number, to: string) => void | Promise<void>;
  reply: (
    threadId: number,
    subject: string,
    body: string
  ) => void | Promise<void>;
};

export default function MailEditor({
  threadMails,
  isOpenEditor,
  isReplying,
  isForwarding,
  setIsReplying,
  setIsForwarding,
  setThreadMails,
  sendMail,
  reply,
  forward,
  setIsOpenEditor,
}: MailEditorProps) {
  const { acount } = useMetaMaskEthersSigner();

  const [to, setTo] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [see, setSee] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>("");

  const variants = {
    open: { y: 0, opacity: 1 },
    closed: { y: "110%", opacity: 1 },
  };

  function isMe(owner: string, acount: string): boolean {
    return owner.toLowerCase() === acount.toLowerCase();
  }

  const closeAndReset = (): void => {
    setIsOpenEditor(false);
    setTo("");
    setSubject("");
    setBody("");
    setIsReplying(false);
    setIsForwarding(false);
  };

  const handleSendMail = async (): Promise<void> => {
    setIsOpenEditor(false);
    if (isReplying) {
      await reply(threadMails[0].threadId, subject, body);
      setThreadMails([...threadMails, createMailReply()]);
    } else if (isForwarding) {
      forward(threadMails[0].id, to);
    } else {
      sendMail(to, subject, body);
    }
    closeAndReset();
  };

  const createMailReply = (): Mail => {
    return {
      id: 0,
      threadId: 0,
      owner: String(acount),
      from: String(acount),
      to: to,
      time: parseUnixToUTC(Math.floor(Date.now() / 1000)),
      box: Box.INBOX,
      subject: subject,
      body: body,
    };
  };

  useEffect(() => {
    if (isReplying) {
      setBody("");
      setTo(isMe(threadMails[0].from, acount ?? "") ? threadMails[0].to : threadMails[0].from);
      setSubject(threadMails[0].subject);
    }
  }, [isReplying]);

  useEffect(() => {
    if (isForwarding) {
      setSubject(`Forwarded message: ${threadMails[0].subject}`);
      setBody(threadMails[0].body);
    }
  }, [isForwarding]);

  return (
    <motion.div
      className="editor"
      initial={{ y: "100%", opacity: 0 }}
      animate={isOpenEditor ? variants.open : variants.closed}
    >
      <div className="header-edit">
        <p className="mediumRegular">New Message</p>
        {isOpenEditor && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={closeAndReset}
            className="material-symbols-outlined closeBtn"
          >
            close
          </motion.span>
        )}
      </div>

      <div className="destination">
        <div className="inputEditor mediumSans">
          <p className="mediumRegular">To</p>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input1 mediumSans"
            type="text"
            placeholder="0x0000000000000000000000"
          />
          {to && (
            <motion.div initial={{ x: 20 }} animate={{ x: 0 }}>
              <Blockies
                seed={to}
                size={10}
                scale={3}
                color="rgba(255,255,255,.3)"
                bgColor="#0b57d0"
                spotColor="rgba(255,255,255,.3)"
              />
            </motion.div>
          )}
        </div>

        <div className="inputEditor">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input2"
            type="text"
            placeholder="Subject"
          />
        </div>
      </div>

      <div className="markdownEditor">
        {!see ? (
          <textarea
            className="mediumRegular"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        ) : (
          <div className="view">
            <ReactMarkdown>{body}</ReactMarkdown>
          </div>
        )}

        <div className="toolBoxEditor">
          <div className="toolBoxS">
            <motion.button className="mediumRegular" onClick={handleSendMail}>
              <span>Send</span>
              <span className="material-symbols-outlined">send</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
