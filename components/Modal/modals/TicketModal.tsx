import React from "react";
import QRCode from "qrcode.react";
import styles from "./TicketModal.module.css";

interface TicketModalProps {
  url: string;
}

const TicketModal: React.FC<TicketModalProps> = ({ url }: { url: string }) => {
  return (
    <div className={styles.container}>
      <QRCode value={url} size={300} />
    </div>
  );
};

export default TicketModal;
