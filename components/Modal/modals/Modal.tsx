import { useModal } from "@/hooks/useModal";
import React from "react";
import styles from "./Modal.module.css";
import Button from "@/components/buttons/Button";

const Modal: React.FC = () => {
  const { showModal, modalContent, title, closeModal } = useModal();

  return showModal ? (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.dialog}>
          <div className={styles.header}>
            <div className={`${styles.title}`}>{title}</div>
            <button onClick={closeModal} className={styles.closeButton}>
              X
            </button>
          </div>
          <div className={styles.body}>{modalContent}</div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Modal;
