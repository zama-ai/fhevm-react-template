import "@/styles/mail-list-item.css";
import { motion } from "framer-motion";
import { Mail } from "@/types";

export interface MailItemProps {
  mail: Mail;
  isChecked: boolean;
  isInboxTab: boolean;
  isSpam: boolean;
  onMailClick: (mail: Mail) => void;
  onCheckboxToggle: (mailId: number) => void;
}

const MailItem: React.FC<MailItemProps> = ({
  mail,
  isChecked,
  isInboxTab,
  isSpam,
  onMailClick,
  onCheckboxToggle,
}) => {
  const { read: isRead, starred: isStarred } = mail;

  const handleMailClick = () => onMailClick(mail);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckboxToggle(mail.id);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      className={`mail-item-list ${isChecked ? "mail-item-list-selected" : ""}`}
      onClick={handleMailClick}
    >
      <div className="mail-item-list-start">
        {/* Checkbox */}
        <span
          className="material-symbols-outlined"
          style={{ color: isChecked ? "rgb(254,210,24)" : "" }}
          onClick={handleCheckboxClick}
        >
          {isChecked ? "check_box" : "check_box_outline_blank"}
        </span>

        {/* Star or Spam */}
        {isInboxTab && isSpam ? (
          <span
            className="material-symbols-outlined"
            style={{ color: "#FED218" }}
          >
            report
          </span>
        ) : (
          <span
            className="material-symbols-outlined"
            style={{ color: isStarred ? "#f4b400" : undefined }}
            onClick={handleStarClick}
          >
            star
          </span>
        )}

        {/* Subject */}
        <p className="boldSans" style={{ color: isRead ? "gray" : undefined }}>
          {mail.subject}
        </p>
      </div>

      {/* Body */}
      <div
        className="mediumRegular mark"
        style={{ color: isRead ? "gray" : undefined }}
      >
        <span className="body">{mail.body}</span>
      </div>

      {/* Timestamp */}
      <p
        className="mediumSans hour"
        style={{ color: isRead ? "gray" : undefined }}
      >
        {mail.timeStamp}
      </p>
    </motion.div>
  );
};

export default MailItem;
