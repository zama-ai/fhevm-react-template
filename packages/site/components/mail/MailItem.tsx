import "@/styles/mail-list-item.css";
import { motion } from "framer-motion";
import { Mail, Box } from "@/types";

export interface MailItemProps {
  mail: Mail;
  isChecked: boolean;
  isInboxTab: boolean;
  onMailClick: (mail: Mail) => void;
  onCheckboxToggle: (mailId: number) => void;
}

const MailItem: React.FC<MailItemProps> = ({
  mail,
  isChecked,
  isInboxTab,
  onMailClick,
  onCheckboxToggle,
}) => {
  const isReadMessage = (type: number): boolean => {
    return type === Box.READ;
  };

  const isStarMessage = (type: number): boolean => {
    return type === Box.STAR;
  };

  const isSpamMessage = (type: number): boolean => {
    return type === Box.SPAM;
  };

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
        {isInboxTab && isSpamMessage(mail.box) ? (
          <span
            className="material-symbols-outlined"
            style={{ color: "#FED218" }}
          >
            report
          </span>
        ) : (
          <span
            className="material-symbols-outlined"
            style={{ color: isStarMessage(mail.box) ? "#f4b400" : undefined }}
            onClick={handleStarClick}
          >
            star
          </span>
        )}

        {/* Subject */}
        <p className="boldSans" style={{ color: isReadMessage(mail.box) ? "gray" : undefined }}>
          {'👤 ' + mail.owner}
        </p>
      </div>

      {/* Body */}
      <div
        className="mediumRegular mark"
        style={{ color: isReadMessage(mail.box) ? "gray" : undefined }}
      >
        <span className="body">🔒 Encrypted message – decrypt to view</span>
      </div>

      {/* Timestamp */}
      <p
        className="mediumSans hour"
        style={{ color: isReadMessage(mail.box) ? "gray" : undefined }}
      >
        {mail.time}
      </p>
    </motion.div>
  );
};

export default MailItem;
