import { fonts } from "@/utils/fonts";
import { Dot } from "@/utils/shared";
import shared from "../../utils/shared.module.css"
import styles from "./sections.module.css";

export default function Pages({ onAboutClick, commandOpen, commandClosing, command, onCommandChange, onCommandSubmit, onCommandCloseComplete }: { onAboutClick?: () => void, commandOpen?: boolean, commandClosing?: boolean, command?: string, onCommandChange?: (value: string) => void, onCommandSubmit?: (value: string) => void, onCommandCloseComplete?: () => void }) {
    return (
        <div style={{ fontSize: "1.2rem", marginTop: "50px", marginBottom: "20px" }} className={fonts.taviraj.className}>
            <button type="button" onClick={onAboutClick} className={`${styles.pageButton} ${styles.socialLinks} ${shared.magnify}`}>
                /about-me
            </button>
            <Dot />
            <a href="https://www.linkedin.com/in/tanmoysg/" target="_blank" rel="noopener noreferrer" className={`${styles.socialLinks} ${shared.magnify}`}>
                /linkedin
            </a>
            <Dot />
            <a href="mailto:tanmoysg@gmail.com" target="_blank" rel="noopener noreferrer" className={`${styles.socialLinks} ${shared.magnify}`}>
                /mail
            </a>
            {commandOpen && (
                <form
                    className={`${styles.commandForm} ${commandClosing ? styles.commandFormClosing : ""}`}
                    onAnimationEnd={commandClosing ? onCommandCloseComplete : undefined}
                    onSubmit={(event) => {
                        event.preventDefault();
                        onCommandSubmit?.(command ?? "");
                    }}
                >
                    <input
                        autoFocus
                        className={styles.commandInput}
                        value={command ?? "/"}
                        onChange={(event) => onCommandChange?.(event.target.value)}
                        aria-label="Enter command"
                    />
                </form>
            )}
        </div>
    );
}
