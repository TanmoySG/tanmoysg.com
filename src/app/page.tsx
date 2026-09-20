"use client";

import styles from "./page.module.css";
import Welcome from "@/components/welcome";
import { useEffect, useState } from "react";
import About from "@/components/about";

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandClosing, setCommandClosing] = useState(false);
  const [command, setCommand] = useState("");

  const closeAbout = () => {
    if (isClosing) return;
    setIsClosing(true);
  };

  const closeCommand = () => {
    if (commandClosing) return;
    setCommandClosing(true);
  };

  const executeCommand = (value: string) => {
    const normalizedCommand = value.trim().replace(/^\/+/, "").toLowerCase();
    if (!normalizedCommand) return;

    const commands = [
      { name: "about-me", action: () => setShowAbout(true) },
      { name: "linkedin", action: () => window.open("https://www.linkedin.com/in/tanmoysg/", "_blank", "noopener,noreferrer") },
      { name: "mail", action: () => { window.location.href = "mailto:tanmoysg@gmail.com"; } },
    ];
    const matchingCommand = commands.find(({ name }) => name.startsWith(normalizedCommand));

    if (!matchingCommand) return;
    matchingCommand.action();

    closeCommand();
  };

  useEffect(() => {
    if (!showAbout) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAbout();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showAbout]);

  useEffect(() => {
    const handleCommandShortcut = (event: KeyboardEvent) => {
      if (event.key === "Escape" && commandOpen) {
        closeCommand();
        return;
      }

      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (event.key === "/") {
        event.preventDefault();
        setCommandOpen(true);
        setCommand("/");
      }
    };

    document.addEventListener("keydown", handleCommandShortcut);
    return () => document.removeEventListener("keydown", handleCommandShortcut);
  }, [commandOpen]);

  return (
    <div className={`${styles.page} ${showAbout ? styles.aboutOpen : ""} ${isClosing ? styles.aboutClosing : ""}`}>
      <Welcome
        className={styles.welcome}
        showOverlay={showAbout}
        onAboutClick={() => setShowAbout(true)}
        commandOpen={commandOpen}
        commandClosing={commandClosing}
        command={command}
        onCommandChange={setCommand}
        onCommandSubmit={executeCommand}
        onCommandCloseComplete={() => {
          setCommandOpen(false);
          setCommandClosing(false);
          setCommand("");
        }}
      />
      {showAbout && (
        <div
          className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ""}`}
          role="presentation"
          onClick={closeAbout}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && isClosing) {
              setShowAbout(false);
              setIsClosing(false);
            }
          }}
        >
          <div
            className={styles.overlayContent}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close about me"
              onClick={closeAbout}
            >
              ×
            </button>
            <div className={styles.pullHandle} aria-hidden="true" />
            <div id="about-title" className={styles.experienceContent}>
              <About />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
