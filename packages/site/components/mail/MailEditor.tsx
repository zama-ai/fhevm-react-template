import "@/styles/mail-editor.css";
import { motion } from "framer-motion";
import { useState } from "react";
import Blockies from "react-blockies";
import ReactMarkdown from "react-markdown";

type MailEditorProps = {
  isOpenEditor: boolean;
  setIsOpenEditor: React.Dispatch<React.SetStateAction<boolean>>;
  sendMail: (to: string, subject: string, body: string) => void | Promise<void>;
};

export default function MailEditor({
  isOpenEditor,
  sendMail,
  setIsOpenEditor,
}: MailEditorProps) {
  const [to, setTo] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [see, setSee] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>("");

  const variants = {
    open: { y: 0, opacity: 1 },
    closed: { y: "110%", opacity: 1 },
  };

  const closeAndReset = (): void => {
    setIsOpenEditor(false);
    setTo("");
    setSubject("");
    setBody("");
  };

  const handleSendMail = (): void => {
    sendMail(to, subject, body);
  };

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
