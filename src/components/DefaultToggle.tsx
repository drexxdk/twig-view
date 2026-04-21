import styles from "./twigTree.module.css";

type DefaultToggleProps = {
  expanded: boolean;
};

export default function DefaultToggle({ expanded }: DefaultToggleProps) {
  return (
    <svg
      aria-hidden="true"
      className={styles.toggleButtonIconSvg}
      viewBox="0 0 16 16"
    >
      <path
        d="M3 8h10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      {!expanded ? (
        <path
          d="M8 3v10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      ) : null}
    </svg>
  );
}
