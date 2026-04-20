import React from "react";
import styles from "./simple.module.css";
import useLineWidthDpi from "../utils/useLineWidthDpi";

export default function Simple() {
  const { lineWidthDpi } = useLineWidthDpi(1);

  return (
    <main>
      <section
        className={styles.tree}
        style={
          {
            "--line-width": `${lineWidthDpi}px`,
            "--line-radius": "10px",
          } as React.CSSProperties
        }
      >
        <ul>
          <li>
            <span className={`${styles.itemRow} ${styles.leafRow}`}>
              test 1
            </span>
          </li>
          <li>
            <span className={`${styles.itemRow} ${styles.leafRow}`}>
              test 2
            </span>
          </li>
          <li>
            <input type="checkbox" id="1" defaultChecked />
            <label
              className={`${styles.itemRow} ${styles.toggleRow}`}
              htmlFor="1"
            >
              <i></i>
              <span>test 3</span>
            </label>
            <ul>
              <li>
                <span className={`${styles.itemRow} ${styles.leafRow}`}>
                  test 3.1
                </span>
              </li>
              <li>
                <input type="checkbox" id="2" />
                <label
                  className={`${styles.itemRow} ${styles.toggleRow}`}
                  htmlFor="2"
                >
                  <i></i>
                  <span>test 3.2</span>
                </label>
                <ul>
                  <li>
                    <span className={`${styles.itemRow} ${styles.leafRow}`}>
                      test 3.2.1
                    </span>
                  </li>
                  <li>
                    <span className={`${styles.itemRow} ${styles.leafRow}`}>
                      test 3.2.2
                    </span>
                  </li>
                  <li>
                    <span className={`${styles.itemRow} ${styles.leafRow}`}>
                      test 3.2.3
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            <span className={`${styles.itemRow} ${styles.leafRow}`}>
              test 4
            </span>
          </li>
          <li>
            <input type="checkbox" id="3" />
            <label
              className={`${styles.itemRow} ${styles.toggleRow}`}
              htmlFor="3"
            >
              <i></i>
              <span>test 5</span>
            </label>
            <ul>
              <li>
                <span className={`${styles.itemRow} ${styles.leafRow}`}>
                  test 5.1
                </span>
              </li>
              <li>
                <span className={`${styles.itemRow} ${styles.leafRow}`}>
                  test 5.2
                </span>
              </li>
              <li>
                <span className={`${styles.itemRow} ${styles.leafRow}`}>
                  test 5.3
                </span>
              </li>
            </ul>
          </li>
        </ul>
      </section>
      <section
        style={{
          width: "min(900px, 100%)",
          borderRadius: 16,
          padding: 24,
          background: "rgba(2,6,23,0.6)",
          border: "1px solid rgba(148,163,184,0.12)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Simple demo</h2>
        <p style={{ marginTop: 8, color: "#94a3b8" }}>
          This is a minimal demo route called "simple". Use the buttons below to
          navigate back to the main demo.
        </p>

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={() => {
              history.pushState(null, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
          >
            Back to demo
          </button>
        </div>
      </section>
    </main>
  );
}
