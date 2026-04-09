import type { CSSProperties } from "react";
import styles from "./tree-view.module.css";
import { joinClassNames } from "./TreeView.utils";

type DefaultToggleProps = {
  expanded: boolean;
  className?: string;
  style?: CSSProperties;
};

export default function DefaultToggle({
  expanded,
  className,
  style,
}: DefaultToggleProps) {
  return (
    <span
      aria-hidden="true"
      className={joinClassNames(styles.defaultToggleIcon, className)}
      style={style}
    >
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        {expanded ? (
          <path
            d="M6 12h12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : (
          <>
            <path
              d="M6 12h12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M12 6v12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        )}
      </svg>
    </span>
  );
}
