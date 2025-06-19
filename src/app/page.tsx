"use client";

import { ToggleButton } from "@/utils/buttons";
import styles from "./page.module.css";
import Welcome from "@/components/welcome";
import { useState, useRef } from "react";
import About from "@/components/about";
import { FeedbackPopover } from "@/components/feedback/feedback";

export default function Home() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [minimize, setMinimize] = useState(false);

  return (
    <div className={styles.page}>
      <Welcome className={styles.welcome} showOverlay={showOverlay} />
      {
        !showOverlay && (
          <ToggleButton
            buttonText="Know More"
            onClick={() => { setShowOverlay(true); setMinimize(true); }}
            className={styles.knowMoreButton}
          />
        )
      }
      {showOverlay && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>

            <About className={styles.welcome} />
            <ToggleButton
              buttonText="Show Less"
              onClick={() => {
                setMinimize(false);
                setShowOverlay(false);
              }}
              className={styles.showLessButton}
            />
          </div>
        </div>
      )}
      <FeedbackPopover minimize={minimize} />
    </div>
  );
}
