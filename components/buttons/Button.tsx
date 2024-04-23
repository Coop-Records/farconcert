import React from "react";
import styles from "./Button.module.css";

interface Props {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<Props> = ({
  onClick,
  children,
  className,
  disabled,
}) => {
  return (
    <button
      className={`${styles.btn} ${className || ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      <div className={styles.btnContainer}>{children}</div>
    </button>
  );
};

export default Button;
